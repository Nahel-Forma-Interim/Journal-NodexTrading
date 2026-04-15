"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Target, DollarSign } from "lucide-react";
import { getStats, getTrades } from "@/lib/store";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function StatsPage() {
  const [stats, setStats] = useState(getStats());
  const [trades, setTrades] = useState(getTrades());

  useEffect(() => {
    setStats(getStats());
    setTrades(getTrades());
  }, []);

  // PnL by pair
  const pairMap = new Map<string, number>();
  trades.forEach((t) => {
    pairMap.set(t.pair, (pairMap.get(t.pair) || 0) + t.pnl);
  });
  const pairData = Array.from(pairMap.entries()).map(([pair, pnl]) => ({ pair, pnl }));

  // Win/Loss distribution
  const winLossData = [
    { name: "Gains", value: stats.wins, color: "#22c55e" },
    { name: "Pertes", value: stats.losses, color: "#ef4444" },
  ];

  // Daily PnL
  const dailyMap = new Map<string, number>();
  trades.forEach((t) => {
    dailyMap.set(t.date, (dailyMap.get(t.date) || 0) + t.pnl);
  });
  const dailyData = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, pnl]) => ({ date, pnl }));

  const hasTrades = trades.length > 0;

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Statistiques
      </motion.h1>

      {!hasTrades ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-text-muted"
        >
          <BarChart3 size={56} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">Aucune statistique disponible</p>
          <p className="text-sm mt-1">Ajoutez des trades dans le Journal pour voir vos stats</p>
        </motion.div>
      ) : (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: BarChart3, label: "Trades", value: stats.totalTrades, color: "text-primary" },
              { icon: Target, label: "Win Rate", value: `${stats.winRate.toFixed(1)}%`, color: "text-accent-green" },
              { icon: stats.totalPnl >= 0 ? TrendingUp : TrendingDown, label: "PnL Total", value: `${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(2)} $`, color: stats.totalPnl >= 0 ? "text-accent-green" : "text-accent-red" },
              { icon: DollarSign, label: "Profit Factor", value: stats.profitFactor.toFixed(2), color: "text-accent-yellow" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface rounded-2xl border border-border p-5 text-center"
              >
                <s.icon size={24} className={`mx-auto mb-2 ${s.color}`} />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-text-muted mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equity curve */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface rounded-2xl border border-border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Courbe d&apos;équité</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d5a" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(10,11,26,0.95)", border: "1px solid #22c55e", borderRadius: "12px", color: "#22c55e", boxShadow: "0 0 15px rgba(34,197,94,0.3)" }} />
                  <Line type="monotone" dataKey="equity" stroke="#5B6EF5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Win/Loss pie */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-surface rounded-2xl border border-border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Répartition Gains/Pertes</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={winLossData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
                    {winLossData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "rgba(10,11,26,0.95)", border: "1px solid #22c55e", borderRadius: "12px", color: "#22c55e", boxShadow: "0 0 15px rgba(34,197,94,0.3)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* PnL by pair */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-surface rounded-2xl border border-border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">PnL par Paire</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pairData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d5a" />
                  <XAxis dataKey="pair" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(10,11,26,0.95)", border: "1px solid #22c55e", borderRadius: "12px", color: "#22c55e", boxShadow: "0 0 15px rgba(34,197,94,0.3)" }} />
                  <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                    {pairData.map((entry, index) => (
                      <Cell key={index} fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Daily PnL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-surface rounded-2xl border border-border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">PnL Journalier</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d5a" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(10,11,26,0.95)", border: "1px solid #22c55e", borderRadius: "12px", color: "#22c55e", boxShadow: "0 0 15px rgba(34,197,94,0.3)" }} />
                  <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                    {dailyData.map((entry, index) => (
                      <Cell key={index} fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
