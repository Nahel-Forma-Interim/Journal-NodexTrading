// Simple localStorage-based store for the trading app

export interface Trade {
  id: string;
  date: string;
  pair: string;
  type: "buy" | "sell";
  entryPrice: number;
  exitPrice: number;
  amountInvested: number; // $ invested (full capital or custom)
  feePercent: number; // fees in %
  fees: number; // calculated fees in $
  pnl: number;
  pnlPercent: number;
  notes: string;
  tags: string[];
  screenshot?: string;
  // Legacy fields kept for backward compat
  quantity?: number;
}

export interface UserSettings {
  startingCapital: number;
  displayName: string;
  syncCode: string;
  autoBackupEnabled: boolean;
}

export interface TradingPlan {
  id: string;
  name: string;
  strategy: string;
  tradingHours: string;
  preferredSessions: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folder?: string;
  createdAt: string;
  updatedAt: string;
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Émet un event global à chaque mutation du store.
 * Le CloudSyncProvider l'écoute pour pousser vers Supabase.
 * Payload : { collection: "trade"|"plan"|"note"|"settings", op: "upsert"|"delete", item?, id? }
 */
export type SyncPayload =
  | { collection: "trade"; op: "upsert"; item: Trade }
  | { collection: "trade"; op: "delete"; id: string }
  | { collection: "plan"; op: "upsert"; item: TradingPlan }
  | { collection: "plan"; op: "delete"; id: string }
  | { collection: "note"; op: "upsert"; item: Note }
  | { collection: "note"; op: "delete"; id: string }
  | { collection: "settings"; op: "upsert"; item: UserSettings };

function notifyChange(payload: SyncPayload): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<SyncPayload>("nodex-data-changed", { detail: payload }));
}

// ============ USER SETTINGS ============
const defaultSettings: UserSettings = {
  startingCapital: 1000,
  displayName: "Nahel",
  syncCode: "",
  autoBackupEnabled: false,
};

export function getSettings(): UserSettings {
  return getItem<UserSettings>("nahel_settings", defaultSettings);
}

export function saveSettings(settings: UserSettings): void {
  setItem("nahel_settings", settings);
  notifyChange({ collection: "settings", op: "upsert", item: settings });
}

// ============ CURRENT CAPITAL ============
// Capital = starting capital + sum of all trade PnL (compound effect)
export function getCurrentCapital(): number {
  const settings = getSettings();
  const trades = getTrades();
  // Trades are stored newest first, so reverse to get chronological order
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  return Math.round((settings.startingCapital + totalPnl) * 100) / 100;
}

// Capital at a specific point in trade history (before trade at index)
export function getCapitalBeforeTrade(tradeIndex: number): number {
  const settings = getSettings();
  const trades = getTrades();
  // trades are newest first, so trades after index (lower indices) are newer
  // Sum PnL of all trades that happened BEFORE this one (higher indices = older)
  let capital = settings.startingCapital;
  for (let i = trades.length - 1; i > tradeIndex; i--) {
    capital += trades[i].pnl;
  }
  return Math.round(capital * 100) / 100;
}

// ============ TRADE OUTCOME (win / loss / breakeven) ============
export type TradeOutcome = "win" | "loss" | "breakeven";

/**
 * Classifie un trade en win / loss / breakeven en se basant
 * SUR LES PRIX (entry vs exit), pas sur le PnL net.
 *
 * Un trade BE (entry == exit) reste BE même si les frais le rendent négatif.
 * Exemple : entry 0,2311 / exit 0,2311 / -5 € de frais → BREAKEVEN.
 *
 * Tolérance epsilon (1e-9) pour gérer la précision flottante JavaScript.
 */
export function outcomeFromPrices(
  entryPrice: number,
  exitPrice: number,
  type: "buy" | "sell" = "buy"
): TradeOutcome {
  const eps = 1e-9;
  if (exitPrice <= 0 || entryPrice <= 0) return "breakeven";
  const diff = exitPrice - entryPrice;
  if (Math.abs(diff) < eps) return "breakeven";
  if (type === "buy") return diff > 0 ? "win" : "loss";
  return diff < 0 ? "win" : "loss"; // sell
}

