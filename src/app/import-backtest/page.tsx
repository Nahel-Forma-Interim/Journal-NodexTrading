"use client";

import { useState } from "react";
import Link from "next/link";
import { saveTrade, getTrades, getTradeOutcome, outcomeFromPrices, type Trade } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

type ParsedTrade = {
  date: string;
  pair: string;
  investi: number;
  entry: number;
  exit: number;
  pnl: number;
  pct: number;
  notes?: string;
};

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function buildTrade(t: ParsedTrade): Trade {
  const feePercent = 0.2;
  const fees = (t.investi * feePercent / 100) * 2;
  return {
    id: uuid(),
    date: t.date,
    pair: t.pair.includes("/") ? t.pair : `${t.pair}/USDT`,
    type: "buy",
    entryPrice: t.entry,
    exitPrice: t.exit,
    amountInvested: t.investi,
    feePercent,
    fees,
    pnl: t.pnl,
    pnlPercent: t.pct,
    notes: t.notes || "",
    tags: ["import"],
  };
}

// Parse un tableau collé : 1 trade par ligne, colonnes séparées par tab/espaces
// Format attendu : Date | Pair | Type | Investi | Entry | Sortie | PnL | %
function parseTable(text: string): { trades: ParsedTrade[]; errors: string[] } {
  const trades: ParsedTrade[] = [];
  const errors: string[] = [];
  const lines = text.trim().split("\n").filter((l) => l.trim().length > 0);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip header line
    if (/date.*pair|paire.*type/i.test(line) && i === 0) continue;

    // Split par tabs ou multiples espaces ou pipes
    const cols = line
      .split(/\t+|\s{2,}|\|/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (cols.length < 6) {
      errors.push(`Ligne ${i + 1} : pas assez de colonnes (${cols.length}). Attendu : Date Pair [Type] Investi Entry Sortie PnL [%]`);
      continue;
    }

    try {
      // Tente plusieurs formats : avec ou sans Type, avec ou sans %
      const cleanNum = (s: string) => parseFloat(s.replace(/[$€\s+,]/g, "").replace(/%/g, ""));

      // Format probable : Date | Pair | (Type) | Investi | Entry | Exit | PnL | (%)
      let date = cols[0];
      let pair = cols[1];
      let typeIdx = /^(achat|vente|buy|sell)/i.test(cols[2]) ? 2 : -1;
      let offset = typeIdx >= 0 ? 1 : 0;

      const investi = cleanNum(cols[2 + offset]);
      const entry = cleanNum(cols[3 + offset]);
      const exit = cleanNum(cols[4 + offset]);
      const pnl = cleanNum(cols[5 + offset]);
      const pct = cols[6 + offset] ? cleanNum(cols[6 + offset]) : ((exit - entry) / entry * 100);

      if (isNaN(investi) || isNaN(entry) || isNaN(exit) || isNaN(pnl)) {
        errors.push(`Ligne ${i + 1} : valeurs numériques invalides`);
        continue;
      }

      trades.push({
        date: date.match(/\d{4}-\d{2}-\d{2}/) ? date : "2026-04-26",
        pair: pair.toUpperCase(),
        investi,
        entry,
        exit,
        pnl,
        pct,
      });
    } catch (e) {
      errors.push(`Ligne ${i + 1} : erreur de parsing — ${(e as Error).message}`);
    }
  }

  return { trades, errors };
}

