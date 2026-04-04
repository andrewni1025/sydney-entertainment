"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cityList, type CityConfig } from "@/lib/cities";
import { useCity } from "@/lib/CityContext";
import { useCityWeather } from "@/lib/weather";
import CitySkyline from "./CitySkyline";

const cityCardStyles: Record<string, { gradient: string; hoverGlow: string; orbColor: string }> = {
  sydney: {
    gradient: "linear-gradient(135deg, rgba(228,184,78,0.06), rgba(228,184,78,0.01))",
    hoverGlow: "rgba(228,184,78,0.2)",
    orbColor: "rgba(228,184,78,0.15)",
  },
  shanghai: {
    gradient: "linear-gradient(135deg, rgba(244,63,94,0.06), rgba(244,63,94,0.01))",
    hoverGlow: "rgba(244,63,94,0.2)",
    orbColor: "rgba(244,63,94,0.15)",
  },
  suzhou: {
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.01))",
    hoverGlow: "rgba(16,185,129,0.2)",
    orbColor: "rgba(16,185,129,0.15)",
  },
  changzhou: {
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(139,92,246,0.01))",
    hoverGlow: "rgba(139,92,246,0.2)",
    orbColor: "rgba(139,92,246,0.15)",
  },
};

/* Floating orb behind each card on hover */
function CardOrb({ color, active }: { color: string; active: boolean }) {
  return (
    <motion.div
      className="absolute -z-10 rounded-full blur-[80px] pointer-events-none"
      style={{ width: "70%", height: "70%", top: "15%", left: "15%", background: color }}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1.1 : 0.8 }}
      transition={{ duration: 0.6 }}
    />
  );
}

function CityWeatherBadge({ city }: { city: CityConfig }) {
  const weather = useCityWeather(city);
  if (!weather) return null;
  const icon = weather.condition === "rain" ? "🌧" : weather.condition === "storm" ? "⛈" : weather.condition === "cloud" ? "☁️" : weather.condition === "fog" ? "🌫" : "☀️";
  return (
    <span className="text-white/25 text-[10px]">
      {icon} {weather.temp}°
    </span>
  );
}

function CityCard({ city, index }: { city: CityConfig; index: number }) {
  const { setCity } = useCity();
  const styles = cityCardStyles[city.id] ?? cityCardStyles.sydney;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => setCity(city.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block w-full text-left rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.03]"
      style={{
        background: styles.gradient,
        border: `1px solid ${city.accentColor}12`,
      }}
      whileHover={{
        boxShadow: `0 16px 60px ${styles.hoverGlow}`,
        borderColor: `${city.accentColor}35`,
      }}
    >
      <CardOrb color={styles.orbColor} active={hovered} />

      <div className="relative p-6 sm:p-8">
        {/* City header */}
        <div className="flex items-center gap-3 mb-3">
          <motion.span
            className="text-3xl sm:text-4xl"
            animate={{ rotate: hovered ? [0, -8, 8, -4, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            {city.emoji}
          </motion.span>
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-white group-hover:text-white transition-colors">
              {city.nameZh ? `${city.nameZh}` : city.name}
              {city.nameZh && <span className="text-white/20 text-sm ml-2 font-normal">{city.name}</span>}
            </h2>
            <p className="text-[13px] mt-0.5 transition-colors duration-300" style={{ color: hovered ? `${city.accentColor}cc` : `${city.accentColor}80` }}>
              {city.tagline}
            </p>
            <CityWeatherBadge city={city} />
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
          <motion.span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300"
            style={{ color: city.accentColor, border: `1px solid ${city.accentColor}30` }}
            animate={{ gap: hovered ? "10px" : "6px" }}
          >
            {city.locale === "zh" ? "进入" : "Explore"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.span>
        </div>
      </div>
    </motion.button>
  );
}

/* Animated particles floating in the background */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * 10,
    color: ["#e4b84e", "#f43f5e", "#10b981", "#8b5cf6"][i % 4],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            opacity: 0.2,
          }}
          animate={{
            y: [0, -80, -40, -120, 0],
            x: [0, 30, -20, 10, 0],
            opacity: [0.1, 0.3, 0.15, 0.25, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* Typing effect for the subtitle */
function TypingText() {
  const phrases = ["Choose your city", "选择你的城市", "Explore culture", "发现精彩"];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrent((c) => (c + 1) % phrases.length), 3000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={current}
        className="text-white/20 text-xs h-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {phrases[current]}
      </motion.p>
    </AnimatePresence>
  );
}

export default function CitySelector() {
  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-8">
      <FloatingParticles />

      {/* Composite skyline background — all 4 cities faintly overlaid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {cityList.map((c, i) => (
          <div key={c.id} style={{ opacity: 0.02 + i * 0.005, transform: `translateX(${i * 5 - 8}%)` }}>
            <CitySkyline cityId={c.id} opacity={0.04} />
          </div>
        ))}
      </div>

      {/* Brand — larger, more dramatic */}
      <motion.div
        className="relative text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          className="block text-5xl sm:text-6xl mb-3"
          animate={{ rotate: [0, -3, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🌉
        </motion.span>
        <h1 className="font-[family-name:var(--font-heading)] text-white/20 text-base sm:text-lg font-semibold tracking-[0.2em] mb-2">
          ENTERTAINMENT HUB
        </h1>
        <TypingText />
      </motion.div>

      {/* City grid */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
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
