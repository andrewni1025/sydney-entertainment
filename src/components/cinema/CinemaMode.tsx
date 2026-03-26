"use client";

import { useState, useEffect } from "react";
import cinemas from "@/data/cinemas.json";
import festivals from "@/data/festivals.json";
import CinemaCard from "./CinemaCard";

type Personality = "all" | "retro" | "sophisticated" | "mainstream";
type Area = "all" | "cbd" | "inner-west" | "east" | "north-shore";

const areas: { value: Area; label: string }[] = [
  { value: "all", label: "Anywhere" },
  { value: "cbd", label: "CBD" },
  { value: "inner-west", label: "Inner West" },
  { value: "east", label: "Eastern" },
  { value: "north-shore", label: "North Shore" },
];

export default function CinemaMode() {
  const [mood, setMood] = useState<Personality>("all");
  const [area, setArea] = useState<Area>("all");
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  const filtered = cinemas.filter((c) => {
    if (mood !== "all" && c.personality !== mood) return false;
    if (area !== "all" && c.area !== area) return false;
    return true;
  });

  // Active festivals
  const activeFestivals = today
    ? festivals.filter((f) => f.startDate <= today && f.endDate >= today)
    : [];

  // Build "this week" highlights
  const weekHighlights: string[] = [];
  if (activeFestivals.length > 0) weekHighlights.push(activeFestivals[0].name);
  const discountCinemas = cinemas.filter((c) => c.discount);
  if (discountCinemas.length > 0) {
    weekHighlights.push(
      ...discountCinemas.map((c) => `${c.discount!.day} deals at ${c.name}`)
    );
  }
  weekHighlights.push("Golden Age late sessions");

  return (
    <div>
      {/* Headline — #8 smoother wording */}
      <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-white text-center mb-1">
        Find your perfect <span className="text-gold/80">Sydney cinema</span> tonight
      </h2>
      <p className="text-white/25 text-[11px] text-center mb-5">
        Curated by vibe and location — not just what&apos;s screening
      </p>

      {/* Filter row: Mood + Area — #4 no divider line, use spacing */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
        {/* Mood group */}
        <div className="flex gap-px bg-white/[0.03] rounded-lg p-px">
          {([
            { value: "all" as const, label: "All", icon: "✨" },
            { value: "retro" as const, label: "Retro", icon: "📽️" },
            { value: "sophisticated" as const, label: "Fancy", icon: "🍸" },
            { value: "mainstream" as const, label: "Big Screen", icon: "🎬" },
          ]).map((f) => (
            <button
              key={f.value}
              onClick={() => setMood(f.value)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 cursor-pointer
                ${mood === f.value ? "bg-white/[0.08] text-white/70" : "text-white/25 hover:text-white/40"}`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Area group — lighter, secondary */}
        <div className="flex gap-px bg-white/[0.02] rounded-lg p-px">
          {areas.map((a) => (
            <button
              key={a.value}
              onClick={() => setArea(a.value)}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 cursor-pointer
                ${area === a.value ? "bg-white/[0.06] text-white/60" : "text-white/20 hover:text-white/35"}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* This week — #5 badge-style, #3 lighter than Top Pick */}
      {(weekHighlights.length > 0 || activeFestivals.length > 0) && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6">
          <span className="text-white/15 text-[10px] uppercase tracking-wider mr-1">This week</span>
          {activeFestivals.map((f) => (
            <a
              key={f.id}
              href={f.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] px-2 py-0.5 rounded bg-gold/8 text-gold/60 hover:text-gold/80 transition-colors"
            >
              🎪 {f.name}
            </a>
          ))}
          {weekHighlights.filter((_, i) => activeFestivals.length === 0 || i > 0).map((h, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-white/25">
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <p className="text-lg mb-2">No cinemas match that combo</p>
          <p className="text-sm">Try a different mood or area</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map((cinema, i) => (
            <CinemaCard key={cinema.id} cinema={cinema} index={i} featured={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
