"use client";

import { useCityWeather, getTimeOfDay } from "@/lib/weather";
import { useCity } from "@/lib/CityContext";
import { useState, useEffect } from "react";

export default function WeatherBadge() {
  const { city } = useCity();
  const weather = useCityWeather(city);
  const [timeOfDay, setTimeOfDay] = useState("night");

  useEffect(() => {
    setTimeOfDay(getTimeOfDay(city.timezone));
  }, [city.timezone]);

  if (!weather) return null;

  const condition = weather.condition;
  const icon = condition === "rain" ? "🌧️" : condition === "storm" ? "⛈️" : condition === "cloud" ? "☁️" : condition === "fog" ? "🌫️" : timeOfDay === "night" ? "🌙" : timeOfDay === "dawn" ? "🌅" : timeOfDay === "dusk" ? "🌇" : "☀️";

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 text-white/30 text-[10px] sm:text-xs">
      <span>{icon}</span>
      <span className="text-white/40 font-medium">{weather.temp}°</span>
      <span className="hidden sm:inline">{weather.description}</span>
      <span className="hidden sm:inline">· {city.nameZh ?? city.name}</span>
    </div>
  );
}
