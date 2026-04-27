"use client";

import { useState } from "react";
import Link from "next/link";
import { saveTrade, getTrades, type Trade } from "@/lib/store";
import { motion } from "framer-motion";

// 20 backtests V6.1 sur ARB (2026-04-26)
const BACKTEST_DATA = [
  { investi: 2616, entry: 2.05, exit: 2.05, pnl: -5.23,  pct: -0.20 },
  { investi: 2544, entry: 2.02, exit: 2.08, pnl: +71.84, pct: +2.82 },
  { investi: 2531, entry: 1.53, exit: 1.54, pnl: +12.67, pct: +0.50 },
  { investi: 2462, entry: 1.28, exit: 1.32, pnl: +69.11, pct: +2.81 },
  { investi: 2490, entry: 1.36, exit: 1.35, pnl: -27.70, pct: -1.11 },
  { investi: 2520, entry: 1.37, exit: 1.36, pnl: -30.42, pct: -1.21 },
  { investi: 2451, entry: 1.09, exit: 1.12, pnl: +68.77, pct: +2.81 },
  { investi: 2456, entry: 1.00, exit: 1.00, pnl: -4.91,  pct: -0.20 },
  { investi: 2444, entry: 1.06, exit: 1.07, pnl: +12.60, pct: +0.52 },
  { investi: 2377, entry: 1.10, exit: 1.13, pnl: +66.75, pct: +2.81 },
  { investi: 2310, entry: 1.11, exit: 1.15, pnl: +66.68, pct: +2.89 },
  { investi: 2280, entry: 1.07, exit: 1.08, pnl: +29.70, pct: +1.30 },
  { investi: 2285, entry: 1.09, exit: 1.09, pnl: -4.57,  pct: -0.20 },
  { investi: 2290, entry: 1.08, exit: 1.08, pnl: -4.58,  pct: -0.20 },
  { investi: 2227, entry: 1.06, exit: 1.09, pnl: +62.50, pct: +2.81 },
  { investi: 2166, entry: 0.94, exit: 0.97, pnl: +61.13, pct: +2.82 },
  { investi: 2107, entry: 0.97, exit: 1.00, pnl: +59.24, pct: +2.81 },
  { investi: 2111, entry: 0.95, exit: 0.95, pnl: -4.22,  pct: -0.20 },
  { investi: 2115, entry: 0.91, exit: 0.91, pnl: -4.23,  pct: -0.20 },
  { investi: 2000, entry: 0.87, exit: 0.92, pnl: +115.19, pct: +5.76 },
];

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function buildTrade(t: typeof BACKTEST_DATA[0]): Trade {
  const feePercent = 0.2;
  const fees = (t.investi * feePercent / 100) * 2; // entry + exit
  return {
    id: uuid(),
    date: "2026-04-26",
    pair: "ARB/USDT",
    type: "buy",
    entryPrice: t.entry,
    exitPrice: t.exit,
    amountInvested: t.investi,
    feePercent,
    fees,
    pnl: t.pnl,
    pnlPercent: t.pct,
    notes: "Backtest V6.1 — ARB session validation",
    tags: ["backtest", "V6.1", "ARB"],
  };
}

