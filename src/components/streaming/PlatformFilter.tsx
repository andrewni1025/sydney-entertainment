"use client";

import { motion } from "framer-motion";
import { PROVIDER_INFO } from "@/lib/tmdb";
import { useCity } from "@/lib/CityContext";

interface PlatformFilterProps {
  active: number | null; // provider ID, null = all
  onChange: (id: number | null) => void;
}

const platforms = [
  { id: null, name: "All", nameZh: "全部", short: "ALL", color: "#ffffff" },
  ...Object.entries(PROVIDER_INFO).map(([id, info]) => ({
    id: Number(id),
    name: info.name,
    nameZh: info.name,
    short: info.short,
    color: info.color,
  })),
];

export default function PlatformFilter({ active, onChange }: PlatformFilterProps) {
  const { city } = useCity();
  const isZh = city.locale === "zh";
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((p) => {
        const isActive = active === p.id;
        return (
          <motion.button
            key={p.id ?? "all"}
            onClick={() => onChange(p.id)}
            whileTap={{ scale: 0.97 }}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
              transition-all duration-200 cursor-pointer border
              ${isActive
                ? "text-white/90 border-white/15 bg-white/[0.06]"
                : "text-white/30 border-white/[0.04] hover:text-white/50 hover:border-white/[0.08] bg-white/[0.02]"
              }
            `}
          >
            {p.id !== null && (
              <span
                className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white"
                style={{ background: p.color }}
              >
                {p.short}
              </span>
            )}
            {isZh ? p.nameZh : p.name}
          </motion.button>
        );
      })}
    </div>
  );
}
