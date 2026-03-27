"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSydneyWeather, getTimeOfDay, type TimeOfDay } from "@/lib/weather";
import { RainEffect, StarsEffect, CloudsEffect, SunGlowEffect } from "./WeatherEffects";
import SydneySkyline from "./SydneySkyline";

interface AmbientBackgroundProps {
  mode: "cinema" | "streaming";
}

// Background gradients — VISIBLE color shifts between modes and times
const timeGradients: Record<TimeOfDay, { cinema: string; streaming: string }> = {
  night: {
    cinema: "linear-gradient(160deg, #060d2a 0%, #0c1840 35%, #141e50 65%, #080e28 100%)",
    streaming: "linear-gradient(160deg, #1c1008 0%, #221508 35%, #1a1005 65%, #120a02 100%)",
  },
  dawn: {
    cinema: "linear-gradient(160deg, #151040 0%, #1e1855 35%, #281e60 65%, #100a30 100%)",
    streaming: "linear-gradient(160deg, #251808 0%, #2a1a0a 35%, #201208 65%, #180e05 100%)",
  },
  day: {
    cinema: "linear-gradient(160deg, #0a1530 0%, #101e45 35%, #152550 65%, #0c1228 100%)",
    streaming: "linear-gradient(160deg, #201810 0%, #251c12 35%, #1e160d 65%, #151008 100%)",
  },
  dusk: {
    cinema: "linear-gradient(160deg, #1a1045 0%, #251560 35%, #201050 65%, #120a30 100%)",
    streaming: "linear-gradient(160deg, #281510 0%, #301a10 35%, #221008 65%, #1a0c05 100%)",
  },
};

// Weather tint overlay
function getWeatherOverlay(weather: string | null, isCinema: boolean): string | null {
  if (weather === "rain" || weather === "storm") {
    return isCinema
      ? "linear-gradient(180deg, rgba(20,30,60,0.5) 0%, rgba(30,40,80,0.3) 50%, transparent 100%)"
      : "linear-gradient(180deg, rgba(40,35,25,0.4) 0%, rgba(50,40,30,0.2) 50%, transparent 100%)";
  }
  if (weather === "cloud" || weather === "fog") {
    return isCinema
      ? "radial-gradient(ellipse at 50% 30%, rgba(50,60,90,0.3), transparent 70%)"
      : "radial-gradient(ellipse at 50% 30%, rgba(80,65,40,0.25), transparent 70%)";
  }
  if (weather === "clear") {
    return isCinema
      ? "radial-gradient(ellipse at 75% 15%, rgba(40,60,140,0.2), transparent 55%)"
      : "radial-gradient(ellipse at 75% 15%, rgba(200,140,40,0.15), transparent 55%)";
  }
  return null;
}

