"use client";

import { motion } from "framer-motion";
import { useCity } from "@/lib/CityContext";

export interface Genre {
  id: number;
  label: string;
  labelZh: string;
  icon: string;
}

export const GENRES: Genre[] = [
  { id: 0, label: "All", labelZh: "全部", icon: "🎞️" },
  { id: 28, label: "Action", labelZh: "动作", icon: "💥" },
  { id: 35, label: "Comedy", labelZh: "喜剧", icon: "😂" },
  { id: 10749, label: "Romance", labelZh: "爱情", icon: "💕" },
  { id: 878, label: "Sci-Fi", labelZh: "科幻", icon: "🚀" },
  { id: 27, label: "Horror", labelZh: "恐怖", icon: "👻" },
  { id: 53, label: "Thriller", labelZh: "悬疑", icon: "🔪" },
  { id: 18, label: "Drama", labelZh: "剧情", icon: "🎭" },
  { id: 16, label: "Animation", labelZh: "动画", icon: "🧸" },
  { id: 99, label: "Documentary", labelZh: "纪录片", icon: "📹" },
  { id: 14, label: "Fantasy", labelZh: "奇幻", icon: "🧙" },
];

interface GenreFilterProps {
  active: number;
  onChange: (genreId: number) => void;
}

export default function GenreFilter({ active, onChange }: GenreFilterProps) {
  const { city } = useCity();
  const isZh = city.locale === "zh";
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
            {isZh ? g.labelZh : g.label}
          </motion.button>
        );
      })}
    </div>
  );
}
