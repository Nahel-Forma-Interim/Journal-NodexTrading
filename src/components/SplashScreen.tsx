"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const LOAD_STEPS = [
  { label: "Connexion sécurisée", duration: 600 },
  { label: "Synchronisation des données", duration: 700 },
  { label: "Initialisation de l'IA Nodex", duration: 700 },
];

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState(0);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1700);
    const t4 = setTimeout(() => setPhase(4), 2300);
    const t5 = setTimeout(() => setPhase(5), 4000);
    const t6 = setTimeout(() => onCompleteRef.current(), 4500);

    const stepTimers = LOAD_STEPS.map((step, i) => {
      const cumulative = LOAD_STEPS.slice(0, i + 1).reduce((s, x) => s + x.duration, 0);
      return setTimeout(() => setStepsCompleted(i + 1), 2300 + cumulative - step.duration / 2);
    });

    return () => {
      [t1, t2, t3, t4, t5, t6, ...stepTimers].forEach(clearTimeout);
    };
  }, []);

  const titleChars = "Nodex".split("");

  return (
    <AnimatePresence>
      {phase < 5 && (
        <motion.div
          exit={{ opacity: 0, scale: 1.15 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{
            background: "#000000",
            width: "100vw",
            height: "100vh",
            minHeight: "100dvh", // dynamic viewport pour mobile
          }}
        >
          {/* ═══ COUCHE 1 : ÉTOILES (toujours visibles) ═══ */}
          <div
            className="absolute inset-0 pointer-events-none"
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

          {/* ═══ COUCHE 2 : LENS FLARES ═══ */}
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
              width: "min(500px, 60vw)",
              height: "min(500px, 60vw)",
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
              width: "min(600px, 70vw)",
              height: "min(600px, 70vw)",
              background: "radial-gradient(circle, rgba(245,208,97,0.3) 0%, transparent 60%)",
              filter: "blur(50px)",
            }}
          />

          {/* ═══ COUCHE 3 : SCAN BEAM ═══ */}
          {phase >= 1 && phase <= 2 && (
            <motion.div
              initial={{ x: "-30vw", opacity: 0 }}
              animate={{ x: "30vw", opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="absolute inset-y-0 pointer-events-none"
              style={{
                left: "50%",
                width: 220,
                background: "linear-gradient(90deg, transparent 0%, rgba(111,168,255,0.18) 30%, rgba(255,255,255,0.5) 50%, rgba(111,168,255,0.18) 70%, transparent 100%)",
                filter: "blur(8px)",
              }}
            />
          )}

          {/* ═══ COUCHE 4 : Grid overlay subtil (perspective) ═══ */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(111,168,255,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(111,168,255,1) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
              WebkitBackgroundImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            }}
          />

          {/* ═══ CONTENT WRAPPER : centrage parfait absolu ═══ */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
            style={{ zIndex: 10 }}
          >
            {/* ─── LOGO ─── */}
            <div
              className="relative flex items-center justify-center"
              style={{
                width: "clamp(96px, 22vw, 144px)",
                height: "clamp(96px, 22vw, 144px)",
              }}
            >
              {/* Ring pulses (apparaissent en phase 2+) */}
              {phase >= 2 && (
                <>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      border: "2px solid rgba(111,168,255,0.35)",
                      borderRadius: "22.5%",
                    }}
                  />
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.4 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      border: "2px solid rgba(245,208,97,0.25)",
                      borderRadius: "22.5%",
                    }}
                  />
                </>
              )}

              {/* 4 éclats convergents — disparaissent dès que phase >= 2 */}
              {phase < 2 && phase >= 1 && (
                <>
                  {[
                    { x: -100, y: -100, color: "rgba(111,168,255,0.6)", delay: 0 },
                    { x: 100, y: -100, color: "rgba(245,208,97,0.5)", delay: 0.05 },
                    { x: -100, y: 100, color: "rgba(111,168,255,0.5)", delay: 0.1 },
                    { x: 100, y: 100, color: "rgba(245,208,97,0.5)", delay: 0.15 },
                  ].map((eclat, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: eclat.x, y: eclat.y, opacity: 0, scale: 0.3 }}
                      animate={{ x: 0, y: 0, opacity: 0.7, scale: 0.7 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: eclat.delay }}
                      className="absolute pointer-events-none"
                      style={{
                        width: "40%",
                        height: "40%",
                        background: `linear-gradient(135deg, ${eclat.color}, transparent)`,
                        borderRadius: "22.5%",
                        filter: "blur(2px)",
                      }}
                    />
                  ))}
                </>
              )}

              {/* Logo final (apparaît seulement en phase 2+) */}
              {phase >= 2 && (
                <motion.img
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: [0, -6, 0],
                    filter: [
                      "drop-shadow(0 0 24px rgba(111,168,255,0.5))",
                      "drop-shadow(0 0 56px rgba(111,168,255,0.85)) drop-shadow(0 0 28px rgba(245,208,97,0.4))",
                      "drop-shadow(0 0 24px rgba(111,168,255,0.5))",
                    ],
                  }}
                  transition={{
                    scale: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
                    opacity: { duration: 0.4 },
                    y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                    filter: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                  }}
                  src="/logo-nodex.png"
                  alt="Nodex Trading"
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ borderRadius: "22.5%" }}
                />
              )}
            </div>

            {/* ─── TITRE ─── */}
            {phase >= 3 && (
              <div className="mt-8 sm:mt-10 flex flex-col items-center text-center">
                <div className="flex items-baseline justify-center gap-1 flex-wrap">
                  {titleChars.map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.4, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] }}
                      className="font-bold leading-none"
                      style={{
                        fontSize: "clamp(2.5rem, 9vw, 4rem)",
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
                    className="font-mono ml-2"
                    style={{
                      fontSize: "clamp(1rem, 3.5vw, 1.5rem)",
                      color: "rgba(111,168,255,0.7)",
                    }}
                  >
                    V6.1
                  </motion.span>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-3 tracking-[0.25em] uppercase"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "clamp(0.65rem, 2vw, 0.875rem)",
                  }}
                >
                  Journal de Trading · Simplicité Radicale
                </motion.p>
              </div>
            )}

            {/* ─── LOADING STEPS ─── */}
            {phase >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-10 sm:mt-12 flex flex-col gap-2.5 w-full max-w-[280px]"
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
                      <div
                        className="relative flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: `1.5px solid ${
                            isDone ? "#6fa8ff" : isActive ? "rgba(111,168,255,0.5)" : "rgba(255,255,255,0.15)"
                          }`,
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
                        className="font-mono tracking-wide"
                        style={{
                          color: isDone
                            ? "rgba(255,255,255,0.85)"
                            : isActive
                            ? "rgba(255,255,255,0.65)"
                            : "rgba(255,255,255,0.3)",
                          transition: "color 0.3s",
                          fontSize: "clamp(0.7rem, 2vw, 0.75rem)",
                        }}
                      >
                        {step.label}
                      </span>
                    </motion.div>
                  );
                })}

                <div
                  className="relative mt-4 w-full h-[2px] rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
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
          </div>

          {/* ═══ COUCHE FINALE : Particules qui montent (atmosphère) ═══ */}
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
                className="absolute w-1 h-1 rounded-full pointer-events-none"
                style={{
                  bottom: "20%",
                  left: "50%",
                  background: i % 3 === 0 ? "#f5d061" : "#6fa8ff",
                  boxShadow: `0 0 8px ${i % 3 === 0 ? "rgba(245,208,97,0.6)" : "rgba(111,168,255,0.6)"}`,
                }}
              />
            ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
