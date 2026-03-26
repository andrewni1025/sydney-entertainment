"use client";

import { motion } from "framer-motion";

interface Cinema {
  id: string;
  name: string;
  personality: string;
  area: string;
  tagline: string;
  vibe: string;
  whyGo: string;
  bestFor: string;
  tonightSpecial: string;
  highlights: string[];
  address: string;
  suburb: string;
  website: string;
  photo: string;
  discount: { day: string; price: string; label: string } | null;
}

interface CinemaCardProps {
  cinema: Cinema;
  index: number;
  featured?: boolean;
}

const personalityConfig: Record<string, { emoji: string; color: string }> = {
  retro: { emoji: "📽️", color: "#f59e0b" },
  sophisticated: { emoji: "🍸", color: "#a78bfa" },
  mainstream: { emoji: "🎬", color: "#3b82f6" },
};

export default function CinemaCard({ cinema, index, featured = false }: CinemaCardProps) {
  const config = personalityConfig[cinema.personality] ?? personalityConfig.mainstream;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Top Pick label for first result */}
      {featured && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gold text-xs font-bold uppercase tracking-widest">⭐ Top Pick for Tonight</span>
          <div className="flex-1 h-px bg-gold/20" />
        </div>
      )}

      <a
        href={cinema.website}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className={`
          relative rounded-2xl overflow-hidden
          transition-all duration-500
          ${featured
            ? "glass border-gold/20 hover:border-gold/40 hover:shadow-[0_8px_50px_rgba(228,184,78,0.15)]"
            : "glass hover:border-white/20 hover:shadow-[0_8px_40px_rgba(228,184,78,0.08)]"
          }
        `}>
          <div className="flex flex-col md:flex-row">
            {/* Photo */}
            <div className={`relative w-full ${featured ? "md:w-96" : "md:w-72"} h-56 md:h-auto flex-shrink-0 overflow-hidden`}>
              <img
                src={cinema.photo}
                alt={cinema.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 md:hidden" />

              {/* Discount badge */}
              {cinema.discount && (
                <div
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold text-black"
                  style={{
                    background: "linear-gradient(90deg, #e4b84e, #f5d78e, #e4b84e)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s linear infinite",
                  }}
                >
                  🎟️ {cinema.discount.label}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col">
              {/* Header — tight grouping */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{
                      background: `${config.color}10`,
                      color: config.color,
                    }}
                  >
                    {config.emoji} {cinema.personality}
                  </span>
                  <span className="text-white/20 text-[10px]">📍 {cinema.suburb}</span>
                </div>
                <h3 className={`font-[family-name:var(--font-heading)] font-bold text-white group-hover:text-gold/80 transition-colors duration-300 leading-tight ${featured ? "text-xl" : "text-lg"}`}>
                  {cinema.name}
                </h3>
                <p className="text-white/30 text-[12px] italic mt-0.5">{cinema.tagline}</p>
              </div>

              {/* Editorial — labels tiny, content readable */}
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <span className="text-white/15 text-[9px] font-medium uppercase tracking-wider flex-shrink-0 w-12 pt-0.5">Why</span>
                  <p className="text-white/50 text-[13px] leading-relaxed">{cinema.whyGo}</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-white/15 text-[9px] font-medium uppercase tracking-wider flex-shrink-0 w-12 pt-0.5">For</span>
                  <p className="text-white/40 text-[13px]">{cinema.bestFor}</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-white/15 text-[9px] font-medium uppercase tracking-wider flex-shrink-0 w-12 pt-0.5">Tonight</span>
                  <p className="text-white/40 text-[13px]">{cinema.tonightSpecial}</p>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                {/* Highlight pills */}
                <div className="flex flex-wrap gap-1.5">
                  {cinema.highlights.slice(0, 3).map((h) => (
                    <span
                      key={h}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/35"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300 group-hover:gap-2.5 flex-shrink-0"
                  style={{
                    color: config.color,
                    border: `1px solid ${config.color}35`,
                    background: `${config.color}08`,
                  }}
                >
                  Book Now
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