export function getTradeOutcome(trade: Trade): TradeOutcome {
  return outcomeFromPrices(trade.entryPrice, trade.exitPrice, trade.type);
}

// ============ TRADE PNL CALCULATION ============
export function calculateTradePnl(
  type: "buy" | "sell",
  entryPrice: number,
  exitPrice: number,
  amountInvested: number,
  feePercent: number
): { pnl: number; pnlPercent: number; fees: number } {
  if (entryPrice <= 0 || amountInvested <= 0) {
    return { pnl: 0, pnlPercent: 0, fees: 0 };
  }

  // Gross PnL: how much the position gained/lost
  let grossPnl: number;
  if (type === "buy") {
    grossPnl = exitPrice > 0
      ? ((exitPrice - entryPrice) / entryPrice) * amountInvested
      : 0;
  } else {
    grossPnl = exitPrice > 0
      ? ((entryPrice - exitPrice) / entryPrice) * amountInvested
      : 0;
  }

  // Fees: applied on entry + exit (% of amount)
  const fees = Math.round(amountInvested * (feePercent / 100) * 2 * 100) / 100;

  // Net PnL
  const pnl = Math.round((grossPnl - fees) * 100) / 100;
  const pnlPercent = amountInvested > 0
    ? Math.round((pnl / amountInvested) * 10000) / 100
    : 0;

  return { pnl, pnlPercent, fees };
}

// ============ TRADES ============
export function getTrades(): Trade[] {
  return getItem<Trade[]>("neldia_trades", []);
}

export function saveTrade(trade: Trade): void {
  const trades = getTrades();
  const idx = trades.findIndex((t) => t.id === trade.id);
  if (idx >= 0) trades[idx] = trade;
  else trades.unshift(trade);
  setItem("neldia_trades", trades);
  notifyChange({ collection: "trade", op: "upsert", item: trade });
  // Auto-backup: regenerate backup code after every change
  const settings = getSettings();
  if (settings.autoBackupEnabled) {
    refreshAutoBackup();
  }
}

export function deleteTrade(id: string): void {
  const trades = getTrades().filter((t) => t.id !== id);
  setItem("neldia_trades", trades);
  notifyChange({ collection: "trade", op: "delete", id });
  // Auto-backup
  const settings = getSettings();
  if (settings.autoBackupEnabled) {
    refreshAutoBackup();
  }
}

// ============ PLANS ============
export function getPlans(): TradingPlan[] {
  return getItem<TradingPlan[]>("neldia_plans", []);
}

export function savePlan(plan: TradingPlan): void {
  const plans = getPlans();
  const idx = plans.findIndex((p) => p.id === plan.id);
  if (idx >= 0) plans[idx] = plan;
  else plans.unshift(plan);
  setItem("neldia_plans", plans);
  notifyChange({ collection: "plan", op: "upsert", item: plan });
}

export function deletePlan(id: string): void {
  const plans = getPlans().filter((p) => p.id !== id);
  setItem("neldia_plans", plans);
  notifyChange({ collection: "plan", op: "delete", id });
}

// ============ NOTES ============
export function getNotes(): Note[] {
  return getItem<Note[]>("neldia_notes", []);
}

export function saveNote(note: Note): void {
  const notes = getNotes();
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) notes[idx] = note;
  else notes.unshift(note);
  setItem("neldia_notes", notes);
  notifyChange({ collection: "note", op: "upsert", item: note });
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter((n) => n.id !== id);
  setItem("neldia_notes", notes);
  notifyChange({ collection: "note", op: "delete", id });
}