export default function ImportTradesPage() {
  const [tab, setTab] = useState<"paste" | "form">("paste");
  const [pasteText, setPasteText] = useState("");
  const [parsedTrades, setParsedTrades] = useState<ParsedTrade[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state pour saisie manuelle
  const [formTrades, setFormTrades] = useState<ParsedTrade[]>([
    { date: "2026-04-26", pair: "ARB", investi: 0, entry: 0, exit: 0, pnl: 0, pct: 0 },
  ]);

  const handleParse = () => {
    const result = parseTable(pasteText);
    setParsedTrades(result.trades);
    setParseErrors(result.errors);
  };

  const handleImport = async (toImport: ParsedTrade[]) => {
    if (toImport.length === 0) return;
    setImporting(true);
    setImportedCount(0);
    for (let i = 0; i < toImport.length; i++) {
      const trade = buildTrade(toImport[i]);
      saveTrade(trade);
      setImportedCount(i + 1);
      await new Promise((r) => setTimeout(r, 50));
    }
    setImporting(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setParsedTrades([]);
      setPasteText("");
      setFormTrades([{ date: "2026-04-26", pair: "ARB", investi: 0, entry: 0, exit: 0, pnl: 0, pct: 0 }]);
    }, 4000);
  };

  const handleAddFormRow = () => {
    setFormTrades([
      ...formTrades,
      { date: "2026-04-26", pair: "ARB", investi: 0, entry: 0, exit: 0, pnl: 0, pct: 0 },
    ]);
  };

  const handleRemoveFormRow = (idx: number) => {
    setFormTrades(formTrades.filter((_, i) => i !== idx));
  };

  const updateFormRow = (idx: number, field: keyof ParsedTrade, value: string | number) => {
    const next = [...formTrades];
    if (field === "pair" || field === "date") {
      next[idx] = { ...next[idx], [field]: value as string };
    } else {
      const num = typeof value === "string" ? parseFloat(value) || 0 : value;
      next[idx] = { ...next[idx], [field]: num };
      // Auto-calc pct si entry/exit changent et pnl pas saisi manuellement
      if ((field === "entry" || field === "exit" || field === "investi") && next[idx].entry > 0 && next[idx].exit > 0 && next[idx].investi > 0) {
        const pct = ((next[idx].exit - next[idx].entry) / next[idx].entry) * 100;
        const pnl = (pct / 100) * next[idx].investi - (next[idx].investi * 0.4 / 100); // -0.4% fees aller/retour
        if (next[idx].pct === 0 || field === "entry" || field === "exit") next[idx].pct = parseFloat(pct.toFixed(2));
        if (next[idx].pnl === 0 || field === "entry" || field === "exit") next[idx].pnl = parseFloat(pnl.toFixed(2));
      }
    }
    setFormTrades(next);
  };

  const validFormTrades = formTrades.filter((t) => t.investi > 0 && t.entry > 0 && t.exit > 0);

  // Stats existantes journal — classification par PRIX (BE = entry == exit, exclu du WR)
  const existingTrades = typeof window !== "undefined" ? getTrades() : [];
  const existingPnl = existingTrades.reduce((s, t) => s + t.pnl, 0);
  const existingWins = existingTrades.filter((t) => getTradeOutcome(t) === "win").length;
  const existingLosses = existingTrades.filter((t) => getTradeOutcome(t) === "loss").length;
  const existingDecisive = existingWins + existingLosses;
  const existingWR = existingDecisive > 0
    ? ((existingWins / existingDecisive) * 100).toFixed(1)
    : "0";

  // Stats du batch en cours (import = type "buy" par défaut)
  const tradesToImport = tab === "paste" ? parsedTrades : validFormTrades;
  const batchWins = tradesToImport.filter((t) => outcomeFromPrices(t.entry, t.exit, "buy") === "win").length;
  const batchLosses = tradesToImport.filter((t) => outcomeFromPrices(t.entry, t.exit, "buy") === "loss").length;
  const batchDecisive = batchWins + batchLosses;
  const batchPnl = tradesToImport.reduce((s, t) => s + t.pnl, 0);
  const batchWR = batchDecisive > 0
    ? ((batchWins / batchDecisive) * 100).toFixed(1)
    : "0";

  // Stats projetées (existant + batch)
  const projectedTotal = existingTrades.length + tradesToImport.length;
  const projectedPnl = existingPnl + batchPnl;
  const projectedWins = existingWins + batchWins;
  const projectedDecisive = existingDecisive + batchDecisive;
  const projectedWR = projectedDecisive > 0
    ? ((projectedWins / projectedDecisive) * 100).toFixed(1)
    : "0";

  return (
    <div className="max-w-5xl mx-auto py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* HEADER */}
        <div className="mb-8">
          <Link href="/journal" className="text-sm text-text-muted hover:text-foreground transition-colors">
            ← Retour au journal
          </Link>
          <h1 className="text-3xl font-bold mt-3 text-gradient-accent">Importer des trades</h1>
          <p className="text-text-muted mt-2">
            Ajoute plusieurs trades en une fois. Colle un tableau, ou saisis-les manuellement.
          </p>
        </div>

        {/* STATS PROJECTION */}
        <div className="glass-card p-5 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Journal actuel</div>
              <div className="text-xl font-bold font-mono">{existingTrades.length} trades</div>
              <div className="text-xs text-text-muted mt-1">
                WR {existingWR}% · PnL{" "}
                <span style={{ color: existingPnl >= 0 ? "#4ade80" : "#f87171" }}>
                  {existingPnl >= 0 ? "+" : ""}
                  {existingPnl.toFixed(2)} $
                </span>
              </div>
            </div>
            <div className="border-x border-white/10">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-1">À importer</div>
              <div className="text-xl font-bold font-mono" style={{ color: "var(--accent)" }}>
                +{tradesToImport.length} trades
              </div>
              <div className="text-xs text-text-muted mt-1">
                WR {batchWR}% · PnL{" "}
                <span style={{ color: batchPnl >= 0 ? "#4ade80" : "#f87171" }}>
                  {batchPnl >= 0 ? "+" : ""}
                  {batchPnl.toFixed(2)} $
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Projeté après import</div>
              <div className="text-xl font-bold font-mono">{projectedTotal} trades</div>
              <div className="text-xs text-text-muted mt-1">
                WR {projectedWR}% · PnL{" "}
                <span style={{ color: projectedPnl >= 0 ? "#4ade80" : "#f87171" }}>
                  {projectedPnl >= 0 ? "+" : ""}
                  {projectedPnl.toFixed(2)} $
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setTab("paste")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === "paste"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-foreground"
            }`}
            style={tab === "paste" ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}}
          >
            📋 Coller un tableau
          </button>
          <button
            onClick={() => setTab("form")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === "form"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-foreground"
            }`}
            style={tab === "form" ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}}
          >
            ✏️ Saisie manuelle
          </button>
        </div>

        {/* TAB 1 : COLLAGE TABLEAU */}
        {tab === "paste" && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Coller un tableau de trades</h2>
            <p className="text-xs text-text-muted mb-3">
              Format accepté : <strong>Date | Pair | (Type) | Investi | Entry | Sortie | PnL | (%)</strong>
              <br />
              Séparateurs OK : tabulations, pipes (|), espaces multiples. Symboles $, +, %, espaces : auto-nettoyés.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Exemple :
2026-04-26 | ARB | ACHAT | 2616 $ | 2.05 $ | 2.05 $ | -5.23 $ | -0.20%
2026-04-26 | ARB | ACHAT | 2544 $ | 2.02 $ | 2.08 $ | +71.84 $ | +2.82%
...`}
              className="w-full h-40 px-4 py-3 rounded-xl font-mono text-sm"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--foreground)",
              }}
            />
            <div className="flex gap-2 mt-3">
              <button onClick={handleParse} className="glass-btn px-5 py-2.5 text-sm">
                🔍 Analyser le tableau
              </button>
              <button onClick={() => { setPasteText(""); setParsedTrades([]); setParseErrors([]); }} className="glass-btn px-5 py-2.5 text-sm">
                ✕ Vider
              </button>
            </div>

            {parseErrors.length > 0 && (
              <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)" }}>
                <div className="text-sm font-semibold mb-2" style={{ color: "#f87171" }}>
                  ⚠ {parseErrors.length} ligne(s) en erreur :
                </div>
                {parseErrors.map((e, i) => (
                  <div key={i} className="text-xs text-text-muted mt-1">{e}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2 : FORMULAIRE MANUEL */}
        {tab === "form" && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Saisie manuelle</h2>
            <p className="text-xs text-text-muted mb-4">
              Remplis Investi, Entry et Sortie — le PnL et % se calculent auto (frais 0.4% inclus).
            </p>
            <div className="space-y-2">
              {formTrades.map((t, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="date"
                    value={t.date}
                    onChange={(e) => updateFormRow(idx, "date", e.target.value)}
                    className="col-span-2 px-2 py-2 rounded-lg text-xs"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                  <input
                    type="text"
                    value={t.pair}
                    onChange={(e) => updateFormRow(idx, "pair", e.target.value.toUpperCase())}
                    placeholder="ARB"
                    className="col-span-1 px-2 py-2 rounded-lg text-xs font-mono"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                  <input
                    type="number"
                    value={t.investi || ""}
                    onChange={(e) => updateFormRow(idx, "investi", e.target.value)}
                    placeholder="Investi $"
                    className="col-span-2 px-2 py-2 rounded-lg text-xs font-mono"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={t.entry || ""}
                    onChange={(e) => updateFormRow(idx, "entry", e.target.value)}
                    placeholder="Entry"
                    className="col-span-2 px-2 py-2 rounded-lg text-xs font-mono"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={t.exit || ""}
                    onChange={(e) => updateFormRow(idx, "exit", e.target.value)}
                    placeholder="Sortie"
                    className="col-span-2 px-2 py-2 rounded-lg text-xs font-mono"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                  <div className="col-span-2 text-xs font-mono text-center">
                    <div style={{ color: t.pnl >= 0 ? "#4ade80" : "#f87171" }}>
                      {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)} $
                    </div>
                    <div className="text-[10px]" style={{ color: t.pct >= 0 ? "#4ade80" : "#f87171" }}>
                      {t.pct >= 0 ? "+" : ""}{t.pct.toFixed(2)}%
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFormRow(idx)}
                    disabled={formTrades.length === 1}
                    className="col-span-1 text-text-muted hover:text-red-400 disabled:opacity-30 transition-colors text-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddFormRow}
              className="mt-4 glass-btn px-5 py-2.5 text-sm"
            >
              + Ajouter une ligne
            </button>
          </div>
        )}

        {/* PREVIEW + IMPORT BUTTON */}
        {tradesToImport.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="text-lg font-semibold mb-4">
              📊 {tradesToImport.length} trade(s) prêt(s) à importer
            </h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs">
                <thead className="text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-2">#</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Pair</th>
                    <th className="text-right py-2">Investi</th>
                    <th className="text-right py-2">Entry</th>
                    <th className="text-right py-2">Exit</th>
                    <th className="text-right py-2">PnL</th>
                    <th className="text-right py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {tradesToImport.slice(0, 10).map((t, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="py-2 font-mono text-text-muted">{i + 1}</td>
                      <td className="py-2 font-mono">{t.date}</td>
                      <td className="py-2 font-medium">{t.pair}</td>
                      <td className="py-2 text-right font-mono">{t.investi.toFixed(0)} $</td>
                      <td className="py-2 text-right font-mono">{t.entry.toFixed(2)} $</td>
                      <td className="py-2 text-right font-mono">{t.exit.toFixed(2)} $</td>
                      <td className="py-2 text-right font-mono" style={{ color: t.pnl >= 0 ? "#4ade80" : "#f87171" }}>
                        {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)} $
                      </td>
                      <td className="py-2 text-right font-mono" style={{ color: t.pct >= 0 ? "#4ade80" : "#f87171" }}>
                        {t.pct >= 0 ? "+" : ""}{t.pct.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  {tradesToImport.length > 10 && (
                    <tr className="border-t border-white/5">
                      <td colSpan={8} className="py-2 text-center text-xs text-text-muted italic">
                        … et {tradesToImport.length - 10} autres
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => handleImport(tradesToImport)}
              disabled={importing}
              className="w-full glass-btn-primary py-4 text-base font-semibold disabled:opacity-50"
            >
              {importing
                ? `Import en cours… ${importedCount}/${tradesToImport.length}`
                : `📥 Importer les ${tradesToImport.length} trade(s) dans le journal`}
            </button>
          </motion.div>
        )}

        {/* SUCCESS MESSAGE */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 text-center"
              style={{ borderColor: "rgba(74, 222, 128, 0.4)" }}
            >
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold mb-2 text-gradient-accent">Import réussi</h2>
              <p className="text-text-muted mb-4">{importedCount} trade(s) ajouté(s) au journal. Sync cloud en cours.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/journal" className="glass-btn-primary px-6 py-3 font-semibold">
                  Voir le journal →
                </Link>
                <Link href="/dashboard" className="glass-btn px-6 py-3">
                  Dashboard
                </Link>
                <Link href="/stats" className="glass-btn px-6 py-3">
                  Statistiques
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
