"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import CinemaMode from "@/components/cinema/CinemaMode";
import StreamingMode from "@/components/streaming/StreamingMode";

const AmbientBackground = dynamic(() => import("@/components/AmbientBackground"), { ssr: false });
const ModeToggle = dynamic(() => import("@/components/ModeToggle"), { ssr: false });

export default function Home() {
  const [mode, setMode] = useState<"cinema" | "streaming">("cinema");

  return (
    <div className="relative flex flex-1 flex-col items-center min-h-screen">
      <AmbientBackground mode={mode} />

      {/* Hero module — compact, cohesive */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-8 pb-2 text-center">
        {/* Brand */}
        <motion.div
          className="flex items-center justify-center gap-2.5 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-3xl sm:text-4xl">🌉</span>
          <span className="font-[family-name:var(--font-heading)] text-white/25 text-sm sm:text-base font-semibold tracking-[0.15em]">Sydney Entertainment Hub</span>
        </motion.div>

        {/* Toggle — part of hero, tight spacing */}
        <motion.div
          className="mb-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <ModeToggle mode={mode} onToggle={setMode} />
        </motion.div>
      </header>

      {/* Content */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-16 flex-1">
        <AnimatePresence mode="wait">
          {mode === "cinema" ? (
            <motion.div
              key="cinema"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <CinemaMode />
            </motion.div>
          ) : (
            <motion.div
              key="streaming"
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
      </footer>
    </div>
  );
}
