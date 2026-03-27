"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSydneyWeather, getTimeOfDay, type TimeOfDay } from "@/lib/weather";
import { RainEffect, StarsEffect, CloudsEffect, SunGlowEffect } from "./WeatherEffects";
import SydneySkyline from "./SydneySkyline";

interface AmbientBackgroundProps {
  mode: "cinema" | "streaming";
}

// Background gradients based on time of day
const timeGradients: Record<TimeOfDay, { cinema: string; streaming: string }> = {
  night: {
    cinema: "linear-gradient(135deg, #030818 0%, #0a1025 40%, #050a1a 100%)",
    streaming: "linear-gradient(135deg, #120800 0%, #0d0600 40%, #0a0500 100%)",
  },
  dawn: {
    cinema: "linear-gradient(135deg, #0d1028 0%, #141830 40%, #0a0f22 100%)",
    streaming: "linear-gradient(135deg, #1a0e05 0%, #150a02 40%, #100800 100%)",
  },
  day: {
    cinema: "linear-gradient(135deg, #0a0e1a 0%, #0d1020 40%, #060a15 100%)",
    streaming: "linear-gradient(135deg, #140e05 0%, #0f0a03 40%, #0a0700 100%)",
  },
  dusk: {
    cinema: "linear-gradient(135deg, #0d0a18 0%, #100d20 40%, #08061a 100%)",
    streaming: "linear-gradient(135deg, #180e00 0%, #120800 40%, #0d0500 100%)",
  },
};

// Orb colors: cinema = cool city lights, streaming = warm cosy amber
function getOrbColors(weather: string | null, isCinema: boolean) {
  if (weather === "rain" || weather === "storm") {
    return isCinema
      ? ["rgba(80,120,200,0.25)", "rgba(60,100,180,0.2)", "rgba(70,90,160,0.15)"]
      : ["rgba(200,150,80,0.2)", "rgba(180,120,60,0.15)", "rgba(160,100,50,0.1)"];
  }
  if (weather === "cloud" || weather === "fog") {
    return isCinema
      ? ["rgba(120,140,180,0.2)", "rgba(100,120,160,0.15)", "rgba(80,100,140,0.1)"]
      : ["rgba(180,140,80,0.15)", "rgba(160,120,70,0.1)", "rgba(140,100,60,0.08)"];
  }
  // Clear / default
  return isCinema
    ? ["rgba(80,140,255,0.25)", "rgba(100,120,220,0.2)", "rgba(60,100,200,0.15)"]
    : ["rgba(251,146,60,0.25)", "rgba(234,124,40,0.2)", "rgba(200,120,50,0.15)"];
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

      {/* Weather effects */}
      {(condition === "rain" || condition === "storm") && (
        <RainEffect intensity={condition === "storm" ? "heavy" : "normal"} />
      )}
      {condition === "cloud" && <CloudsEffect />}
      {condition === "fog" && <CloudsEffect />}
      {(condition === "clear" && timeOfDay === "night") && <StarsEffect />}
      {(condition === "clear" && (timeOfDay === "day" || timeOfDay === "dawn")) && <SunGlowEffect />}
      {timeOfDay === "night" && condition !== "rain" && condition !== "storm" && <StarsEffect />}

      {/* Weather info badge */}
      {weather && (
        <div className="absolute top-4 right-4 text-[10px] text-white/20 flex items-center gap-1.5">
          <span>{weather.temp}°C</span>
          <span>·</span>
          <span>{weather.description}</span>
          <span>·</span>
          <span>Sydney</span>
        </div>
      )}

      {/* ===== MODE-SPECIFIC BACKGROUNDS ===== */}

      {isCinema ? (
        <>
          {/* NIGHT OUT: City lights bokeh — scattered glowing dots */}
          <div className="absolute inset-0">
            {/* Large soft glow - like distant city light */}
            <motion.div
              className="absolute w-[600px] h-[300px] blur-[120px] opacity-[0.12]"
              style={{ bottom: "5%", left: "10%", mixBlendMode: "screen" }}
              animate={{ background: "radial-gradient(ellipse, rgba(60,120,255,0.7), transparent 70%)" }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="absolute w-[400px] h-[250px] blur-[100px] opacity-[0.08]"
              style={{ bottom: "15%", right: "15%", mixBlendMode: "screen" }}
              animate={{ background: "radial-gradient(ellipse, rgba(100,80,255,0.6), transparent 70%)" }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="absolute w-[500px] h-[500px] blur-[140px] opacity-[0.06]"
              style={{ top: "-10%", right: "20%", mixBlendMode: "screen" }}
              animate={{ background: "radial-gradient(circle, rgba(160,180,255,0.5), transparent 60%)" }}
              transition={{ duration: 1 }}
            />
          </div>

          {/* Skyline more visible in Night Out mode */}
          <SydneySkyline opacity={timeOfDay === "night" ? 0.06 : 0.04} />
        </>
      ) : (
        <>
          {/* COSY NIGHT IN: Soft warm ambient — like lamplight in a dark room */}
          {/* Bottom glow — subtle, warm, diffuse */}
          <motion.div
            className="absolute w-full h-[50%] blur-[120px] opacity-[0.10]"
            style={{ bottom: "-15%", left: 0, mixBlendMode: "screen" }}
            animate={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(220,140,40,0.6), transparent 65%)",
            }}
            transition={{ duration: 1 }}
          />
          {/* Side warmth — like a soft reading lamp */}
          <motion.div
            className="absolute w-[350px] h-[350px] blur-[110px] opacity-[0.07]"
            style={{ top: "15%", left: "8%", mixBlendMode: "screen" }}
            animate={{
              background: "radial-gradient(circle, rgba(240,180,50,0.4), transparent 60%)",
            }}
            transition={{ duration: 1 }}
          />
          {/* Subtle center warmth */}
          <motion.div
            className="absolute w-[500px] h-[300px] blur-[140px] opacity-[0.04]"
            style={{ top: "30%", right: "20%", mixBlendMode: "screen" }}
            animate={{
              background: "radial-gradient(ellipse, rgba(220,160,80,0.3), transparent 60%)",
            }}
            transition={{ duration: 1.5 }}
          />

          {/* Skyline dimmed in cosy mode */}
          <SydneySkyline opacity={0.02} />
        </>
      )}

      {/* Subtle vignette effect for both modes */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  );
}
