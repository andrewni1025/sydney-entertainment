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
    <div className="flex flex-col items-center gap-3">
      {/* Apple-style segmented control */}
      <div className="rounded-full p-1 flex gap-0.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => onToggle("cinema")}
          className="relative px-5 py-2.5 rounded-full cursor-pointer transition-colors duration-300"
        >
          {isCinema && (
            <motion.div
              layoutId="toggle-bg"
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className={`relative z-10 flex items-center gap-2 text-[13px] font-[family-name:var(--font-heading)] font-medium tracking-tight transition-colors duration-300 ${isCinema ? "text-white" : "text-white/30"}`}>
            <span className="text-base">{outEmoji}</span>
            <span className="hidden sm:inline">{outLabel}</span>
            <span className="sm:hidden">{outShort}</span>
          </span>
        </button>

        <button
          onClick={() => onToggle("streaming")}
          className="relative px-5 py-2.5 rounded-full cursor-pointer transition-colors duration-300"
        >
          {!isCinema && (
            <motion.div
              layoutId="toggle-bg"
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className={`relative z-10 flex items-center gap-2 text-[13px] font-[family-name:var(--font-heading)] font-medium tracking-tight transition-colors duration-300 ${!isCinema ? "text-white" : "text-white/30"}`}>
            <span className="text-base">🛋️</span>
            <span className="hidden sm:inline">{inLabel}</span>
            <span className="sm:hidden">{inShort}</span>
          </span>
        </button>
      </div>

      {/* Subtitle */}
      <AnimatePresence mode="wait">
        <motion.p
          key={mode}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-white/20 text-[11px] text-center tracking-tight"
        >
          {subtitle}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