export default function AmbientBackground({ mode }: AmbientBackgroundProps) {
  const isCinema = mode === "cinema";
  const weather = useSydneyWeather();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("night");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeOfDay(getTimeOfDay());
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60000);
    return () => clearInterval(interval);
  }, []);

  const gradient = isCinema
    ? timeGradients[timeOfDay].cinema
    : timeGradients[timeOfDay].streaming;

  const condition = weather?.condition;
  const weatherOverlay = getWeatherOverlay(condition ?? null, isCinema);

  // Only render base gradient on server; all effects render client-only
  if (!mounted) {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{ background: gradient }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{ background: gradient }}
        transition={{ duration: 1.5 }}
      />

      {/* Weather-based color overlay */}
      {weatherOverlay && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, background: weatherOverlay }}
          transition={{ duration: 2 }}
        />
      )}

      {/* Weather effects */}
      {(condition === "rain" || condition === "storm") && (
        <RainEffect intensity={condition === "storm" ? "heavy" : "normal"} />
      )}
      {condition === "cloud" && <CloudsEffect />}
      {condition === "fog" && <CloudsEffect />}
      {(condition === "clear" && timeOfDay === "night") && <StarsEffect />}
      {(condition === "clear" && (timeOfDay === "day" || timeOfDay === "dawn")) && <SunGlowEffect />}
      {timeOfDay === "night" && condition !== "rain" && condition !== "storm" && <StarsEffect />}

      {/* Weather badge — visible pill */}
      {weather && (
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-md">
          <span className="text-base">
            {condition === "rain" ? "🌧️" : condition === "storm" ? "⛈️" : condition === "cloud" ? "☁️" : condition === "fog" ? "🌫️" : timeOfDay === "night" ? "🌙" : timeOfDay === "dawn" ? "🌅" : timeOfDay === "dusk" ? "🌇" : "☀️"}
          </span>
          <span className="text-white/50 text-xs font-medium">{weather.temp}°C</span>
          <span className="text-white/30 text-[10px]">{weather.description}</span>
        </div>
      )}

      {/* ===== MODE-SPECIFIC BACKGROUNDS ===== */}

      {isCinema ? (
        <>
          {/* NIGHT OUT: Strong blue/indigo city glow */}
          <div className="absolute inset-0">
            {/* Main blue glow — bottom, like city lights reflected on clouds */}
            <motion.div
              className="absolute w-[800px] h-[400px] blur-[100px] opacity-[0.20]"
              style={{ bottom: "-5%", left: "5%", mixBlendMode: "screen" }}
              animate={{ background: "radial-gradient(ellipse, rgba(40,80,220,0.8), transparent 65%)" }}
              transition={{ duration: 1 }}
            />
            {/* Secondary purple glow — right side */}
            <motion.div
              className="absolute w-[500px] h-[400px] blur-[100px] opacity-[0.15]"
              style={{ bottom: "10%", right: "5%", mixBlendMode: "screen" }}
              animate={{ background: "radial-gradient(ellipse, rgba(80,50,200,0.7), transparent 65%)" }}
              transition={{ duration: 1 }}
            />
            {/* Top moonlight */}
            <motion.div
              className="absolute w-[600px] h-[400px] blur-[120px] opacity-[0.10]"
              style={{ top: "-15%", right: "15%", mixBlendMode: "screen" }}
              animate={{ background: "radial-gradient(circle, rgba(120,150,255,0.5), transparent 55%)" }}
              transition={{ duration: 1 }}
            />
          </div>
          <SydneySkyline opacity={timeOfDay === "night" ? 0.08 : 0.05} />
        </>
      ) : (
        <>
          {/* COSY NIGHT IN: Visible warm amber/orange glow */}
          {/* Main warm glow — bottom, like floor lamp */}
          <motion.div
            className="absolute w-[800px] h-[500px] blur-[100px] opacity-[0.18]"
            style={{ bottom: "-10%", left: "10%", mixBlendMode: "screen" }}
            animate={{
              background: "radial-gradient(ellipse at 50% 80%, rgba(255,140,30,0.7), transparent 60%)",
            }}
            transition={{ duration: 1 }}
          />
          {/* Reading lamp — top left warm spot */}
          <motion.div
            className="absolute w-[400px] h-[400px] blur-[90px] opacity-[0.12]"
            style={{ top: "5%", left: "5%", mixBlendMode: "screen" }}
            animate={{
              background: "radial-gradient(circle, rgba(255,180,50,0.5), transparent 55%)",
            }}
            transition={{ duration: 1 }}
          />
          {/* Subtle right warmth */}
          <motion.div
            className="absolute w-[400px] h-[300px] blur-[110px] opacity-[0.08]"
            style={{ top: "40%", right: "10%", mixBlendMode: "screen" }}
            animate={{
              background: "radial-gradient(ellipse, rgba(220,120,40,0.4), transparent 55%)",
            }}
            transition={{ duration: 1 }}
          />
          <SydneySkyline opacity={0.025} />
        </>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </div>
  );
}
