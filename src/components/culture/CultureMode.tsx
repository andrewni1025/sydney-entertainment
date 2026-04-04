"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCity } from "@/lib/CityContext";
import cultureData from "@/data/culture-venues.json";
import VenueCard from "./VenueCard";

type Tab = "all" | "exhibition" | "performance" | "museum";
type AreaFilter = string;

function getEventTag(event: { tag?: string; name: string; dateRange: string; id: string }, today: string): { label: string; color: string } | null {
  if (event.tag) {
    const tagMap: Record<string, { label: string; color: string }> = {
      hot: { label: "🔥 热门", color: "#ef4444" },
      "sold-out": { label: "已售罄", color: "#6b7280" },
      free: { label: "免费", color: "#10b981" },
      new: { label: "新", color: "#3b82f6" },
    };
    return tagMap[event.tag] ?? null;
  }
  // Auto-detect
  if (event.name.includes("售罄") || event.name.includes("Sold Out")) return { label: "已售罄", color: "#6b7280" };
  if (event.dateRange.includes("每周") || event.dateRange.includes("常设") || event.dateRange.includes("常驻")) return { label: "免费/常设", color: "#10b981" };
  // Ending soon (within 7 days)
  if (today) {
    const endMatch = event.id; // just to use today
    if (endMatch) {
      // Can't easily parse endDate here, skip
    }
  }
  return null;
}

interface CultureEvent {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  startDate: string;
  endDate: string;
  venue: string;
  description: string;
  ticketUrl: string;
  accentColor: string;
  tag?: string;
  address?: string;
}

