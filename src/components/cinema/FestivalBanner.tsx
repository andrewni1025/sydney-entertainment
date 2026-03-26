"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Festival {
  id: string;
  name: string;
  venue: string;
  startDate: string;
  endDate: string;
  description: string;
  ticketUrl: string;
  accentColor: string;
}

interface FestivalBannerProps {
  festival: Festival;
}

export default function FestivalBanner({ festival }: FestivalBannerProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const endDate = new Date(festival.endDate);
    const now = new Date();
    setDaysLeft(Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }, [festival.endDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${festival.accentColor}22, ${festival.accentColor}11)`,
        border: `1px solid ${festival.accentColor}33`,
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{
              background: festival.accentColor,
              animation: "pulse-glow 2s ease-in-out infinite",
              boxShadow: `0 0 8px ${festival.accentColor}`,
            }}
          />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Now Showing
            </span>
            <h3 className="font-[family-name:var(--font-heading)] text-sm sm:text-base font-bold text-white">
              {festival.name}
            </h3>
            <p className="text-white/40 text-xs">
              {festival.venue}{daysLeft !== null ? ` · ${daysLeft} days left` : ""}
            </p>
          </div>
        </div>
        <a
          href={festival.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:brightness-125"
          style={{
            background: festival.accentColor,
            boxShadow: `0 0 15px ${festival.accentColor}44`,
          }}
        >
          Get Tickets →
        </a>
      </div>
    </motion.div>
  );
}
