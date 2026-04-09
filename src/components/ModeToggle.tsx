"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCity } from "@/lib/CityContext";

interface ModeToggleProps {
  mode: "cinema" | "streaming";
  onToggle: (mode: "cinema" | "streaming") => void;
}

export default function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const isCinema = mode === "cinema";
  const { city } = useCity();
  const isZh = city.locale === "zh";
  const isJa = city.locale === "ja";
  const isCulture = city.goingOutMode === "culture";

  const outLabel = isJa ? "お出かけ" : isZh ? "出门看看" : "Night Out";
  const outShort = isJa ? "外出" : isZh ? "出门" : "Out";
  const outEmoji = isCulture ? "🎭" : "🌃";
  const inLabel = isJa ? "おうち映画" : isZh ? "在家观影" : "Cosy Night In";
  const inShort = isJa ? "家" : isZh ? "在家" : "In";
  const subtitle = isCinema
    ? (isJa
      ? (isCulture ? "展覧会 · 公演 · 美術館 · 博物館" : "東京のベストシネマ")
      : isZh
      ? (isCulture ? "展览 · 演出 · 博物馆 · 美术馆" : "精选影院，按你的心情匹配")
      : "Sydney's best cinemas, matched to your mood")
    : (isJa ? "ストリーミングで今夜の一本" : isZh ? "沙发上的好片推荐" : "Sofa-ready picks across your streaming apps");

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
            <span className="text-lg">{outEmoji}</span>
            <span className="hidden sm:inline">{outLabel}</span>
            <span className="sm:hidden">{outShort}</span>
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
            <span className="hidden sm:inline">{inLabel}</span>
            <span className="sm:hidden">{inShort}</span>
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
          {subtitle}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
