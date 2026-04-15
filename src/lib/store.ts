// Simple localStorage-based store for the trading app

export interface Trade {
  id: string;
  date: string;
  pair: string;
  type: "buy" | "sell";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  fees: number;
  pnl: number;
  pnlPercent: number;
  notes: string;
  tags: string[];
  screenshot?: string;
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

// Trades
export function getTrades(): Trade[] {
  return getItem<Trade[]>("neldia_trades", []);
}

export function saveTrade(trade: Trade): void {
  const trades = getTrades();
  const idx = trades.findIndex((t) => t.id === trade.id);
  if (idx >= 0) trades[idx] = trade;
  else trades.unshift(trade);
  setItem("neldia_trades", trades);
}

export function deleteTrade(id: string): void {
  const trades = getTrades().filter((t) => t.id !== id);
  setItem("neldia_trades", trades);
}

// Plans
export function getPlans(): TradingPlan[] {
  return getItem<TradingPlan[]>("neldia_plans", []);
}

export function savePlan(plan: TradingPlan): void {
  const plans = getPlans();
  const idx = plans.findIndex((p) => p.id === plan.id);
  if (idx >= 0) plans[idx] = plan;
  else plans.unshift(plan);
  setItem("neldia_plans", plans);
}

export function deletePlan(id: string): void {
  const plans = getPlans().filter((p) => p.id !== id);
  setItem("neldia_plans", plans);
}

// Notes
export function getNotes(): Note[] {
  return getItem<Note[]>("neldia_notes", []);
}

export function saveNote(note: Note): void {
  const notes = getNotes();
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) notes[idx] = note;
  else notes.unshift(note);
  setItem("neldia_notes", notes);
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter((n) => n.id !== id);
  setItem("neldia_notes", notes);
}

// Stats helpers
export function getStats() {
  const trades = getTrades();
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.pnl > 0).length;
  const losses = trades.filter((t) => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fees, 0);
  const avgWin = wins > 0 ? trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0) / wins : 0;
  const avgLoss = losses > 0 ? trades.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0) / losses : 0;
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
  const bestTrade = trades.length > 0 ? Math.max(...trades.map((t) => t.pnl)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map((t) => t.pnl)) : 0;

  // Equity curve
  let equity = 0;
  const equityCurve = trades
    .slice()
    .reverse()
    .map((t) => {
      equity += t.pnl;
      return { date: t.date, equity };
    });

  return {
    totalTrades,
    wins,
    losses,
    winRate,
    totalPnl,
    totalFees,
    avgWin,
    avgLoss,
    profitFactor,
    bestTrade,
    worstTrade,
    equityCurve,
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
