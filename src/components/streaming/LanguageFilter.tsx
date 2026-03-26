"use client";

import { motion } from "framer-motion";

export interface Language {
  code: string;
  label: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "", label: "All", flag: "🌍" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
];

interface LanguageFilterProps {
  active: string;
  onChange: (code: string) => void;
}

export default function LanguageFilter({ active, onChange }: LanguageFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {LANGUAGES.map((l) => {
        const isActive = active === l.code;
        return (
          <motion.button
            key={l.code}
            onClick={() => onChange(l.code)}
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
            <span className="mr-1">{l.flag}</span>
            {l.label}
          </motion.button>
        );
      })}
    </div>
  );
}
