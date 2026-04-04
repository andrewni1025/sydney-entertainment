"use client";

import { motion } from "framer-motion";
import { useCity } from "@/lib/CityContext";

export interface Language {
  code: string;
  label: string;
  labelZh: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "", label: "All", labelZh: "全部", flag: "🌍" },
  { code: "en", label: "English", labelZh: "英语", flag: "🇬🇧" },
  { code: "zh", label: "Chinese", labelZh: "中文", flag: "🇨🇳" },
  { code: "ja", label: "Japanese", labelZh: "日语", flag: "🇯🇵" },
  { code: "ko", label: "Korean", labelZh: "韩语", flag: "🇰🇷" },
  { code: "fr", label: "French", labelZh: "法语", flag: "🇫🇷" },
  { code: "hi", label: "Hindi", labelZh: "印地语", flag: "🇮🇳" },
  { code: "es", label: "Spanish", labelZh: "西班牙语", flag: "🇪🇸" },
];

interface LanguageFilterProps {
  active: string;
  onChange: (code: string) => void;
}

export default function LanguageFilter({ active, onChange }: LanguageFilterProps) {
  const { city } = useCity();
  const isZh = city.locale === "zh";
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
            {isZh ? l.labelZh : l.label}
          </motion.button>
        );
      })}
    </div>
  );
}
