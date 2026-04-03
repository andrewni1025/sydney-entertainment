"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import topMovies from "@/data/top-movies.json";
import RatingRing from "./RatingRing";
import { formatDoubanScore } from "@/lib/ratings";
import { useCity } from "@/lib/CityContext";

interface TopMovie {
  id: number;
  title: string;
  titleZh?: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
  genres: string[];
  imdb: number | null;
  rottenTomatoes: number | null;
  rtFresh: boolean;
  douban: number | null;
  doubanOriginal: number | null;
  providers: number[];
}

// Get today's pool of 5 movies (deterministic by date)
function getDailyPool(): TopMovie[] {
  const allThree = (topMovies as TopMovie[]).filter(
    (m) => m.imdb !== null && m.rottenTomatoes !== null && m.douban !== null
  );
  if (allThree.length === 0) return [];

  // Score each movie: ratings + recency bonus
  const currentYear = new Date().getFullYear();
  const scored = allThree.map((m) => {
    const avg = ((m.imdb ?? 0) + (m.rottenTomatoes ?? 0) + (m.douban ?? 0)) / 3;
    const year = parseInt(m.releaseDate?.slice(0, 4) ?? "2000");
    // Recency bonus: movies from last 20 years get up to +10 points
    const recency = Math.max(0, Math.min(10, (year - (currentYear - 25)) / 2.5));
    return { movie: m, score: avg + recency };
  });

  // Sort by score descending, take top 30 as candidates
  scored.sort((a, b) => b.score - a.score);
  const candidates = scored.slice(0, 30);

  // Date-based seed to pick 5 from top 30
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  let s = seed;
  for (let i = candidates.length - 1; i > 0; i--) {
    s = ((s * 1103515245 + 12345) & 0x7fffffff);
    const j = s % (i + 1);
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates.slice(0, 5).map((c) => c.movie);
}

// Generate a recommendation reason based on ratings
function getRecommendReason(movie: TopMovie): string {
  const imdb = movie.imdb ?? 0;
  const rt = movie.rottenTomatoes ?? 0;
  const douban = movie.douban ?? 0;
  const avg = Math.round((imdb + rt + douban) / 3);

  if (avg >= 90) return "Triple 90+ — a masterpiece by any standard";
  if (imdb >= 85 && douban >= 85) return "IMDb & Douban both rate it highly — cross-cultural classic";
  if (rt >= 95) return "Near-perfect critics score — the pros love this one";
  if (douban >= 85) return "Douban favourite — deeply resonates with Chinese audiences";
  if (imdb >= 85) return "IMDb crowd favourite — universally loved";
  if (rt >= 85 && douban >= 80) return "Critics & Douban agree — quality filmmaking";
  return "Highly rated across all platforms";
}

function DoubanIcon() {
  return (
    <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-sm text-[11px] font-bold leading-none" style={{ background: "#00b51d", color: "#fff" }}>
      豆
    </span>
  );
}

export default function DailyPick() {
  const { city } = useCity();
  const isZh = city.locale === "zh";
  const [pool, setPool] = useState<TopMovie[]>([]);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dailyPool = getDailyPool();
    setPool(dailyPool);

    // Restore today's selection from localStorage
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem("dailyPick");
    if (saved) {
      try {
        const { date, idx } = JSON.parse(saved);
        if (date === today && idx < dailyPool.length) setIndex(idx);
      } catch { /* ignore */ }
    }
  }, []);

  if (!mounted || pool.length === 0) return null;

  const movie = pool[index];
  const year = movie.releaseDate?.slice(0, 4) || "";
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w780${movie.posterPath}`
    : null;

  function handleSwap() {
    const next = (index + 1) % pool.length;
    setIndex(next);
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("dailyPick", JSON.stringify({ date: today, idx: next }));
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">{isZh ? "今日推荐" : "Today's Pick"}</span>
        </div>
        <button
          onClick={handleSwap}
          className="text-white/25 text-[11px] hover:text-white/45 transition-colors cursor-pointer flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 4v6h6" /><path d="M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          {isZh ? "换一部试试" : "Not feeling it? Try another"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Background poster blur */}
          {posterUrl && (
            <div className="absolute inset-0">
              <img src={posterUrl} alt="" className="w-full h-full object-cover opacity-20 blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
            </div>
          )}

          <div className="relative flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
            {/* Poster */}
            {posterUrl && (
              <div className="flex-shrink-0 w-32 sm:w-40 mx-auto sm:mx-0">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full rounded-xl shadow-2xl"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-white leading-tight mb-1">
                  {isZh && movie.titleZh ? movie.titleZh : movie.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white/30 text-xs">{year}</span>
                  {movie.genres.slice(0, 3).map((g) => (
                    <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-white/40">{g}</span>
                  ))}
                </div>
                <p className="text-white/40 text-sm leading-relaxed line-clamp-3 mb-3">
                  {movie.overview}
                </p>
                {/* Recommendation reason */}
                <p className="text-orange-300/60 text-xs italic mb-4">
                  &ldquo;{getRecommendReason(movie)}&rdquo;
                </p>
              </div>

              {/* Ratings — large */}
              <div className="flex items-center gap-5">
                <RatingRing
                  score={movie.imdb}
                  color="#f5c518"
                  label="IMDb"
                  size={50}
                  displayValue={movie.imdb !== null ? (movie.imdb / 10).toFixed(1) : undefined}
                />
                <RatingRing
                  score={movie.rottenTomatoes}
                  color={movie.rtFresh ? "#6ac045" : "#fa320a"}
                  label=""
                  size={50}
                  displayValue={movie.rottenTomatoes !== null ? `${movie.rottenTomatoes}%` : undefined}
                  icon="🍅"
                />
                <RatingRing
                  score={movie.douban}
                  color="#00b51d"
                  label=""
                  size={50}
                  displayValue={formatDoubanScore(movie.doubanOriginal)}
                  icon={<DoubanIcon />}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
