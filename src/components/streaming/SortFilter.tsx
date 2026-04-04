"use client";

import { motion } from "framer-motion";
import { useCity } from "@/lib/CityContext";

export type SortOption = "trending" | "top_rated" | "new";

interface SortFilterProps {
  active: SortOption;
  onChange: (sort: SortOption) => void;
}

const options: { value: SortOption; label: string; labelZh: string; icon: string; desc: string; descZh: string }[] = [
  { value: "trending", label: "Trending", labelZh: "热门", icon: "🔥", desc: "What everyone's watching", descZh: "大家都在看" },
  { value: "top_rated", label: "Top Rated", labelZh: "最高分", icon: "⭐", desc: "Highest rated, 500+ votes", descZh: "三平台高分精选" },
  { value: "new", label: "New Releases", labelZh: "最新", icon: "🆕", desc: "Recently released", descZh: "近期上映" },
];

export default function SortFilter({ active, onChange }: SortFilterProps) {
  const { city } = useCity();
  const isZh = city.locale === "zh";
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
            <span className="font-semibold">{isZh ? o.labelZh : o.label}</span>
            <span className="text-[10px] text-white/30 hidden sm:block">{isZh ? o.descZh : o.desc}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
