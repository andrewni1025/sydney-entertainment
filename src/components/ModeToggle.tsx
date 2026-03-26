"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ModeToggleProps {
  mode: "cinema" | "streaming";
  onToggle: (mode: "cinema" | "streaming") => void;
}

export default function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const isCinema = mode === "cinema";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Card-style toggle */}
      <div className="glass rounded-2xl p-1.5 flex gap-1">
        <button
          onClick={() => onToggle("cinema")}
          className="relative px-6 py-3 rounded-xl cursor-pointer transition-colors duration-300"
        >
          {isCinema && (
            <motion.div
              layoutId="toggle-bg"
              className="absolute inset-0 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(228,184,78,0.12), rgba(228,184,78,0.03))",
                border: "1px solid rgba(228,184,78,0.15)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className={`relative z-10 flex items-center gap-2 text-sm font-[family-name:var(--font-heading)] font-semibold transition-colors duration-300 ${isCinema ? "text-gold" : "text-white/30"}`}>
            <span className="text-lg">🌃</span>
            <span className="hidden sm:inline">Night Out</span>
            <span className="sm:hidden">Out</span>
          </span>
        </button>

        <button
          onClick={() => onToggle("streaming")}
          className="relative px-6 py-3 rounded-xl cursor-pointer transition-colors duration-300"
        >
          {!isCinema && (
            <motion.div
              layoutId="toggle-bg"
              className="absolute inset-0 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(251,146,60,0.12), rgba(251,146,60,0.03))",
                border: "1px solid rgba(251,146,60,0.15)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className={`relative z-10 flex items-center gap-2 text-sm font-[family-name:var(--font-heading)] font-semibold transition-colors duration-300 ${!isCinema ? "text-orange-300" : "text-white/30"}`}>
            <span className="text-lg">🛋️</span>
            <span className="hidden sm:inline">Cosy Night In</span>
            <span className="sm:hidden">In</span>
          </span>
        </button>
      </div>

      {/* Subtitle — context-aware, not italic */}
      <AnimatePresence mode="wait">
        <motion.p
          key={mode}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-white/20 text-[11px] text-center"
        >
          {isCinema
            ? "Sydney's best cinemas, matched to your mood"
            : "Sofa-ready picks across your streaming apps"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
