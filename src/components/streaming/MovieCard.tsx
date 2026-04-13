"use client";

import { motion } from "framer-motion";
import RatingRing from "./RatingRing";
import type { AggregatedRatings } from "@/lib/ratings";
import { formatDoubanScore } from "@/lib/ratings";
import { PROVIDER_INFO } from "@/lib/tmdb";

import { useCity } from "@/lib/CityContext";

export interface MovieData {
  id: number;
  title: string;
  titleZh?: string;
  overview: string;
  overviewZh?: string;
  posterUrl: string;
  releaseDate: string;
  genres: string[];
  ratings: AggregatedRatings;
  providers: number[];
}

const GENRE_ZH: Record<string, string> = {
  Action: "动作", Comedy: "喜剧", Romance: "爱情", "Sci-Fi": "科幻",
  "Science Fiction": "科幻", Horror: "恐怖", Thriller: "悬疑", Drama: "剧情",
  Animation: "动画", Documentary: "纪录片", Fantasy: "奇幻",
  Adventure: "冒险", Crime: "犯罪", Mystery: "悬疑", War: "战争",
  Family: "家庭", History: "历史", Music: "音乐", Western: "西部",
};

interface MovieCardProps {
  movie: MovieData;
  index: number;
}

function DoubanIcon() {
  return (
    <span
      className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-sm text-[10px] font-bold leading-none"
      style={{ background: "#00b51d", color: "#fff" }}
    >
      豆
    </span>
  );
}

export default function MovieCard({ movie, index }: MovieCardProps) {
  const { city } = useCity();
  const isZh = city.locale === "zh";
  const displayTitle = isZh && movie.titleZh ? movie.titleZh : movie.title;
  const year = movie.releaseDate?.slice(0, 4) || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className="group relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Subtle vignette only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Platform badges - top right */}
        {movie.providers.length > 0 && (
          <div className="absolute top-2.5 right-2.5 flex gap-1.5">
            {movie.providers.map((pid) => {
              const info = PROVIDER_INFO[pid];
              if (!info) return null;
              return (
                <span
                  key={pid}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
                  style={{
                    background: info.color,
                    boxShadow: `0 2px 8px ${info.color}66`,
                  }}
                  title={info.name}
                >
                  {info.short}
                </span>
              );
            })}
          </div>
        )}

        {/* Synopsis overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5">
          <p className="text-white/80 text-xs leading-relaxed line-clamp-[8] text-center">
            {(isZh && movie.overviewZh) ? movie.overviewZh : movie.overview || (isZh ? "暂无简介" : "No synopsis available.")}
          </p>
        </div>
      </div>

      {/* Info section */}
      <div className="p-3.5 sm:p-4 space-y-2.5">
        {/* Title & meta */}
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-[13px] sm:text-sm font-semibold text-white/95 leading-tight line-clamp-1 tracking-tight">
            {displayTitle}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-white/30 text-[10px] sm:text-xs">{year}</span>
            {movie.genres.slice(0, 1).map((g) => (
              <span
                key={g}
                className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-white/35 hidden sm:inline"
              >
                {isZh ? (GENRE_ZH[g] ?? g) : g}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06]" />

        {/* Triple ratings */}
        <div className="flex items-center justify-between">
          <RatingRing
            score={movie.ratings.imdb}
            color="#f5c518"
            label="IMDb"
            size={42}
            displayValue={
              movie.ratings.imdb !== null
                ? (movie.ratings.imdb / 10).toFixed(1)
                : undefined
            }
          />
          <RatingRing
            score={movie.ratings.rottenTomatoes}
            color={movie.ratings.rtFresh ? "#6ac045" : "#fa320a"}
            label="RT"
            size={42}
            displayValue={
              movie.ratings.rottenTomatoes !== null
                ? `${movie.ratings.rottenTomatoes}%`
                : undefined
            }
            icon="🍅"
          />
          <RatingRing
            score={movie.ratings.douban}
            color="#00b51d"
            label="Douban"
            size={42}
            displayValue={formatDoubanScore(movie.ratings.doubanOriginal)}
            icon={<DoubanIcon />}
          />
        </div>
      </div>
    </motion.div>
  );
}
