"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 2800);
    const t4 = setTimeout(() => onComplete(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          {/* Background animated gradient circles */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)" }}
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.05, 0.15, 0.05],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }}
            />
          </div>

          {/* Pulse rings behind logo */}
          {phase >= 1 && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-24 h-24 rounded-full border-2 border-primary/30"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute w-24 h-24 rounded-full border-2 border-primary/20"
              />
            </>
          )}

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: phase >= 1 ? 1 : 0,
              rotate: 0,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative z-10"
          >
            <motion.img
              src="/logo-nodex.png"
              alt="Nodex Trading"
              className="w-28 h-28 rounded-3xl"
              animate={phase >= 1 ? {
                y: [0, -8, 0],
                filter: [
                  "drop-shadow(0 0 24px rgba(255,255,255,0.25))",
                  "drop-shadow(0 0 48px rgba(255,255,255,0.5))",
                  "drop-shadow(0 0 24px rgba(255,255,255,0.25))",
                ],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Nom de l'app */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 30 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative z-10 mt-8 text-5xl font-bold text-white"
            style={{ textShadow: "0 0 24px rgba(255,255,255,0.35)" }}
          >
            Nodex Trading
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 mt-3 text-text-muted text-lg tracking-wide"
          >
            Trading Spot Crypto
          </motion.p>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 mt-10 w-48 h-1 rounded-full bg-surface-light overflow-hidden"
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: phase >= 2 ? "100%" : "0%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
            />
          </motion.div>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              animate={{
                opacity: [0, 0.5, 0],
                y: -200,
                x: (i % 2 === 0 ? 1 : -1) * (30 + i * 20),
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut",
              }}
              className="absolute bottom-1/4 w-1.5 h-1.5 rounded-full bg-primary"
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