interface CultureVenue {
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

export default function CultureMode() {
  const { city } = useCity();
  const [tab, setTab] = useState<Tab>("all");
  const [area, setArea] = useState<AreaFilter>("all");
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  const cityData = (cultureData as Record<string, { museums: CultureVenue[]; events: CultureEvent[] }>)[city.id];
  if (!cityData) return null;

  const museums = cityData.museums;
  const events = cityData.events;

  // Active & upcoming events (show events ending in the future)
  const activeEvents = today
    ? events.filter((e) => e.endDate >= today)
    : events;

  // Split into ongoing vs upcoming
  const ongoingEvents = today ? activeEvents.filter((e) => e.startDate <= today) : activeEvents;
  const upcomingEvents = today ? activeEvents.filter((e) => e.startDate > today) : [];

  // Filter museums by area
  const filteredMuseums = area === "all" ? museums : museums.filter((m) => m.area === area);

  // Filter events by area if they have the field, otherwise show all
  const filterByArea = (evts: CultureEvent[]) => area === "all"
    ? evts
    : evts.filter((e) => {
        const evt = e as unknown as Record<string, unknown>;
        return !evt.area || evt.area === area;
      });

  // Filter by tab
  const showEvents = tab === "all" || tab === "exhibition" || tab === "performance";
  const showMuseums = tab === "all" || tab === "museum";

  const filterByTab = (evts: CultureEvent[]) => showEvents
    ? evts.filter((e) => {
        if (tab === "exhibition") return e.type === "exhibition" || e.type === "festival";
        if (tab === "performance") return e.type === "performance";
        return true;
      })
    : [];

  const filteredOngoing = filterByTab(filterByArea(ongoingEvents));
  const filteredUpcoming = filterByTab(filterByArea(upcomingEvents));

  const tabs: { value: Tab; label: string; icon: string }[] = [
    { value: "all", label: "全部", icon: "✨" },
    { value: "exhibition", label: "展览", icon: "🖼️" },
    { value: "performance", label: "演出", icon: "🎭" },
    { value: "museum", label: "场馆", icon: "🏛️" },
  ];

  return (
    <div>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-white text-center mb-1">
        {city.nameZh ?? city.name}
        <span style={{ color: city.accentColor + "cc" }}>，出门看什么？</span>
      </h2>
      <p className="text-white/25 text-[11px] text-center mb-5">
        展览 · 演出 · 博物馆 · 美术馆 — 精选文化去处
      </p>

      {/* Tab + Area filters */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
        <div className="flex gap-px bg-white/[0.03] rounded-lg p-px">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 cursor-pointer
                ${tab === t.value ? "bg-white/[0.08] text-white/70" : "text-white/25 hover:text-white/40"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-px bg-white/[0.02] rounded-lg p-px">
          {city.areas.map((a) => (
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

      {/* Active events */}
      {filteredOngoing.length > 0 && showEvents && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/15 text-[10px] uppercase tracking-wider">正在进行</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {filteredOngoing.map((event, i) => {
                const tag = getEventTag(event, today);
                const navUrl = `https://maps.apple.com/?q=${encodeURIComponent(event.venue)}`;
                return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-xl p-4 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: `${event.accentColor}15`, color: event.accentColor }}>
                        {event.type === "exhibition" ? "🖼️ 展览" : event.type === "performance" ? "🎭 演出" : "🎬 电影节"}
                      </span>
                      {tag && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${tag.color}20`, color: tag.color }}>{tag.label}</span>}
                    </div>
                    <span className="text-white/20 text-[10px]">{event.dateRange}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-white text-sm mb-1">
                    {event.name}
                  </h3>
                  <p className="text-white/30 text-[11px] mb-2">📍 {event.venue}</p>
                  <p className="text-white/40 text-[12px] leading-relaxed line-clamp-2 mb-3">{event.description}</p>
                  <div className="flex items-center gap-2">
                    <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 hover:brightness-110"
                      style={{ background: `${event.accentColor}20`, color: event.accentColor, border: `1px solid ${event.accentColor}30` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      🎫 购票
                    </a>
                    <a href={navUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/40 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white/60 transition-all duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🗺️ 导航
                    </a>
                  </div>
                </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Upcoming events */}
      {filteredUpcoming.length > 0 && showEvents && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/15 text-[10px] uppercase tracking-wider">即将到来</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {filteredUpcoming.map((event, i) => {
                const tag = getEventTag(event, today);
                const navUrl = `https://maps.apple.com/?q=${encodeURIComponent(event.venue)}`;
                return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-xl p-4 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: `${event.accentColor}15`, color: event.accentColor }}>
                        {event.type === "exhibition" ? "🖼️ 展览" : event.type === "performance" ? "🎭 演出" : "🎬 电影节"}
                      </span>
                      {tag && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${tag.color}20`, color: tag.color }}>{tag.label}</span>}
                    </div>
                    <span className="text-white/20 text-[10px]">{event.dateRange}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-white text-sm mb-1">
                    {event.name}
                  </h3>
                  <p className="text-white/30 text-[11px] mb-2">📍 {event.venue}</p>
                  <p className="text-white/40 text-[12px] leading-relaxed line-clamp-2 mb-3">{event.description}</p>
                  <div className="flex items-center gap-2">
                    <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 hover:brightness-110"
                      style={{ background: `${event.accentColor}20`, color: event.accentColor, border: `1px solid ${event.accentColor}30` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      🎫 购票
                    </a>
                    <a href={navUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/40 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white/60 transition-all duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🗺️ 导航
                    </a>
                  </div>
                </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Museums & Galleries */}
      {showMuseums && filteredMuseums.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/15 text-[10px] uppercase tracking-wider">值得一去</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>
          <div className="flex flex-col gap-5">
            {filteredMuseums.map((venue, i) => (
              <VenueCard key={venue.id} venue={venue} index={i} accentColor={city.accentColor} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredOngoing.length === 0 && filteredUpcoming.length === 0 && (!showMuseums || filteredMuseums.length === 0) && (
        <div className="text-center py-16 text-white/30">
          <p className="text-lg mb-2">暂无匹配内容</p>
          <p className="text-sm">试试其他分类或地区</p>
        </div>
      )}
    </div>
  );
}
