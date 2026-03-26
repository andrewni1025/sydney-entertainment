"use client";

import { motion } from "framer-motion";
import RatingRing from "./RatingRing";
import type { AggregatedRatings } from "@/lib/ratings";
import { formatDoubanScore } from "@/lib/ratings";
import { PROVIDER_INFO } from "@/lib/tmdb";

export interface MovieData {
  id: number;
  title: string;
  overview: string;
  posterUrl: string;
  releaseDate: string;
  genres: string[];
  ratings: AggregatedRatings;
  providers: number[];
}

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
  const year = movie.releaseDate?.slice(0, 4) || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_40px_rgba(167,139,250,0.15)] glass"
    >
      {/* Poster — clean, no overlay text */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
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
            {movie.overview || "No synopsis available."}
          </p>
        </div>
      </div>

      {/* Info section — below poster */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Title & meta */}
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-[12px] sm:text-sm font-bold text-white leading-tight line-clamp-1">
            {movie.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
            <span className="text-white/35 text-[10px] sm:text-xs">{year}</span>
            {movie.genres.slice(0, 1).map((g) => (
              <span
                key={g}
                className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full bg-white/8 text-white/45 hidden sm:inline"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/8" />

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
