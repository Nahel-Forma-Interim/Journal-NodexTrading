"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Award } from "lucide-react";
import { getStats, getTrades } from "@/lib/store";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function StatCard({ icon: Icon, label, value, color, delay }: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <span className="text-text-muted text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(getStats());
  const [trades, setTrades] = useState(getTrades());

  useEffect(() => {
    setStats(getStats());
    setTrades(getTrades());
  }, []);

  const recentTrades = trades.slice(0, 5);

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Vue d&apos;ensemble
      </motion.h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BarChart3}
          label="Total Trades"
          value={stats.totalTrades.toString()}
          color="bg-primary/20 text-primary"
          delay={0.1}
        />
        <StatCard
          icon={Target}
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          color="bg-accent-green/20 text-accent-green"
          delay={0.15}
        />
        <StatCard
          icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
          label="PnL Total"
          value={`${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(2)} $`}
          color={stats.totalPnl >= 0 ? "bg-accent-green/20 text-accent-green" : "bg-accent-red/20 text-accent-red"}
          delay={0.2}
        />
        <StatCard
          icon={Award}
          label="Profit Factor"
          value={stats.profitFactor.toFixed(2)}
          color="bg-accent-yellow/20 text-accent-yellow"
          delay={0.25}
        />
        <StatCard
          icon={TrendingUp}
          label="Meilleur Trade"
          value={`+${stats.bestTrade.toFixed(2)} $`}
          color="bg-accent-green/20 text-accent-green"
          delay={0.3}
        />
        <StatCard
          icon={TrendingDown}
          label="Pire Trade"
          value={`${stats.worstTrade.toFixed(2)} $`}
          color="bg-accent-red/20 text-accent-red"
          delay={0.35}
        />
        <StatCard
          icon={DollarSign}
          label="Frais Totaux"
          value={`${stats.totalFees.toFixed(2)} $`}
          color="bg-text-muted/20 text-text-muted"
          delay={0.4}
        />
        <StatCard
          icon={DollarSign}
          label="Gain Moyen"
          value={`${stats.avgWin.toFixed(2)} $`}
          color="bg-primary/20 text-primary"
          delay={0.45}
        />
      </div>

      {/* Equity curve + recent trades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Courbe d&apos;équité</h2>
          {stats.equityCurve.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d5a" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 11, 26, 0.95)",
                    border: "1px solid #22c55e",
                    borderRadius: "12px",
                    color: "#22c55e",
                    boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke="#5B6EF5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#5B6EF5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-text-muted">
              <BarChart3 size={48} className="mb-3 opacity-30" />
              <p>Aucun trade enregistré</p>
              <p className="text-sm mt-1">Ajoutez vos premiers trades dans le Journal</p>
            </div>
          )}
        </motion.div>

        {/* Recent trades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-surface rounded-2xl border border-border p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Derniers Trades</h2>
          {recentTrades.length > 0 ? (
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-light"
                >
                  <div>
                    <p className="font-medium text-sm">{trade.pair}</p>
                    <p className="text-xs text-text-muted">{trade.date}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      trade.pnl >= 0 ? "text-accent-green" : "text-accent-red"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}{trade.pnl.toFixed(2)} $
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-text-muted text-sm">
              <p>Aucun trade récent</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
