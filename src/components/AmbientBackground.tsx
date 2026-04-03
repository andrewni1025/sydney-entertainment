"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCityWeather, getTimeOfDay, type TimeOfDay } from "@/lib/weather";
import { useCity } from "@/lib/CityContext";
import { RainEffect, StarsEffect, CloudsEffect } from "./WeatherEffects";
import CitySkyline from "./CitySkyline";

interface AmbientBackgroundProps {
  mode: "cinema" | "streaming";
}

// Background gradients — DRAMATICALLY different per city
// Sydney: ocean blue/navy, Shanghai: crimson/scarlet, Suzhou: jade/emerald, Changzhou: electric violet
const cityTimeGradients: Record<string, Record<TimeOfDay, { cinema: string; streaming: string }>> = {
  sydney: {
    night: {
      cinema: "linear-gradient(160deg, #020818 0%, #061230 35%, #0a1a45 65%, #030610 100%)",
      streaming: "linear-gradient(160deg, #150c02 0%, #1a1005 35%, #120a02 65%, #0d0800 100%)",
    },
    dawn: {
      cinema: "linear-gradient(160deg, #0a1540 0%, #153068 35%, #1a3878 65%, #081030 100%)",
      streaming: "linear-gradient(160deg, #2a1808 0%, #35200a 35%, #2a1808 65%, #201005 100%)",
    },
    day: {
      cinema: "linear-gradient(160deg, #0c1a40 0%, #153060 35%, #1a3870 65%, #0e1838 100%)",
      streaming: "linear-gradient(160deg, #2a2015 0%, #302618 35%, #282012 65%, #1e180d 100%)",
    },
    dusk: {
      cinema: "linear-gradient(160deg, #101050 0%, #1a1870 35%, #151460 65%, #0c0a40 100%)",
      streaming: "linear-gradient(160deg, #302010 0%, #382515 35%, #2a1a0a 65%, #201208 100%)",
    },
  },
  shanghai: {
    night: {
      cinema: "linear-gradient(160deg, #180208 0%, #300515 35%, #3d0820 65%, #120208 100%)",
      streaming: "linear-gradient(160deg, #1a0808 0%, #251012 35%, #1a0808 65%, #120505 100%)",
    },
    dawn: {
      cinema: "linear-gradient(160deg, #350818 0%, #501530 35%, #5a1838 65%, #280610 100%)",
      streaming: "linear-gradient(160deg, #2a1510 0%, #381a10 35%, #2a1510 65%, #201008 100%)",
    },
    day: {
      cinema: "linear-gradient(160deg, #280510 0%, #451025 35%, #50122a 65%, #200410 100%)",
      streaming: "linear-gradient(160deg, #281818 0%, #352018 35%, #281815 65%, #1e1510 100%)",
    },
    dusk: {
      cinema: "linear-gradient(160deg, #400818 0%, #600e30 35%, #500a28 65%, #300510 100%)",
      streaming: "linear-gradient(160deg, #351815 0%, #4a2018 35%, #351510 65%, #251008 100%)",
    },
  },
  suzhou: {
    night: {
      cinema: "linear-gradient(160deg, #021208 0%, #052510 35%, #083018 65%, #020e06 100%)",
      streaming: "linear-gradient(160deg, #0a0f08 0%, #121a08 35%, #0e1505 65%, #080c05 100%)",
    },
    dawn: {
      cinema: "linear-gradient(160deg, #082818 0%, #104530 35%, #125038 65%, #061a10 100%)",
      streaming: "linear-gradient(160deg, #1a1a08 0%, #28250a 35%, #1a1a08 65%, #151205 100%)",
    },
    day: {
      cinema: "linear-gradient(160deg, #052015 0%, #0a3828 35%, #0c4530 65%, #041a12 100%)",
      streaming: "linear-gradient(160deg, #1a2012 0%, #253018 35%, #1e2815 65%, #151a0d 100%)",
    },
    dusk: {
      cinema: "linear-gradient(160deg, #083520 0%, #105540 35%, #0c4530 65%, #062a18 100%)",
      streaming: "linear-gradient(160deg, #252215 0%, #302a18 35%, #252010 65%, #181508 100%)",
    },
  },
  changzhou: {
    night: {
      cinema: "linear-gradient(160deg, #0a0220 0%, #180840 35%, #200a50 65%, #080218 100%)",
      streaming: "linear-gradient(160deg, #120810 0%, #1a1018 35%, #120810 65%, #0d0508 100%)",
    },
    dawn: {
      cinema: "linear-gradient(160deg, #1a0845 0%, #301570 35%, #381878 65%, #150640 100%)",
      streaming: "linear-gradient(160deg, #201510 0%, #2a1a12 35%, #201510 65%, #181008 100%)",
    },
    day: {
      cinema: "linear-gradient(160deg, #150838 0%, #281560 35%, #301870 65%, #120630 100%)",
      streaming: "linear-gradient(160deg, #201a18 0%, #282015 35%, #221a12 65%, #1a150d 100%)",
    },
    dusk: {
      cinema: "linear-gradient(160deg, #200a55 0%, #381580 35%, #301070 65%, #180845 100%)",
      streaming: "linear-gradient(160deg, #281a18 0%, #30201a 35%, #251812 65%, #1a1008 100%)",
    },
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
  const { city } = useCity();
  const weather = useCityWeather(city);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("night");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeOfDay(getTimeOfDay(city.timezone));
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay(city.timezone)), 60000);
    return () => clearInterval(interval);
  }, [city.timezone]);

  const cityGradients = cityTimeGradients[city.id] ?? cityTimeGradients.sydney;
  const gradient = isCinema
    ? cityGradients[timeOfDay].cinema
    : cityGradients[timeOfDay].streaming;

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

      {/* City accent glow — distinctive color identity per city */}
      <motion.div
        className="absolute inset-0"
        key={city.id}
        animate={{
          background: isCinema
            ? `radial-gradient(ellipse at 30% 20%, ${city.accentColor}18, transparent 60%), linear-gradient(180deg, ${city.accentColor}0a, transparent 40%)`
            : `radial-gradient(ellipse at 70% 80%, ${city.accentColor}10, transparent 50%)`,
        }}
        transition={{ duration: 1.5 }}
      />

      {/* City skyline */}
      <CitySkyline cityId={city.id} opacity={isNight ? 0.07 : isRain ? 0.03 : 0.05} />

      {/* Vignette */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)" }} />
    </div>
  );
}
