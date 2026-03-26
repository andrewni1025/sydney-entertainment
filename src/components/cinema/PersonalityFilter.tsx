"use client";

import { motion } from "framer-motion";

type Personality = "all" | "retro" | "sophisticated" | "mainstream";

interface PersonalityFilterProps {
  active: Personality;
  onChange: (p: Personality) => void;
}

const filters: { value: Personality; label: string; icon: string }[] = [
  { value: "all", label: "All Cinemas", icon: "✨" },
  { value: "retro", label: "Retro", icon: "📽️" },
  { value: "sophisticated", label: "Sophisticated", icon: "🍸" },
  { value: "mainstream", label: "Mainstream", icon: "🎬" },
];

const colorMap: Record<Personality, string> = {
  all: "rgba(255,255,255,0.2)",
  retro: "rgba(245,158,11,0.3)",
  sophisticated: "rgba(167,139,250,0.3)",
  mainstream: "rgba(59,130,246,0.3)",
};

export default function PersonalityFilter({
  active,
  onChange,
}: PersonalityFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {filters.map((f) => {
        const isActive = active === f.value;
        return (
          <motion.button
            key={f.value}
            onClick={() => onChange(f.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative px-5 py-2.5 rounded-full text-sm font-medium
              transition-all duration-300 cursor-pointer
              ${
                isActive
                  ? "text-white"
                  : "text-white/50 hover:text-white/70 glass"
              }
            `}
            style={
              isActive
                ? {
                    background: colorMap[f.value],
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    boxShadow: `0 0 20px ${colorMap[f.value]}`,
                  }
                : undefined
            }
          >
            <span className="mr-1.5">{f.icon}</span>
            {f.label}
          </motion.button>
        );
      })}
    </div>
  );
}
