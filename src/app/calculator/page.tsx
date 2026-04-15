"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function CalculatorPage() {
  const [capital, setCapital] = useState<number>(0);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  const [feePercent, setFeePercent] = useState<number>(0.1);

  const riskAmount = capital * (riskPercent / 100);
  const priceDiff = entryPrice > 0 && stopLoss > 0 ? Math.abs(entryPrice - stopLoss) : 0;
  const positionSize = priceDiff > 0 ? riskAmount / priceDiff : 0;
  const positionValue = positionSize * entryPrice;
  const fees = positionValue * (feePercent / 100) * 2; // entry + exit fees

  const tpDiff = entryPrice > 0 && takeProfit > 0 ? Math.abs(takeProfit - entryPrice) : 0;
  const potentialGain = tpDiff * positionSize - fees;
  const potentialLoss = riskAmount + fees;
  const rr = potentialLoss > 0 ? potentialGain / potentialLoss : 0;

  const leverageNeeded = capital > 0 ? positionValue / capital : 0;

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold mb-2"
      >
        Calculatrice de Position Spot
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-text-muted mb-8"
      >
        Calculez la taille optimale de votre position en spot crypto
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-surface rounded-2xl border border-border p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calculator size={20} className="text-primary" />
            Paramètres
          </h2>

          <div>
            <label className="text-sm text-text-muted mb-1 block">Capital total ($)</label>
            <input
              type="number"
              step="any"
              value={capital || ""}
              onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
              placeholder="1000"
              className="w-full px-4 py-3 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-text-muted mb-1 block">
              Risque par trade: <span className="text-primary font-semibold">{riskPercent}%</span>
              <span className="text-xs ml-2">({riskAmount.toFixed(2)} $)</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={riskPercent}
              onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>0.5%</span>
              <span>5%</span>
              <span>10%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-muted mb-1 block">Prix d&apos;entrée ($)</label>
              <input
                type="number"
                step="any"
                value={entryPrice || ""}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                placeholder="60000"
                className="w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-text-muted mb-1 block">Stop Loss ($)</label>
              <input
                type="number"
                step="any"
                value={stopLoss || ""}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                placeholder="59000"
                className="w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-muted mb-1 block">Take Profit ($)</label>
              <input
                type="number"
                step="any"
                value={takeProfit || ""}
                onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                placeholder="62000"
                className="w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-text-muted mb-1 block">Frais (%)</label>
              <input
                type="number"
                step="0.01"
                value={feePercent || ""}
                onChange={(e) => setFeePercent(parseFloat(e.target.value) || 0)}
                placeholder="0.1"
                className="w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Results section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Position size */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h3 className="text-sm text-text-muted mb-1">Taille de position</h3>
            <p className="text-3xl font-bold text-primary">
              {positionSize > 0 ? positionSize.toFixed(6) : "—"}
            </p>
            <p className="text-sm text-text-muted mt-1">
              Valeur: {positionValue > 0 ? `${positionValue.toFixed(2)} $` : "—"}
            </p>
          </div>

          {/* Risk/Reward */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-accent-green" />
                <span className="text-sm text-text-muted">Gain potentiel</span>
              </div>
              <p className="text-xl font-bold text-accent-green">
                {potentialGain > 0 ? `+${potentialGain.toFixed(2)} $` : "—"}
              </p>
            </div>
            <div className="bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={18} className="text-accent-red" />
                <span className="text-sm text-text-muted">Perte potentielle</span>
              </div>
              <p className="text-xl font-bold text-accent-red">
                {potentialLoss > 0 ? `-${potentialLoss.toFixed(2)} $` : "—"}
              </p>
            </div>
          </div>

          {/* R:R Ratio */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h3 className="text-sm text-text-muted mb-1">Ratio Risk/Reward</h3>
            <p className={`text-3xl font-bold ${rr >= 2 ? "text-accent-green" : rr >= 1 ? "text-accent-yellow" : "text-accent-red"}`}>
              {rr > 0 ? `1:${rr.toFixed(2)}` : "—"}
            </p>
            {rr > 0 && rr < 2 && (
              <div className="flex items-center gap-2 mt-2 text-accent-yellow text-sm">
                <AlertTriangle size={14} />
                <span>RR inférieur à 1:2 — risque élevé</span>
              </div>
            )}
          </div>

          {/* Fees */}
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={18} className="text-text-muted" />
              <span className="text-sm text-text-muted">Frais estimés (aller-retour)</span>
            </div>
            <p className="text-lg font-semibold">{fees > 0 ? `${fees.toFixed(2)} $` : "—"}</p>
          </div>

          {leverageNeeded > 1 && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow text-sm">
              <AlertTriangle size={16} />
              <span>
                Position ({positionValue.toFixed(0)} $) supérieure au capital ({capital.toFixed(0)} $).
                En spot, vous ne pouvez pas dépasser votre capital.
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
