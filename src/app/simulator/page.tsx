"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Target, DollarSign, AlertTriangle, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface SimPoint {
  month: number;
  label: string;
  equity: number;
  drawdown: number;
  peakEquity: number;
  totalTrades: number;
  totalFees: number;
}

function simulate(
  capital: number,
  riskPercent: number,
  winRate: number,
  avgRR: number,
  tradesPerMonth: number,
  feePercent: number,
  months: number
): SimPoint[] {
  const points: SimPoint[] = [];
  let equity = capital;
  let peak = capital;
  let totalFees = 0;
  let totalTrades = 0;

  points.push({
    month: 0,
    label: "Départ",
    equity: capital,
    drawdown: 0,
    peakEquity: capital,
    totalTrades: 0,
    totalFees: 0,
  });

  for (let m = 1; m <= months; m++) {
    for (let t = 0; t < tradesPerMonth; t++) {
      const riskAmount = equity * (riskPercent / 100);
      const fee = riskAmount * (feePercent / 100) * 2;
      totalFees += fee;
      totalTrades++;

      // Deterministic simulation using win rate
      const isWin = (totalTrades % Math.round(100 / winRate)) < Math.round(winRate);
      if (isWin) {
        equity += riskAmount * avgRR - fee;
      } else {
        equity -= riskAmount + fee;
      }

      if (equity <= 0) {
        equity = 0;
        break;
      }
      if (equity > peak) peak = equity;
    }

    const drawdown = peak > 0 ? ((peak - equity) / peak) * 100 : 0;

    points.push({
      month: m,
      label: `Mois ${m}`,
      equity: Math.round(equity * 100) / 100,
      drawdown: Math.round(drawdown * 100) / 100,
      peakEquity: Math.round(peak * 100) / 100,
      totalTrades,
      totalFees: Math.round(totalFees * 100) / 100,
    });

    if (equity <= 0) break;
  }

  return points;
}

const neonTooltipStyle = {
  backgroundColor: "rgba(10, 11, 26, 0.95)",
  border: "1px solid #22c55e",
  borderRadius: "12px",
  color: "#22c55e",
  boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)",
  fontSize: "13px",
};