export default function ImportBacktestPage() {
  const [imported, setImported] = useState(false);
  const [importing, setImporting] = useState(false);
  const [count, setCount] = useState(0);

  // Stats preview
  const wins = BACKTEST_DATA.filter((t) => t.pnl > 0).length;
  const losses = BACKTEST_DATA.filter((t) => t.pnl < 0).length;
  const totalPnl = BACKTEST_DATA.reduce((s, t) => s + t.pnl, 0);
  const totalGains = BACKTEST_DATA.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const totalLosses = Math.abs(BACKTEST_DATA.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
  const wr = ((wins / BACKTEST_DATA.length) * 100).toFixed(1);
  const pf = (totalGains / totalLosses).toFixed(2);
  const expectancy = (totalPnl / BACKTEST_DATA.length).toFixed(2);

  const handleImport = async () => {
    setImporting(true);
    setCount(0);
    for (let i = 0; i < BACKTEST_DATA.length; i++) {
      const trade = buildTrade(BACKTEST_DATA[i]);
      saveTrade(trade);
      setCount(i + 1);
      await new Promise((r) => setTimeout(r, 50)); // animation visible
    }
    setImporting(false);
    setImported(true);
  };

  const existingCount = typeof window !== "undefined" ? getTrades().length : 0;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <Link href="/journal" className="text-sm text-text-muted hover:text-foreground transition-colors">
            ← Retour au journal
          </Link>
          <h1 className="text-3xl font-bold mt-3 text-gradient-accent">
            Import 20 backtests V6.1
          </h1>
          <p className="text-text-muted mt-2">
            ARB/USDT · 26 avril 2026 · Méthode Nodex V6.1
          </p>
        </div>

        {/* STATS PREVIEW */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📊 Statistiques de ces 20 trades</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Trades" value={`${BACKTEST_DATA.length}`} />
            <Stat label="Win Rate" value={`${wr}%`} accent={parseFloat(wr) >= 55 ? "green" : "yellow"} />
            <Stat label="Profit Factor" value={pf} accent={parseFloat(pf) >= 1.8 ? "green" : "yellow"} />
            <Stat label="Expectancy / trade" value={`+${expectancy} $`} accent="green" />
            <Stat label="Wins" value={`${wins}`} accent="green" />
            <Stat label="Losses" value={`${losses}`} accent="red" />
            <Stat
              label="PnL total"
              value={`${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)} $`}
              accent={totalPnl >= 0 ? "green" : "red"}
            />
            <Stat label="Verdict V6.1" value="✅ Phase 4" accent="green" />
          </div>
        </div>

        {/* TRADES TABLE */}
        <div className="glass-card p-6 mb-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">📋 Détail des trades</h2>
          <table className="w-full text-sm">
            <thead className="text-xs text-text-muted uppercase tracking-wider">
              <tr>
                <th className="text-left py-2">#</th>
                <th className="text-left py-2">Pair</th>
                <th className="text-right py-2">Investi</th>
                <th className="text-right py-2">Entry</th>
                <th className="text-right py-2">Exit</th>
                <th className="text-right py-2">PnL $</th>
                <th className="text-right py-2">PnL %</th>
              </tr>
            </thead>
            <tbody>
              {BACKTEST_DATA.map((t, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-2 font-mono text-text-muted">{(i + 1).toString().padStart(2, "0")}</td>
                  <td className="py-2 font-medium">ARB/USDT</td>
                  <td className="py-2 text-right font-mono">{t.investi} $</td>
                  <td className="py-2 text-right font-mono">{t.entry.toFixed(2)} $</td>
                  <td className="py-2 text-right font-mono">{t.exit.toFixed(2)} $</td>
                  <td
                    className="py-2 text-right font-mono font-semibold"
                    style={{ color: t.pnl >= 0 ? "#4ade80" : "#f87171" }}
                  >
                    {t.pnl >= 0 ? "+" : ""}
                    {t.pnl.toFixed(2)} $
                  </td>
                  <td
                    className="py-2 text-right font-mono"
                    style={{ color: t.pct >= 0 ? "#4ade80" : "#f87171" }}
                  >
                    {t.pct >= 0 ? "+" : ""}
                    {t.pct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* IMPORT BUTTON */}
        {!imported && (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-text-muted mb-4">
              {existingCount > 0
                ? `Tu as déjà ${existingCount} trade(s) dans ton journal. Les 20 trades vont s'ajouter en plus (pas de doublon ni d'écrasement).`
                : "Ton journal est vide. Les 20 trades vont s'ajouter."}
            </p>
            <button
              onClick={handleImport}
              disabled={importing}
              className="glass-btn-primary px-8 py-4 text-base font-semibold disabled:opacity-50"
            >
              {importing
                ? `Import en cours… ${count}/20`
                : `📥 Importer les 20 trades dans mon journal`}
            </button>
            <p className="text-xs text-text-muted mt-4">
              💡 Si tu es connecté, ils seront sync auto vers Supabase (cloud).
            </p>
          </div>
        )}

        {imported && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
            style={{ borderColor: "rgba(74, 222, 128, 0.4)" }}
          >
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2 text-gradient-accent">
              20 trades importés avec succès
            </h2>
            <p className="text-text-muted mb-6">
              Tes backtests V6.1 sont maintenant dans ton journal. Sync cloud en cours si tu es connecté.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/journal" className="glass-btn-primary px-6 py-3 font-semibold">
                Voir mon journal →
              </Link>
              <Link href="/dashboard" className="glass-btn px-6 py-3">
                Voir mon dashboard
              </Link>
              <Link href="/stats" className="glass-btn px-6 py-3">
                Voir mes stats
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "green" | "red" | "yellow";
}) {
  const color =
    accent === "green"
      ? "#4ade80"
      : accent === "red"
      ? "#f87171"
      : accent === "yellow"
      ? "#fbbf24"
      : "var(--foreground)";
  return (
    <div className="text-center">
      <div className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-bold font-mono" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
