"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cities, type CityConfig } from "@/lib/cities";

// Only 3 cities for weather-cinema
const weatherCinemaCities = [cities.sydney, cities.shanghai, cities.tokyo];
import { useCityWeather, getTimeOfDay, type TimeOfDay, type CityWeather } from "@/lib/weather";
import { RainEffect, StarsEffect, CloudsEffect } from "@/components/WeatherEffects";
import CitySkyline from "@/components/CitySkyline";
import RatingRing from "@/components/streaming/RatingRing";
import { pickWeatherMovie, getPoetryLine, GENRE_ZH, GENRE_JA, type TopMovie } from "@/lib/weather-cinema";

/* ── Gradient data — high contrast per city ── */
const gradients: Record<string, Record<TimeOfDay, string>> = {
  sydney: {
    night: "linear-gradient(160deg, #010612 0%, #041030 30%, #0a1d55 60%, #020408 100%)",
    dawn:  "linear-gradient(160deg, #081238 0%, #12285a 30%, #1a3d78 50%, #2a1a10 85%, #0a0810 100%)",
    day:   "linear-gradient(160deg, #0a1838 0%, #153868 30%, #1a4580 55%, #0e2048 100%)",
    dusk:  "linear-gradient(160deg, #0c0e45 0%, #1a1870 30%, #381850 60%, #150828 100%)",
  },
  shanghai: {
    night: "linear-gradient(160deg, #0e0005 0%, #280310 25%, #4d0820 50%, #300515 75%, #0a0003 100%)",
    dawn:  "linear-gradient(160deg, #2a0510 0%, #551028 30%, #6a1835 55%, #200808 85%, #0a0005 100%)",
    day:   "linear-gradient(160deg, #200408 0%, #480e22 30%, #58122a 55%, #200410 100%)",
    dusk:  "linear-gradient(160deg, #350510 0%, #700e30 25%, #5a0a25 55%, #250308 100%)",
  },
  tokyo: {
    night: "linear-gradient(160deg, #08000a 0%, #180520 25%, #2d0a40 50%, #1a0830 75%, #050008 100%)",
    dawn:  "linear-gradient(160deg, #180510 0%, #351528 30%, #501a40 55%, #200a18 85%, #080005 100%)",
    day:   "linear-gradient(160deg, #120510 0%, #2a0e28 30%, #401535 55%, #180812 100%)",
    dusk:  "linear-gradient(160deg, #1a0815 0%, #451540 25%, #501848 55%, #200a20 100%)",
  },
};

/* ── Weather condition icon ── */
function weatherIcon(condition: CityWeather["condition"], time: TimeOfDay): string {
  if (condition === "storm") return "⛈️";
  if (condition === "rain") return "🌧️";
  if (condition === "snow") return "🌨️";
  if (condition === "fog") return "🌫️";
  if (condition === "cloud") return "☁️";
  if (time === "night") return "🌙";
  if (time === "dawn") return "🌅";
  if (time === "dusk") return "🌇";
  return "☀️";
}

/* ── Weather overlay ── */
function getWeatherOverlay(condition: string | null): string | null {
  if (condition === "rain" || condition === "storm")
    return "linear-gradient(180deg, rgba(20,30,60,0.5) 0%, rgba(30,40,80,0.3) 50%, transparent 100%)";
  if (condition === "cloud" || condition === "fog")
    return "radial-gradient(ellipse at 50% 30%, rgba(50,60,90,0.3), transparent 70%)";
  if (condition === "clear")
    return "radial-gradient(ellipse at 75% 15%, rgba(40,60,140,0.2), transparent 55%)";
  return null;
}

/* ── City-specific floating light orbs ── */
function CityOrbs({ cityId, accentColor }: { cityId: string; accentColor: string }) {
  // Each city gets unique animated light orbs that drift slowly
  const orbConfigs: Record<string, { colors: string[]; positions: { x: string; y: string; size: string; delay: string }[] }> = {
    sydney: {
      colors: ["rgba(228,184,78,0.12)", "rgba(100,160,255,0.08)", "rgba(228,184,78,0.06)"],
      positions: [
        { x: "15%", y: "20%", size: "300px", delay: "0s" },
        { x: "75%", y: "60%", size: "250px", delay: "-8s" },
        { x: "60%", y: "10%", size: "200px", delay: "-4s" },
      ],
    },
    shanghai: {
      colors: ["rgba(244,63,94,0.15)", "rgba(255,100,50,0.08)", "rgba(244,63,94,0.06)"],
      positions: [
        { x: "20%", y: "30%", size: "350px", delay: "0s" },
        { x: "70%", y: "15%", size: "280px", delay: "-6s" },
        { x: "50%", y: "70%", size: "220px", delay: "-3s" },
      ],
    },
    tokyo: {
      colors: ["rgba(168,85,247,0.14)", "rgba(236,72,153,0.10)", "rgba(139,92,246,0.07)"],
      positions: [
        { x: "25%", y: "25%", size: "320px", delay: "0s" },
        { x: "65%", y: "50%", size: "260px", delay: "-5s" },
        { x: "80%", y: "15%", size: "200px", delay: "-10s" },
      ],
    },
  };

  const config = orbConfigs[cityId] ?? orbConfigs.sydney;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {config.positions.map((pos, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: pos.x,
            top: pos.y,
            width: pos.size,
            height: pos.size,
            background: `radial-gradient(circle, ${config.colors[i]}, transparent 70%)`,
            animation: `orbFloat 20s ease-in-out ${pos.delay} infinite`,
            filter: "blur(40px)",
          }}
        />
      ))}
    </div>
  );
}