// ============ STATS ============
export function getStats() {
  const trades = getTrades();
  const settings = getSettings();
  const totalTrades = trades.length;

  // Classification basée sur entryPrice vs exitPrice (PRIX, pas PnL).
  // Un BE (entry == exit) n'est NI un win NI un loss, même si frais > 0.
  const winTrades = trades.filter((t) => getTradeOutcome(t) === "win");
  const lossTrades = trades.filter((t) => getTradeOutcome(t) === "loss");
  const beTrades = trades.filter((t) => getTradeOutcome(t) === "breakeven");
  const wins = winTrades.length;
  const losses = lossTrades.length;
  const breakevens = beTrades.length;

  // Win rate = wins / (wins + losses), BE exclus du dénominateur.
  const decisiveTrades = wins + losses;
  const winRate = decisiveTrades > 0 ? (wins / decisiveTrades) * 100 : 0;

  const totalPnl = Math.round(trades.reduce((sum, t) => sum + t.pnl, 0) * 100) / 100;
  const totalFees = Math.round(trades.reduce((sum, t) => sum + t.fees, 0) * 100) / 100;
  const avgWin = wins > 0 ? winTrades.reduce((s, t) => s + t.pnl, 0) / wins : 0;
  const avgLoss = losses > 0 ? lossTrades.reduce((s, t) => s + t.pnl, 0) / losses : 0;
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
  const bestTrade = trades.length > 0 ? Math.max(...trades.map((t) => t.pnl)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map((t) => t.pnl)) : 0;

  // Capital growth with compound effect
  const startingCapital = settings.startingCapital;
  const currentCapital = startingCapital + totalPnl;
  const capitalGrowthPercent = startingCapital > 0
    ? Math.round(((currentCapital - startingCapital) / startingCapital) * 10000) / 100
    : 0;

  // Equity curve (with actual capital, showing compound)
  let equity = startingCapital;
  const equityCurve = trades
    .slice()
    .reverse()
    .map((t) => {
      equity += t.pnl;
      return { date: t.date, equity: Math.round(equity * 100) / 100 };
    });

  // Capital history for compound tracking
  let capitalTrack = startingCapital;
  const capitalHistory = trades
    .slice()
    .reverse()
    .map((t) => {
      const growthPct = startingCapital > 0
        ? Math.round(((capitalTrack + t.pnl - startingCapital) / startingCapital) * 10000) / 100
        : 0;
      capitalTrack += t.pnl;
      return { date: t.date, capital: Math.round(capitalTrack * 100) / 100, growthPct };
    });

  return {
    totalTrades,
    wins,
    losses,
    breakevens,
    winRate,
    totalPnl,
    totalFees,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    profitFactor,
    bestTrade: Math.round(bestTrade * 100) / 100,
    worstTrade: Math.round(worstTrade * 100) / 100,
    equityCurve,
    startingCapital,
    currentCapital: Math.round(currentCapital * 100) / 100,
    capitalGrowthPercent,
    capitalHistory,
  };
}

// ============ AUTO BACKUP ============
const AUTO_BACKUP_KEY = "neldia_auto_backup";
const AUTO_BACKUP_TS_KEY = "neldia_auto_backup_ts";

export function refreshAutoBackup(): void {
  const code = exportAllData();
  setItem(AUTO_BACKUP_KEY, code);
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTO_BACKUP_TS_KEY, new Date().toISOString());
  }
}

export function getAutoBackup(): { code: string; updatedAt: string } | null {
  if (typeof window === "undefined") return null;
  const code = localStorage.getItem(AUTO_BACKUP_KEY);
  const ts = localStorage.getItem(AUTO_BACKUP_TS_KEY);
  if (!code) return null;
  return { code: JSON.parse(code), updatedAt: ts || "" };
}

export function enableAutoBackup(): void {
  const settings = getSettings();
  saveSettings({ ...settings, autoBackupEnabled: true });
  refreshAutoBackup();
}

export function disableAutoBackup(): void {
  const settings = getSettings();
  saveSettings({ ...settings, autoBackupEnabled: false });
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTO_BACKUP_KEY);
    localStorage.removeItem(AUTO_BACKUP_TS_KEY);
  }
}

// ============ DATA SYNC (Export/Import) ============
export function exportAllData(): string {
  const data = {
    version: 2,
    settings: getSettings(),
    trades: getTrades(),
    plans: getPlans(),
    notes: getNotes(),
    exportedAt: new Date().toISOString(),
  };
  // Convert to base64
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

export function importAllData(code: string): boolean {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const data = JSON.parse(json);
    if (!data.version) return false;

    if (data.settings) saveSettings({ ...data.settings, autoBackupEnabled: true });
    if (data.trades) setItem("neldia_trades", data.trades);
    if (data.plans) setItem("neldia_plans", data.plans);
    if (data.notes) setItem("neldia_notes", data.notes);
    // Enable auto-backup after successful import
    refreshAutoBackup();
    return true;
  } catch {
    return false;
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
