"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCity } from "@/lib/CityContext";
import PlatformFilter from "./PlatformFilter";
import type { SortOption } from "./SortFilter";
import GenreFilter from "./GenreFilter";
import LanguageFilter from "./LanguageFilter";
import MovieGrid from "./MovieGrid";
import type { MovieData } from "./MovieCard";
import DailyPick from "./DailyPick";

const GENRE_LABELS: Record<number, string> = {
  28: "Action", 35: "Comedy", 10749: "Romance", 878: "Sci-Fi",
  27: "Horror", 53: "Thriller", 18: "Drama", 16: "Animation",
  99: "Documentary", 14: "Fantasy",
};
const GENRE_LABELS_ZH: Record<number, string> = {
  28: "动作", 35: "喜剧", 10749: "爱情", 878: "科幻",
  27: "恐怖", 53: "悬疑", 18: "剧情", 16: "动画",
  99: "纪录片", 14: "奇幻",
};
const LANG_LABELS: Record<string, string> = {
  en: "English", zh: "Chinese", ja: "Japanese", ko: "Korean",
  fr: "French", hi: "Hindi", es: "Spanish",
};
const LANG_LABELS_ZH: Record<string, string> = {
  en: "英语", zh: "中文", ja: "日语", ko: "韩语",
  fr: "法语", hi: "印地语", es: "西班牙语",
};

export default function StreamingMode() {
  const { city } = useCity();
  const isZh = city.locale === "zh";
  const [platform, setPlatform] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>("top_rated");
  const [genre, setGenre] = useState<number>(0);
  const [language, setLanguage] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const hasActiveFilters = genre > 0 || language !== "";
  const filterCount = (genre > 0 ? 1 : 0) + (language ? 1 : 0);

  const fetchMovies = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(pageNum), sort });
        if (platform !== null) params.set("provider", String(platform));
        if (genre > 0) params.set("genre", String(genre));
        if (language) params.set("language", language);

        const res = await fetch(`/api/movies?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch movies");

        const data = await res.json();
        setMovies((prev) => (append ? [...prev, ...data.movies] : data.movies));
        setHasMore(data.hasMore);
      } catch (err) {
        console.error("Error fetching movies:", err);
        if (!append) setMovies([]);
      } finally {
        setLoading(false);
      }
    },
    [platform, sort, genre, language]
  );

  useEffect(() => {
    setPage(1);
    setMovies([]);
    fetchMovies(1);
  }, [fetchMovies]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(nextPage, true);
  };

  return (
    <div>
      {/* Daily Pick — hero recommendation */}
      <DailyPick />

      {/* Headline */}
      <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-white text-center mb-1.5">
        {isZh
          ? <>今晚<span className="text-orange-300/70">看什么</span>？</>
          : <>What should you watch <span className="text-orange-300/70">tonight</span>?</>
        }
      </h2>

      {/* Result promise — readable, trust-building */}
      <p className="text-white/30 text-xs text-center mb-6 max-w-sm mx-auto leading-relaxed">
        {isZh
          ? <>三重评分筛选 · IMDb + 烂番茄 + 豆瓣</>
          : <>Only films streaming in Australia<br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>Ranked by critics &amp; crowd ratings</>
        }
      </p>

      {/* === LEVEL 1: Platform === primary decision */}
      <div className="mb-5">
        <PlatformFilter active={platform} onChange={setPlatform} />
      </div>

      {/* === LEVEL 2: Sort + Filters === unified control bar */}
      <div className="flex items-center gap-3 mb-6">
        {/* Sort tabs — lighter weight */}
        <div className="flex gap-px bg-white/[0.025] rounded-lg p-px">
          {(["top_rated", "trending", "new"] as SortOption[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1 rounded-md text-[11px] transition-all duration-200 cursor-pointer
                ${sort === s ? "bg-white/[0.06] text-white/60 font-medium" : "text-white/20 hover:text-white/35"}`}
            >
              {s === "top_rated" ? (isZh ? "最高分" : "Top Rated") : s === "trending" ? (isZh ? "热门" : "Trending") : (isZh ? "最新" : "New")}
            </button>
          ))}
        </div>

        {/* Filters — inline with sort, not isolated */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all duration-200 cursor-pointer
            ${showFilters || hasActiveFilters
              ? "bg-white/[0.06] text-white/60"
              : "text-white/25 hover:text-white/40"
            }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          {filterCount > 0 ? (isZh ? `筛选 (${filterCount})` : `Filters (${filterCount})`) : (isZh ? "筛选" : "Filters")}
        </button>

        {/* Active filter tags — inline */}
        {hasActiveFilters && !showFilters && (
          <div className="flex items-center gap-1.5">
            {genre > 0 && (
              <button
                onClick={() => setGenre(0)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] text-white/25 text-[10px] cursor-pointer hover:text-white/40"
              >
                {GENRE_LABELS[genre] ?? (isZh ? GENRE_LABELS_ZH[genre] : "Genre")} <span className="opacity-30">✕</span>
              </button>
            )}
            {language && (
              <button
                onClick={() => setLanguage("")}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] text-white/25 text-[10px] cursor-pointer hover:text-white/40"
              >
                {(isZh ? LANG_LABELS_ZH[language] : LANG_LABELS[language]) ?? language} <span className="opacity-30">✕</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* === LEVEL 3: Expandable filters === compact drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg bg-white/[0.015] border border-white/[0.03] px-4 py-3 mb-5">
              <div className="mb-2.5">
                <span className="text-white/12 text-[9px] uppercase tracking-wider">{isZh ? "类型" : "Genre"}</span>
                <div className="mt-1">
                  <GenreFilter active={genre} onChange={setGenre} />
                </div>
              </div>
              <div className="h-px bg-white/[0.02] my-2" />
              <div>
                <span className="text-white/12 text-[9px] uppercase tracking-wider">{isZh ? "语言" : "Language"}</span>
                <div className="mt-1">
                  <LanguageFilter active={language} onChange={setLanguage} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Movie grid — content is the star */}
      <MovieGrid
        movies={movies}
        loading={loading}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />
    </div>
  );
}