/* ── Douban icon ── */
function DoubanIcon() {
  return (
    <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-sm text-[11px] font-bold leading-none" style={{ background: "#00b51d", color: "#fff" }}>
      豆
    </span>
  );
}

/* ════════════════════════════════════════════
   Main Page
   ════════════════════════════════════════════ */
export default function WeatherCinemaPage() {
  const [city, setCity] = useState<CityConfig>(cities.shanghai);
  const [animKey, setAnimKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [overrideWeather, setOverrideWeather] = useState<CityWeather["condition"] | null>(null);
  const [overrideTime, setOverrideTime] = useState<TimeOfDay | null>(null);
  const [pickIndex, setPickIndex] = useState(0);

  const weather = useCityWeather(city);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("night");

  // Read URL params for overrides (useful for recording)
  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const w = params.get("weather") as CityWeather["condition"] | null;
    const t = params.get("time") as TimeOfDay | null;
    const c = params.get("city");
    if (w && ["rain", "storm", "clear", "cloud", "fog", "snow"].includes(w)) setOverrideWeather(w);
    if (t && ["night", "dawn", "day", "dusk"].includes(t)) setOverrideTime(t);
    if (c && cities[c]) setCity(cities[c]);
  }, []);

  // Update time of day
  useEffect(() => {
    if (overrideTime) return;
    setTimeOfDay(getTimeOfDay(city.timezone));
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay(city.timezone)), 60000);
    return () => clearInterval(interval);
  }, [city.timezone, overrideTime]);

  const effectiveCondition = overrideWeather ?? weather?.condition ?? "clear";
  const effectiveTime = overrideTime ?? timeOfDay;
  const effectiveTemp = weather?.temp ?? 20;

  const isZh = city.locale === "zh";
  const isJa = city.locale === "ja";
  const isAsian = isZh || isJa;
  const cityDisplayName = isJa ? "東京" : (city.nameZh ?? city.name);

  // Weather description per locale
  const descJa: Record<string, string> = {
    Clear: "晴れ", "Partly cloudy": "曇り時々晴れ", Cloudy: "曇り", Foggy: "霧",
    Drizzle: "小雨", Rain: "雨", "Rain showers": "にわか雨", Thunderstorm: "雷雨",
  };
  const rawDesc = weather?.description ?? "Clear";
  const effectiveDesc = isJa
    ? (descJa[rawDesc] ?? rawDesc)
    : (weather?.description ?? (isZh ? "晴" : "Clear"));

  // Pick movie
  const movie = pickWeatherMovie(effectiveCondition, effectiveTime, isAsian, city.id, pickIndex);
  const poetryLine = getPoetryLine(effectiveCondition, cityDisplayName, city.locale);

  // Background
  const cityGrads = gradients[city.id] ?? gradients.sydney;
  const gradient = cityGrads[effectiveTime];
  const weatherOverlay = getWeatherOverlay(effectiveCondition);

  const isNight = effectiveTime === "night";
  const isDawn = effectiveTime === "dawn";
  const isDusk = effectiveTime === "dusk";
  const isClear = effectiveCondition === "clear";
  const isRain = effectiveCondition === "rain" || effectiveCondition === "storm";
  const isCloudy = effectiveCondition === "cloud" || effectiveCondition === "fog";

  const switchCity = useCallback((c: CityConfig) => {
    setCity(c);
    setPickIndex(0);
    setAnimKey((k) => k + 1);
  }, []);

  const replay = useCallback(() => {
    setAnimKey((k) => k + 1);
  }, []);

  const swapMovie = useCallback(() => {
    setPickIndex((i) => i + 1);
    setAnimKey((k) => k + 1);
  }, []);

  const posterUrl = movie?.posterPath
    ? `https://image.tmdb.org/t/p/w780${movie.posterPath}`
    : null;

  if (!mounted) {
    return <div className="fixed inset-0" style={{ background: "#000" }} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* ── Background layers ── */}
      <motion.div
        className="absolute inset-0"
        animate={{ background: gradient }}
        transition={{ duration: 1.5 }}
      />

      {weatherOverlay && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, background: weatherOverlay }}
          transition={{ duration: 2 }}
        />
      )}

      {/* Sun — clear day/dawn/dusk */}
      {isClear && !isNight && (
        <motion.div
          className="absolute w-[150px] h-[150px] sm:w-[280px] sm:h-[280px]"
          style={{ top: effectiveTime === "day" ? "3%" : "50%", right: "10%" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute inset-0 rounded-full blur-[60px]" style={{
            background: effectiveTime === "day"
              ? "radial-gradient(circle, rgba(255,220,100,0.35), rgba(255,180,50,0.15) 50%, transparent 70%)"
              : isDawn
              ? "radial-gradient(circle, rgba(255,150,80,0.4), rgba(255,100,50,0.15) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(255,120,60,0.4), rgba(255,80,30,0.15) 50%, transparent 70%)",
          }} />
        </motion.div>
      )}

      {/* Moon — clear night */}
      {isClear && isNight && (
        <motion.div
          className="absolute w-[50px] h-[50px] sm:w-[90px] sm:h-[90px]"
          style={{ top: "6%", right: "12%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute inset-0 rounded-full blur-[30px]" style={{
            background: "radial-gradient(circle, rgba(200,210,255,0.3), transparent 60%)",
          }} />
          <div className="absolute rounded-full blur-[3px]" style={{
            top: "25%", left: "25%", width: "50%", height: "50%",
            background: "radial-gradient(circle, rgba(220,225,255,0.6), rgba(180,190,230,0.2) 70%, transparent)",
          }} />
        </motion.div>
      )}

      {/* Stars */}
      {isNight && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 2 }}>
          <StarsEffect />
        </motion.div>
      )}

      {/* Clouds */}
      {isCloudy && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 2 }}>
          <CloudsEffect />
        </motion.div>
      )}

      {/* Rain */}
      {isRain && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1.5 }}>
          <RainEffect intensity={effectiveCondition === "storm" ? "heavy" : "normal"} />
          <div className="absolute inset-x-0 top-0 h-[40%]" style={{
            background: "linear-gradient(180deg, rgba(15,20,30,0.6), transparent)",
          }} />
        </motion.div>
      )}

      {/* Dawn/Dusk horizon glow */}
      {(isDawn || isDusk) && isClear && (
        <div className="absolute inset-x-0 bottom-0 h-[40%]" style={{
          background: isDawn
            ? "linear-gradient(0deg, rgba(255,120,50,0.15), rgba(200,80,120,0.08) 50%, transparent)"
            : "linear-gradient(0deg, rgba(255,100,30,0.18), rgba(180,60,100,0.08) 50%, transparent)",
        }} />
      )}

      {/* City accent glow — much stronger */}
      <motion.div
        className="absolute inset-0"
        key={`glow-${city.id}`}
        animate={{
          background: `radial-gradient(ellipse at 30% 20%, ${city.accentColor}25, transparent 55%), radial-gradient(ellipse at 70% 80%, ${city.accentColor}15, transparent 50%), linear-gradient(180deg, ${city.accentColor}10, transparent 40%)`,
        }}
        transition={{ duration: 1.5 }}
      />

      {/* Animated city orbs */}
      <motion.div
        key={`orbs-${city.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 2 }}
      >
        <CityOrbs cityId={city.id} accentColor={city.accentColor} />
      </motion.div>

      {/* Skyline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 2 }}
      >
        <CitySkyline cityId={city.id} opacity={isNight ? 0.1 : isRain ? 0.05 : 0.08} />
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
      }} />

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`scene-${city.id}-${animKey}`}
          className="absolute inset-0 z-10 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Top: Weather info */}
          <motion.div
            className="pt-14 sm:pt-16 px-6 sm:px-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 1 }}
          >
            <div className="flex items-center gap-2 text-white/50 text-sm sm:text-base">
              <span className="text-lg">{weatherIcon(effectiveCondition, effectiveTime)}</span>
              <span className="font-[family-name:var(--font-heading)] tracking-wide">
                {cityDisplayName}
              </span>
              <span className="text-white/20">·</span>
              <span>{effectiveDesc}</span>
              <span className="text-white/20">·</span>
              <span>{effectiveTemp}°C</span>
            </div>
          </motion.div>

          {/* Center: Movie */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 -mt-4">
            {movie && (
              <>
                {/* Poster */}
                <motion.div
                  className="relative mb-6"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 3.5, duration: 1.2, ease: "easeOut" }}
                >
                  {/* Glow behind poster */}
                  <div
                    className="absolute -inset-8 sm:-inset-12 rounded-3xl blur-3xl opacity-40"
                    style={{ background: city.accentColor }}
                  />
                  {posterUrl && (
                    <div className="relative">
                      <img
                        src={posterUrl}
                        alt={movie.title}
                        className="relative w-52 sm:w-64 rounded-2xl shadow-2xl"
                        style={{ boxShadow: `0 25px 60px -12px rgba(0,0,0,0.7), 0 0 40px ${city.accentColor}25` }}
                      />
                      {/* Shimmer sweep */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div
                          className="absolute inset-0"
                          style={{
                            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)",
                            animation: "shimmer 3s ease-in-out 5s forwards",
                            transform: "translateX(-100%)",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Title */}
                <motion.h1
                  className="font-[family-name:var(--font-heading)] text-2xl sm:text-4xl font-bold text-white text-center leading-tight mb-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 5, duration: 0.8 }}
                >
                  {isJa && movie.titleZh ? movie.titleZh : isZh && movie.titleZh ? movie.titleZh : movie.title}
                </motion.h1>

                {/* Subtitle: year + genres */}
                <motion.div
                  className="flex items-center gap-2 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 5.5, duration: 0.6 }}
                >
                  <span className="text-white/30 text-xs">{movie.releaseDate?.slice(0, 4)}</span>
                  {movie.genres.slice(0, 3).map((g) => (
                    <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-white/35">
                      {isJa ? (GENRE_JA[g] ?? g) : isZh ? (GENRE_ZH[g] ?? g) : g}
                    </span>
                  ))}
                </motion.div>

                {/* Rating rings */}
                <motion.div
                  className="flex items-center gap-6 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 6, duration: 0.6 }}
                >
                  <RatingRing
                    score={movie.imdb}
                    color="#f5c518"
                    label="IMDb"
                    size={46}
                    displayValue={movie.imdb !== null ? (movie.imdb / 10).toFixed(1) : undefined}
                  />
                  <RatingRing
                    score={movie.rottenTomatoes}
                    color={movie.rtFresh ? "#6ac045" : "#fa320a"}
                    label=""
                    size={46}
                    displayValue={movie.rottenTomatoes !== null ? `${movie.rottenTomatoes}%` : undefined}
                    icon="🍅"
                  />
                  <RatingRing
                    score={movie.douban}
                    color="#00b51d"
                    label=""
                    size={46}
                    displayValue={movie.doubanOriginal !== null ? movie.doubanOriginal.toFixed(1) : undefined}
                    icon={<DoubanIcon />}
                  />
                </motion.div>

                {/* English title if showing Chinese/Japanese */}
                {isAsian && movie.titleZh && (
                  <motion.p
                    className="text-white/20 text-xs mb-4 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 5.3, duration: 0.5 }}
                  >
                    {movie.title}
                  </motion.p>
                )}
              </>
            )}
          </div>

          {/* Bottom: Poetry + Switcher */}
          <div className="pb-10 sm:pb-14 px-6 sm:px-10 text-center">
            {/* Poetic line */}
            <motion.p
              className="text-white/40 text-sm sm:text-base italic mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 6.5, duration: 1 }}
            >
              &ldquo;{poetryLine}&rdquo;
            </motion.p>

            {/* City switcher */}
            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 7.5, duration: 0.8 }}
            >
              {weatherCinemaCities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => switchCity(c)}
                  className={`text-xl transition-all duration-300 cursor-pointer ${
                    c.id === city.id
                      ? "opacity-100 scale-110"
                      : "opacity-25 hover:opacity-50 scale-100"
                  }`}
                  title={c.nameZh ?? c.name}
                >
                  {c.emoji}
                </button>
              ))}
              {/* Swap movie button */}
              <button
                onClick={swapMovie}
                className="ml-2 text-white/15 hover:text-white/35 text-xs transition-colors cursor-pointer"
                title="Try another movie"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M16 3h5v5" />
                  <path d="M4 20L21 3" />
                  <path d="M21 16v5h-5" />
                  <path d="M15 15l6 6" />
                  <path d="M4 4l5 5" />
                </svg>
              </button>
              {/* Replay button */}
              <button
                onClick={replay}
                className="ml-4 text-white/15 hover:text-white/35 text-xs transition-colors cursor-pointer"
                title="Replay animation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 4v6h6" />
                  <path d="M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Shimmer + orb keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(5deg); }
          100% { transform: translateX(200%) rotate(5deg); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 15px) scale(0.95); }
          75% { transform: translate(15px, 25px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
