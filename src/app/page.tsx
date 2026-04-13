"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useCity } from "@/lib/CityContext";

const AmbientBackground = dynamic(() => import("@/components/AmbientBackground"), { ssr: false });
const ModeToggle = dynamic(() => import("@/components/ModeToggle"), { ssr: false });
const WeatherBadge = dynamic(() => import("@/components/WeatherBadge"), { ssr: false });
const CultureMode = dynamic(() => import("@/components/culture/CultureMode"), { ssr: false });
const CinemaMode = dynamic(() => import("@/components/cinema/CinemaMode"), { ssr: false });
const StreamingMode = dynamic(() => import("@/components/streaming/StreamingMode"), { ssr: false });
const CitySelector = dynamic(() => import("@/components/CitySelector"), { ssr: false });

export default function Home() {
  const [mode, setMode] = useState<"cinema" | "streaming">("cinema");
  const { city, isLanding, clearCity } = useCity();

  useEffect(() => {
    const saved = localStorage.getItem("entertainmentMode");
    if (saved === "cinema" || saved === "streaming") {
      setMode(saved);
    }
  }, []);

  const handleModeToggle = (m: "cinema" | "streaming") => {
    setMode(m);
    localStorage.setItem("entertainmentMode", m);
  };

  // Landing page — city selection
  if (isLanding) {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center min-h-screen">
        <AmbientBackground mode="cinema" />
        <div className="relative z-10 w-full">
          <CitySelector />
        </div>
      </div>
    );
  }

  const isChinese = city.locale === "zh";
  const isJapanese = city.locale === "ja";
  const isAsian = isChinese || isJapanese;
  const isCultureMode = city.goingOutMode === "culture";

  return (
    <motion.div
      className="relative flex flex-1 flex-col items-center min-h-screen"
      key={city.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AmbientBackground mode={mode} />

      {/* Hero module */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-5 pt-6 pb-2 text-center">
        {/* Top bar: back + weather */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={clearCity}
            className="flex items-center gap-1.5 text-white/20 hover:text-white/35 text-[11px] font-medium tracking-tight transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {isJapanese ? "都市切替" : isChinese ? "切换城市" : "Cities"}
          </button>
          <WeatherBadge />
        </div>

        {/* Brand */}
        <motion.div
          className="flex items-center justify-center gap-2.5 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-2xl sm:text-3xl">{city.emoji}</span>
          <span className="font-[family-name:var(--font-heading)] text-white/20 text-[13px] sm:text-sm font-medium tracking-[0.08em]">
            {city.nameZh ? `${city.nameZh} Entertainment` : city.locale === "ja" ? `${city.name} Entertainment` : "Sydney Entertainment Hub"}
          </span>
        </motion.div>

        {/* Toggle */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <ModeToggle mode={mode} onToggle={handleModeToggle} />
        </motion.div>
      </header>

      {/* Content */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-16 flex-1">
        <AnimatePresence mode="wait">
          {mode === "cinema" ? (
            <motion.div
              key={`going-out-${city.id}`}
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {isCultureMode ? <CultureMode /> : <CinemaMode />}
            </motion.div>
          ) : (
            <motion.div
              key={`staying-in-${city.id}`}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <StreamingMode />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-6 text-white/30 text-xs border-t border-white/5">
        <p>
          Movie data by{" "}
          <a href="https://www.themoviedb.org" className="underline hover:text-white/50" target="_blank" rel="noopener noreferrer">
            TMDB
          </a>
          {" "}· Streaming info by{" "}
          <a href="https://www.justwatch.com" className="underline hover:text-white/50" target="_blank" rel="noopener noreferrer">
            JustWatch
          </a>
        </p>
        <p className="mt-2 text-white/15">
          Feedback? <a href="mailto:entertainmenthub.feedback@gmail.com" className="underline hover:text-white/30">entertainmenthub.feedback@gmail.com</a>
        </p>
      </footer>
    </motion.div>
  );
}
