"use client";

import { motion } from "framer-motion";

export interface Genre {
  id: number;
  label: string;
  icon: string;
}

export const GENRES: Genre[] = [
  { id: 0, label: "All", icon: "🎞️" },
  { id: 28, label: "Action", icon: "💥" },
  { id: 35, label: "Comedy", icon: "😂" },
  { id: 10749, label: "Romance", icon: "💕" },
  { id: 878, label: "Sci-Fi", icon: "🚀" },
  { id: 27, label: "Horror", icon: "👻" },
  { id: 53, label: "Thriller", icon: "🔪" },
  { id: 18, label: "Drama", icon: "🎭" },
  { id: 16, label: "Animation", icon: "🧸" },
  { id: 99, label: "Documentary", icon: "📹" },
  { id: 14, label: "Fantasy", icon: "🧙" },
];

interface GenreFilterProps {
  active: number;
  onChange: (genreId: number) => void;
}

export default function GenreFilter({ active, onChange }: GenreFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {GENRES.map((g) => {
        const isActive = active === g.id;
        return (
          <motion.button
            key={g.id}
            onClick={() => onChange(g.id)}
            whileTap={{ scale: 0.95 }}
            className={`
              px-2.5 py-1 rounded-md text-[11px] font-medium
              transition-all duration-200 cursor-pointer
              ${isActive
                ? "text-white/60 bg-white/[0.08]"
                : "text-white/20 hover:text-white/35 bg-transparent"
              }
            `}
          >
            <span className="mr-1">{g.icon}</span>
            {g.label}
          </motion.button>
        );
      })}
    </div>
  );
}
