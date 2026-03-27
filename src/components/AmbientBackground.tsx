"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSydneyWeather, getTimeOfDay, type TimeOfDay } from "@/lib/weather";
import { RainEffect, StarsEffect, CloudsEffect, SunGlowEffect } from "./WeatherEffects";
import SydneySkyline from "./SydneySkyline";

interface AmbientBackgroundProps {
  mode: "cinema" | "streaming";
}

// Background gradients — each time period has DISTINCTLY different colors
const timeGradients: Record<TimeOfDay, { cinema: string; streaming: string }> = {
  night: {
    // Deep dark navy — late night city
    cinema: "linear-gradient(160deg, #050a20 0%, #0a1230 35%, #0e1840 65%, #060a1a 100%)",
    // Deep chocolate — midnight cosy
    streaming: "linear-gradient(160deg, #150c02 0%, #1a1005 35%, #120a02 65%, #0d0800 100%)",
  },
  dawn: {
    // Purple-rose — early morning sky
    cinema: "linear-gradient(160deg, #1a0e35 0%, #2a1550 35%, #351a5a 65%, #150a30 100%)",
    // Warm amber sunrise
    streaming: "linear-gradient(160deg, #2a1808 0%, #35200a 35%, #2a1808 65%, #201005 100%)",
  },
  day: {
    // Brighter steel blue — daylight
    cinema: "linear-gradient(160deg, #101830 0%, #182548 35%, #1e2d55 65%, #121a35 100%)",
    // Light warm tan — afternoon sunlight
    streaming: "linear-gradient(160deg, #2a2015 0%, #302618 35%, #282012 65%, #1e180d 100%)",
  },
  dusk: {
    // Deep purple-orange sunset
    cinema: "linear-gradient(160deg, #201048 0%, #301560 35%, #281055 65%, #180a38 100%)",
    // Warm sunset orange
    streaming: "linear-gradient(160deg, #302010 0%, #382515 35%, #2a1a0a 65%, #201208 100%)",
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
      {/* Weather badge removed — now in page header */}

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
