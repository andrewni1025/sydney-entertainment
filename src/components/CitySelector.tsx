"use client";

import { motion } from "framer-motion";
import { cityList, type CityConfig } from "@/lib/cities";
import { useCity } from "@/lib/CityContext";

const cityCardStyles: Record<string, { gradient: string; hoverGlow: string }> = {
  sydney: {
    gradient: "linear-gradient(135deg, rgba(228,184,78,0.08), rgba(228,184,78,0.02))",
    hoverGlow: "rgba(228,184,78,0.15)",
  },
  shanghai: {
    gradient: "linear-gradient(135deg, rgba(244,63,94,0.08), rgba(244,63,94,0.02))",
    hoverGlow: "rgba(244,63,94,0.15)",
  },
  suzhou: {
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))",
    hoverGlow: "rgba(16,185,129,0.15)",
  },
  changzhou: {
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02))",
    hoverGlow: "rgba(139,92,246,0.15)",
  },
};

function CityCard({ city, index }: { city: CityConfig; index: number }) {
  const { setCity } = useCity();
  const styles = cityCardStyles[city.id] ?? cityCardStyles.sydney;

  return (
    <motion.button
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
      onClick={() => setCity(city.id)}
      className="group relative block w-full text-left rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02]"
      style={{
        background: styles.gradient,
        border: `1px solid ${city.accentColor}15`,
      }}
      whileHover={{
        boxShadow: `0 12px 50px ${styles.hoverGlow}`,
        borderColor: `${city.accentColor}30`,
      }}
    >
      <div className="p-6 sm:p-8">
        {/* City header */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl sm:text-4xl">{city.emoji}</span>
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-white group-hover:text-white transition-colors">
              {city.nameZh ? `${city.nameZh}` : city.name}
              {city.nameZh && <span className="text-white/20 text-sm ml-2 font-normal">{city.name}</span>}
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: `${city.accentColor}99` }}>
              {city.tagline}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/35 text-[13px] leading-relaxed mb-4 line-clamp-2">
          {city.description}
        </p>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {city.goingOutMode === "cinema" ? (
              <>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30">🎬 Cinema</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30">🍿 Streaming</span>
              </>
            ) : (
              <>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30">🎭 展览演出</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30">🎬 在家观影</span>
              </>
            )}
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300 group-hover:gap-2.5"
            style={{ color: city.accentColor, border: `1px solid ${city.accentColor}30` }}
          >
            {city.locale === "zh" ? "进入" : "Explore"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function CitySelector() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Brand */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <span className="text-3xl sm:text-4xl">🌉</span>
          <span className="font-[family-name:var(--font-heading)] text-white/25 text-sm sm:text-base font-semibold tracking-[0.15em]">
            Sydney Entertainment Hub
          </span>
        </div>
        <p className="text-white/20 text-xs">Choose your city · 选择城市</p>
      </motion.div>

      {/* City grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cityList.map((city, i) => (
          <CityCard key={city.id} city={city} index={i} />
        ))}
      </div>

      {/* Footer */}
      <motion.p
        className="text-center text-white/10 text-[10px] mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        More cities coming soon
      </motion.p>
    </div>
  );
}
