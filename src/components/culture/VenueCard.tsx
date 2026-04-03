"use client";

import { motion } from "framer-motion";

interface Venue {
  id: string;
  name: string;
  type: string;
  area: string;
  tagline: string;
  description: string;
  highlights: string[];
  address: string;
  website: string;
  free: boolean;
}

interface VenueCardProps {
  venue: Venue;
  index: number;
  accentColor: string;
}

const typeConfig: Record<string, { emoji: string; label: string }> = {
  museum: { emoji: "🏛️", label: "博物馆" },
  gallery: { emoji: "🎨", label: "美术馆" },
};

export default function VenueCard({ venue, index, accentColor }: VenueCardProps) {
  const config = typeConfig[venue.type] ?? typeConfig.museum;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <a href={venue.website} target="_blank" rel="noopener noreferrer" className="group block">
        <div className="relative rounded-2xl overflow-hidden glass hover:border-white/20 hover:shadow-[0_8px_40px_rgba(228,184,78,0.08)] transition-all duration-500">
          <div className="p-5 flex flex-col">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: `${accentColor}15`, color: accentColor }}>
                  {config.emoji} {config.label}
                </span>
                <span className="text-white/20 text-[10px]">📍 {venue.area}</span>
                {venue.free && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/10">
                    免费
                  </span>
                )}
              </div>
              <h3 className="font-[family-name:var(--font-heading)] font-bold text-white text-lg group-hover:text-gold/80 transition-colors duration-300 leading-tight">
                {venue.name}
              </h3>
              <p className="text-white/30 text-[12px] italic mt-0.5">{venue.tagline}</p>
            </div>

            <p className="text-white/45 text-[13px] leading-relaxed mb-3">{venue.description}</p>

            {/* Bottom */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04]">
              <div className="flex flex-wrap gap-1.5">
                {venue.highlights.map((h) => (
                  <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/35">{h}</span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-300 group-hover:gap-2.5 flex-shrink-0" style={{ color: accentColor, border: `1px solid ${accentColor}35` }}>
                了解更多
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
