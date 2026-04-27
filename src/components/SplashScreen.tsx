"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const LOAD_STEPS = [
  { label: "Connexion sécurisée", duration: 600 },
  { label: "Synchronisation des données", duration: 700 },
  { label: "Initialisation de l'IA Nodex", duration: 700 },
];

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0); // 0 = init, 1 = scan beam, 2 = logo, 3 = title, 4 = steps, 5 = exit
  const [stepsCompleted, setStepsCompleted] = useState(0);

  // Stocker onComplete dans une ref pour éviter de re-trigger le useEffect quand le parent re-render
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // useEffect avec [] pour ne s'exécuter QU'UNE SEULE FOIS au mount (évite la boucle HMR)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);   // scan beam
    const t2 = setTimeout(() => setPhase(2), 800);   // logo assemble
    const t3 = setTimeout(() => setPhase(3), 1700);  // title
    const t4 = setTimeout(() => setPhase(4), 2300);  // loading steps
    const t5 = setTimeout(() => setPhase(5), 4000);  // exit
    const t6 = setTimeout(() => onCompleteRef.current(), 4500); // done

    // Auto-tick loading steps
    const stepTimers = LOAD_STEPS.map((step, i) => {
      const cumulative = LOAD_STEPS.slice(0, i + 1).reduce((s, x) => s + x.duration, 0);
      return setTimeout(() => setStepsCompleted(i + 1), 2300 + cumulative - step.duration / 2);
    });

    return () => {
      [t1, t2, t3, t4, t5, t6, ...stepTimers].forEach(clearTimeout);
    };
  }, []); // ← dépendances vides : run once on mount

  const titleChars = "Nodex".split("");

  return (
    <AnimatePresence>
      {phase < 5 && (
        <motion.div
          exit={{ opacity: 0, scale: 1.15 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          {/* ═══ COUCHE 1 : ÉTOILES (toujours visibles) ═══ */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.7), transparent),
                  radial-gradient(1px 1px at 25% 60%, rgba(255,255,255,0.5), transparent),
                  radial-gradient(1px 1px at 40% 30%, rgba(255,255,255,0.6), transparent),
                  radial-gradient(1px 1px at 58% 75%, rgba(255,255,255,0.4), transparent),
                  radial-gradient(1px 1px at 70% 22%, rgba(255,255,255,0.55), transparent),
                  radial-gradient(1px 1px at 82% 68%, rgba(255,255,255,0.5), transparent),
                  radial-gradient(1px 1px at 92% 35%, rgba(255,255,255,0.45), transparent),
                  radial-gradient(1.5px 1.5px at 15% 85%, rgba(111,168,255,0.6), transparent),
                  radial-gradient(1.5px 1.5px at 88% 12%, rgba(245,208,97,0.5), transparent)
                `,
                backgroundSize: "100% 100%",
                opacity: phase >= 1 ? 0.6 : 0,
                transition: "opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          {/* ═══ COUCHE 2 : 2 LENS FLARES (bleu + gold) ═══ */}
          <motion.div
            animate={{
              scale: phase >= 1 ? [0.8, 1.2, 1] : 0.8,
              opacity: phase >= 1 ? [0, 0.5, 0.25] : 0,
            }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute pointer-events-none"
            style={{
              top: "20%",
              left: "15%",
              width: 500,
              height: 500,
              background: "radial-gradient(circle, rgba(111,168,255,0.45) 0%, transparent 60%)",
              filter: "blur(40px)",
            }}
          />
          <motion.div
            animate={{
              scale: phase >= 2 ? [0.8, 1.3, 1] : 0.8,
              opacity: phase >= 2 ? [0, 0.35, 0.18] : 0,
            }}
            transition={{ duration: 3, ease: "easeOut", delay: 0.3 }}
            className="absolute pointer-events-none"
            style={{
              bottom: "15%",
              right: "12%",
              width: 600,
              height: 600,
              background: "radial-gradient(circle, rgba(245,208,97,0.3) 0%, transparent 60%)",
              filter: "blur(50px)",
            }}
          />

          {/* ═══ COUCHE 3 : SCAN BEAM (vertical) ═══ */}
          {phase >= 1 && phase <= 2 && (
            <motion.div
              initial={{ x: "-30vw", opacity: 0 }}
              animate={{ x: "30vw", opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="absolute inset-y-0 pointer-events-none"
              style={{
                width: 220,
                background: "linear-gradient(90deg, transparent 0%, rgba(111,168,255,0.18) 30%, rgba(255,255,255,0.5) 50%, rgba(111,168,255,0.18) 70%, transparent 100%)",
                filter: "blur(8px)",
              }}
            />
          )}

          {/* ═══ COUCHE 4 : RING PULSES autour du logo (phase 2+) ═══ */}
          {phase >= 2 && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-32 h-32 pointer-events-none"
                style={{
                  border: "2px solid rgba(111,168,255,0.35)",
                  borderRadius: "22.5%",
                }}
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                className="absolute w-32 h-32 pointer-events-none"
                style={{
                  border: "2px solid rgba(245,208,97,0.25)",
                  borderRadius: "22.5%",
                }}
              />
            </>
          )}

          {/* ═══ COUCHE 5 : LOGO (apparition par 4 éclats convergents puis assembly) ═══ */}
          {phase >= 1 && (
            <div className="relative z-10 flex items-center justify-center" style={{ width: 144, height: 144 }}>
              {/* Éclat top-left */}
              <motion.div
                initial={{ x: -100, y: -100, opacity: 0, scale: 0.3, rotate: -45 }}
                animate={{
                  x: phase >= 2 ? 0 : -100,
                  y: phase >= 2 ? 0 : -100,
                  opacity: phase >= 2 ? 0 : 0.7,
                  scale: phase >= 2 ? 1 : 0.3,
                  rotate: 0,
                }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                className="absolute"
                style={{
                  width: 56,
                  height: 56,
                  background: "linear-gradient(135deg, rgba(111,168,255,0.6), transparent)",
                  borderRadius: "22.5%",
                  filter: "blur(2px)",
                }}
              />
              {/* Éclat top-right */}
              <motion.div
                initial={{ x: 100, y: -100, opacity: 0, scale: 0.3, rotate: 45 }}
                animate={{
                  x: phase >= 2 ? 0 : 100,
                  y: phase >= 2 ? 0 : -100,
                  opacity: phase >= 2 ? 0 : 0.7,
                  scale: phase >= 2 ? 1 : 0.3,
                  rotate: 0,
                }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
                className="absolute"
                style={{
                  width: 56,
                  height: 56,
                  background: "linear-gradient(225deg, rgba(245,208,97,0.5), transparent)",
                  borderRadius: "22.5%",
                  filter: "blur(2px)",
                }}
              />
              {/* Éclat bottom-left */}
              <motion.div
                initial={{ x: -100, y: 100, opacity: 0, scale: 0.3, rotate: -135 }}
                animate={{
                  x: phase >= 2 ? 0 : -100,
                  y: phase >= 2 ? 0 : 100,
                  opacity: phase >= 2 ? 0 : 0.7,
                  scale: phase >= 2 ? 1 : 0.3,
                  rotate: 0,
                }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                className="absolute"
                style={{
                  width: 56,
                  height: 56,
                  background: "linear-gradient(45deg, rgba(111,168,255,0.5), transparent)",
                  borderRadius: "22.5%",
                  filter: "blur(2px)",
                }}
              />
              {/* Éclat bottom-right */}
              <motion.div
                initial={{ x: 100, y: 100, opacity: 0, scale: 0.3, rotate: 135 }}
                animate={{
                  x: phase >= 2 ? 0 : 100,
                  y: phase >= 2 ? 0 : 100,
                  opacity: phase >= 2 ? 0 : 0.7,
                  scale: phase >= 2 ? 1 : 0.3,
                  rotate: 0,
                }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
                className="absolute"
                style={{
                  width: 56,
                  height: 56,
                  background: "linear-gradient(315deg, rgba(245,208,97,0.5), transparent)",
                  borderRadius: "22.5%",
                  filter: "blur(2px)",
                }}
              />

              {/* Logo final qui apparaît au moment de l'assemblage */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: phase >= 2 ? 1 : 0,
                  opacity: phase >= 2 ? 1 : 0,
                }}
                transition={{ duration: 0.5, delay: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative z-10"
              >
                <motion.img
                  src="/logo-nodex.png"
                  alt="Nodex Trading"
                  className="w-32 h-32"
                  style={{ borderRadius: "22.5%" }}
                  animate={
                    phase >= 2
                      ? {
                          y: [0, -6, 0],
                          filter: [
                            "drop-shadow(0 0 24px rgba(111,168,255,0.5))",
                            "drop-shadow(0 0 56px rgba(111,168,255,0.85)) drop-shadow(0 0 28px rgba(245,208,97,0.4))",
                            "drop-shadow(0 0 24px rgba(111,168,255,0.5))",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          )}

          {/* ═══ COUCHE 6 : TITRE "Nodex" caractère par caractère + sous-titre ═══ */}
          {phase >= 3 && (
            <div className="relative z-10 mt-10 flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                {titleChars.map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] }}
                    className="text-6xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #6fa8ff 0%, #ffffff 50%, #f5d061 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="text-2xl font-mono ml-2"
                  style={{ color: "rgba(111,168,255,0.6)" }}
                >
                  V6.1
                </motion.span>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-3 text-sm tracking-[0.3em] uppercase"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Journal de Trading · Simplicité Radicale
              </motion.p>
            </div>
          )}

          {/* ═══ COUCHE 7 : LOADING STEPS (3 étapes qui se cochent) ═══ */}
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 mt-12 flex flex-col gap-2.5 min-w-[280px]"
            >
              {LOAD_STEPS.map((step, i) => {
                const isDone = stepsCompleted > i;
                const isActive = stepsCompleted === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-3"
                  >
                    {/* Indicateur (cercle qui se remplit) */}
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `1.5px solid ${isDone ? "#6fa8ff" : isActive ? "rgba(111,168,255,0.5)" : "rgba(255,255,255,0.15)"}`,
                        background: isDone ? "#6fa8ff" : "transparent",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: isDone ? "0 0 12px rgba(111,168,255,0.5)" : "none",
                      }}
                    >
                      {isDone && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                        >
                          <path
                            d="M2 6 L5 9 L10 3"
                            stroke="#000"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      )}
                      {isActive && (
                        <motion.div
                          animate={{ scale: [0.5, 1, 0.5], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute inset-1 rounded-full"
                          style={{ background: "#6fa8ff" }}
                        />
                      )}
                    </div>
                    <span
                      className="text-xs font-mono tracking-wide"
                      style={{
                        color: isDone ? "rgba(255,255,255,0.85)" : isActive ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.3)",
                        transition: "color 0.3s",
                      }}
                    >
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}

              {/* Barre de progression globale en bas */}
              <div className="relative mt-4 w-full h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${(stepsCompleted / LOAD_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #6fa8ff 0%, #f5d061 100%)",
                    boxShadow: "0 0 12px rgba(111,168,255,0.6)",
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* ═══ COUCHE 8 : Particules qui montent (atmosphère) ═══ */}
          {phase >= 2 &&
            [...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: -300,
                  x: (i % 2 === 0 ? 1 : -1) * (40 + i * 15),
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut",
                }}
                className="absolute bottom-[20%] w-1 h-1 rounded-full pointer-events-none"
                style={{
                  background: i % 3 === 0 ? "#f5d061" : "#6fa8ff",
                  boxShadow: `0 0 8px ${i % 3 === 0 ? "rgba(245,208,97,0.6)" : "rgba(111,168,255,0.6)"}`,
                }}
              />
            ))}

          {/* ═══ COUCHE 9 : Grid overlay très subtil (perspective) ═══ */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(111,168,255,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(111,168,255,1) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
