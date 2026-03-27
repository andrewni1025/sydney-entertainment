"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSydneyWeather, getTimeOfDay, type TimeOfDay } from "@/lib/weather";
import { RainEffect, StarsEffect, CloudsEffect, SunGlowEffect } from "./WeatherEffects";
import SydneySkyline from "./SydneySkyline";

interface AmbientBackgroundProps {
  mode: "cinema" | "streaming";
}

// Background gradients — dramatic shifts by time + mode
const timeGradients: Record<TimeOfDay, { cinema: string; streaming: string }> = {
  night: {
    // Night Out: deep navy, city-at-2am feel
    cinema: "linear-gradient(135deg, #020820 0%, #0a1535 40%, #03061a 100%)",
    // Night In: warm cocoa darkness
    streaming: "linear-gradient(135deg, #1a0e02 0%, #120a04 40%, #0d0800 100%)",
  },
  dawn: {
    // Night Out: pre-dawn purple-blue, stumbling out of a late bar
    cinema: "linear-gradient(135deg, #1a1040 0%, #201848 40%, #0d0a28 100%)",
    // Night In: early morning amber, coffee vibes
    streaming: "linear-gradient(135deg, #201005 0%, #1a0d03 40%, #150a00 100%)",
  },
  day: {
    // Night Out: bright blue-grey daylight reflected off buildings
    cinema: "linear-gradient(135deg, #0e1525 0%, #121a30 40%, #0a1020 100%)",
    // Night In: warm afternoon sun through curtains
    streaming: "linear-gradient(135deg, #1a1208 0%, #151005 40%, #100c02 100%)",
  },
  dusk: {
    // Night Out: golden hour turning purple, getting ready to go out
    cinema: "linear-gradient(135deg, #1a0e28 0%, #201540 40%, #100a20 100%)",
    // Night In: sunset on the couch, cosy orange
    streaming: "linear-gradient(135deg, #201208 0%, #1a0e05 40%, #150a00 100%)",
  },
};

// Weather overlays - applied as additional tint on top
function getWeatherOverlay(weather: string | null, isCinema: boolean): string | null {
  if (weather === "rain" || weather === "storm") {
    return isCinema
      ? "radial-gradient(ellipse at 50% 30%, rgba(40,60,120,0.3), transparent 80%)"
      : "radial-gradient(ellipse at 50% 30%, rgba(80,70,50,0.2), transparent 80%)";
  }
  if (weather === "cloud" || weather === "fog") {
    return isCinema
      ? "radial-gradient(ellipse at 50% 40%, rgba(60,70,90,0.2), transparent 70%)"
      : "radial-gradient(ellipse at 50% 40%, rgba(80,70,50,0.15), transparent 70%)";
  }
  if (weather === "clear") {
    return isCinema
      ? "radial-gradient(ellipse at 80% 10%, rgba(60,80,150,0.15), transparent 60%)"
      : "radial-gradient(ellipse at 80% 10%, rgba(200,150,50,0.1), transparent 60%)";
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

      {/* Weather + time badge */}
      {weather && (
        <div className="absolute top-4 right-4 text-[10px] text-white/20 flex items-center gap-1.5">
          <span>{timeOfDay === "night" ? "🌙" : timeOfDay === "dawn" ? "🌅" : timeOfDay === "day" ? "☀️" : "🌇"}</span>
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