export default function SimulatorPage() {
  const [capital, setCapital] = useState(1000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [winRate, setWinRate] = useState(55);
  const [avgRR, setAvgRR] = useState(2);
  const [tradesPerMonth, setTradesPerMonth] = useState(20);
  const [feePercent, setFeePercent] = useState(0.1);
  const [months, setMonths] = useState(12);

  const data = useMemo(
    () => simulate(capital, riskPercent, winRate, avgRR, tradesPerMonth, feePercent, months),
    [capital, riskPercent, winRate, avgRR, tradesPerMonth, feePercent, months]
  );

  const lastPoint = data[data.length - 1];
  const totalReturn = capital > 0 ? ((lastPoint.equity - capital) / capital) * 100 : 0;
  const maxDrawdown = Math.max(...data.map((d) => d.drawdown));

  const presets = [
    { label: "6 mois", value: 6 },
    { label: "1 an", value: 12 },
    { label: "2 ans", value: 24 },
    { label: "3 ans", value: 36 },
  ];

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold mb-2"
      >
        Simulateur Long Terme
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-text-muted mb-8"
      >
        Projetez vos performances sur 1, 2 ou 3 ans selon votre stratégie
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-surface rounded-2xl border border-border p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap size={20} className="text-primary" />
            Paramètres
          </h2>

          <div>
            <label className="text-sm text-text-muted mb-1 block">Capital initial ($)</label>
            <input
              type="number"
              value={capital || ""}
              onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-text-muted mb-1 block">
              Risque par trade: <span className="text-primary font-semibold">{riskPercent}%</span>
            </label>
            <input type="range" min="0.5" max="10" step="0.5" value={riskPercent}
              onChange={(e) => setRiskPercent(parseFloat(e.target.value))} className="w-full accent-primary" />
          </div>

          <div>
            <label className="text-sm text-text-muted mb-1 block">
              Win Rate: <span className="text-accent-green font-semibold">{winRate}%</span>
            </label>
            <input type="range" min="30" max="80" step="1" value={winRate}
              onChange={(e) => setWinRate(parseInt(e.target.value))} className="w-full accent-accent-green" />
          </div>

          <div>
            <label className="text-sm text-text-muted mb-1 block">
              Ratio R:R moyen: <span className="text-accent-yellow font-semibold">1:{avgRR}</span>
            </label>
            <input type="range" min="1" max="5" step="0.5" value={avgRR}
              onChange={(e) => setAvgRR(parseFloat(e.target.value))} className="w-full accent-accent-yellow" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-muted mb-1 block">Trades/mois</label>
              <input type="number" value={tradesPerMonth || ""}
                onChange={(e) => setTradesPerMonth(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm text-text-muted mb-1 block">Frais (%)</label>
              <input type="number" step="0.01" value={feePercent || ""}
                onChange={(e) => setFeePercent(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm text-text-muted mb-2 block">Horizon temporel</label>
            <div className="flex gap-2 flex-wrap">
              {presets.map((p) => (
                <button key={p.value}
                  onClick={() => setMonths(p.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    months === p.value
                      ? "bg-primary text-white"
                      : "bg-surface-light text-text-muted border border-border hover:border-primary/30"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <input type="number" min="1" max="120" value={months}
                onChange={(e) => setMonths(parseInt(e.target.value) || 12)}
                className="w-20 px-3 py-2 rounded-xl text-sm text-center" />
            </div>
          </div>
        </motion.div>

        {/* Charts and results */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: DollarSign,
                label: "Capital final",
                value: `${lastPoint.equity.toLocaleString("fr-FR")} $`,
                color: lastPoint.equity >= capital ? "text-accent-green" : "text-accent-red",
              },
              {
                icon: TrendingUp,
                label: "Rendement",
                value: `${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(1)}%`,
                color: totalReturn >= 0 ? "text-accent-green" : "text-accent-red",
              },
              {
                icon: AlertTriangle,
                label: "Max Drawdown",
                value: `${maxDrawdown.toFixed(1)}%`,
                color: maxDrawdown > 20 ? "text-accent-red" : maxDrawdown > 10 ? "text-accent-yellow" : "text-accent-green",
              },
              {
                icon: Target,
                label: "Total Trades",
                value: lastPoint.totalTrades.toString(),
                color: "text-primary",
              },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-surface rounded-2xl border border-border p-4"
              >
                <kpi.icon size={18} className={`mb-2 ${kpi.color}`} />
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-text-muted mt-1">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Equity curve */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-surface rounded-2xl border border-border p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Projection d&apos;équité
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d5a" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={neonTooltipStyle}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${Number(value).toLocaleString("fr-FR")} $`, "Équité"]}
                />
                <Area type="monotone" dataKey="equity" stroke="#22c55e" strokeWidth={2} fill="url(#equityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Drawdown chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface rounded-2xl border border-border p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Drawdown (%)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d5a" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} reversed />
                <Tooltip
                  contentStyle={{
                    ...neonTooltipStyle,
                    borderColor: "#ef4444",
                    color: "#ef4444",
                    boxShadow: "0 0 15px rgba(239, 68, 68, 0.3)",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${Number(value).toFixed(2)}%`, "Drawdown"]}
                />
                <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} fill="url(#ddGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Fees impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-surface rounded-2xl border border-border p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-text-muted">Impact total des frais</p>
              <p className="text-xl font-bold text-accent-yellow">{lastPoint.totalFees.toLocaleString("fr-FR")} $</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Frais / Capital initial</p>
              <p className="text-xl font-bold text-accent-yellow">{capital > 0 ? ((lastPoint.totalFees / capital) * 100).toFixed(1) : 0}%</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Frais moyens / trade</p>
              <p className="text-xl font-bold text-text-muted">
                {lastPoint.totalTrades > 0 ? (lastPoint.totalFees / lastPoint.totalTrades).toFixed(2) : 0} $
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
