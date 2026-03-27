"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSydneyWeather, getTimeOfDay, type TimeOfDay } from "@/lib/weather";
import { RainEffect, StarsEffect, CloudsEffect } from "./WeatherEffects";
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

  const condition = weather?.condition ?? null;
  const weatherOverlay = getWeatherOverlay(condition, isCinema);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{ background: gradient }} />
      </div>
    );
  }

  const isNight = timeOfDay === "night";
  const isDawn = timeOfDay === "dawn";
  const isDusk = timeOfDay === "dusk";
  const isDay = timeOfDay === "day";
  const isClear = condition === "clear" || !condition;
  const isRain = condition === "rain" || condition === "storm";
  const isCloudy = condition === "cloud" || condition === "fog";

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

      {/* === iOS WEATHER-STYLE ELEMENTS === */}

      {/* SUN — visible warm glow for clear day/dawn/dusk */}
      {isClear && !isNight && (
        <motion.div
          className="absolute w-[150px] h-[150px] sm:w-[280px] sm:h-[280px]"
          style={{
            top: isDay ? "3%" : "50%",
            right: isDay ? "10%" : isDawn ? "15%" : "10%",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute inset-0 rounded-full blur-[60px]" style={{
            background: isDay
              ? "radial-gradient(circle, rgba(255,220,100,0.35), rgba(255,180,50,0.15) 50%, transparent 70%)"
              : isDawn
              ? "radial-gradient(circle, rgba(255,150,80,0.4), rgba(255,100,50,0.15) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(255,120,60,0.4), rgba(255,80,30,0.15) 50%, transparent 70%)",
          }} />
          <div className="absolute rounded-full blur-[15px]" style={{
            top: "30%", left: "30%", width: "40%", height: "40%",
            background: isDay
              ? "radial-gradient(circle, rgba(255,240,180,0.6), transparent 70%)"
              : "radial-gradient(circle, rgba(255,180,100,0.5), transparent 70%)",
          }} />
        </motion.div>
      )}

      {/* MOON — clear night */}
      {isClear && isNight && (
        <motion.div
          className="absolute w-[50px] h-[50px] sm:w-[90px] sm:h-[90px]"
          style={{ top: "6%", right: "12%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute inset-0 rounded-full blur-[30px]"
            style={{ background: "radial-gradient(circle, rgba(200,210,255,0.3), transparent 60%)" }} />
          <div className="absolute rounded-full blur-[3px]" style={{
            top: "25%", left: "25%", width: "50%", height: "50%",
            background: "radial-gradient(circle, rgba(220,225,255,0.6), rgba(180,190,230,0.2) 70%, transparent)",
          }} />
        </motion.div>
      )}

      {/* STARS — night */}
      {isNight && <StarsEffect />}

      {/* CLOUDS — overcast */}
      {isCloudy && <CloudsEffect />}

      {/* RAIN + dark clouds overlay */}
      {isRain && (
        <>
          <RainEffect intensity={condition === "storm" ? "heavy" : "normal"} />
          <div className="absolute inset-x-0 top-0 h-[40%]"
            style={{ background: "linear-gradient(180deg, rgba(15,20,30,0.6), transparent)" }} />
        </>
      )}

      {/* Dawn/Dusk horizon glow */}
      {(isDawn || isDusk) && isClear && (
        <div className="absolute inset-x-0 bottom-0 h-[40%]" style={{
          background: isDawn
            ? "linear-gradient(0deg, rgba(255,120,50,0.15), rgba(200,80,120,0.08) 50%, transparent)"
            : "linear-gradient(0deg, rgba(255,100,30,0.18), rgba(180,60,100,0.08) 50%, transparent)",
        }} />
      )}

      {/* Mode tint — subtle cool/warm overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isCinema
            ? "linear-gradient(180deg, rgba(20,40,100,0.1), transparent 50%)"
            : "linear-gradient(180deg, rgba(100,60,20,0.1), transparent 50%)",
        }}
        transition={{ duration: 1 }}
      />

      {/* Sydney skyline */}
      <SydneySkyline opacity={isNight ? 0.07 : isRain ? 0.03 : 0.05} />

      {/* Vignette */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)" }} />
    </div>
  );
}
