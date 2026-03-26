"use client";

import { motion } from "framer-motion";

export type SortOption = "trending" | "top_rated" | "new";

interface SortFilterProps {
  active: SortOption;
  onChange: (sort: SortOption) => void;
}

const options: { value: SortOption; label: string; icon: string; desc: string }[] = [
  { value: "trending", label: "Trending", icon: "🔥", desc: "What everyone's watching" },
  { value: "top_rated", label: "Top Rated", icon: "⭐", desc: "Highest rated, 500+ votes" },
  { value: "new", label: "New Releases", icon: "🆕", desc: "Recently released" },
];

export default function SortFilter({ active, onChange }: SortFilterProps) {
  return (
    <div className="flex justify-center gap-3 mb-6">
      {options.map((o) => {
        const isActive = active === o.value;
        return (
          <motion.button
            key={o.value}
            onClick={() => onChange(o.value)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`
              flex flex-col items-center gap-1 px-5 py-3 rounded-xl text-xs font-medium
              transition-all duration-300 cursor-pointer
              ${
                isActive
                  ? "text-white glass border-white/20 shadow-[0_0_20px_rgba(167,139,250,0.15)]"
                  : "text-white/35 hover:text-white/55 bg-white/[0.02] border border-transparent hover:border-white/10"
              }
            `}
          >
            <span className="text-lg">{o.icon}</span>
            <span className="font-semibold">{o.label}</span>
            <span className="text-[10px] text-white/30 hidden sm:block">{o.desc}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
