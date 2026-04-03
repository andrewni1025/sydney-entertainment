"use client";

import { useEffect, useState } from "react";
import { type CityConfig, defaultCity } from "./cities";

export interface CityWeather {
  condition: "rain" | "cloud" | "clear" | "snow" | "storm" | "fog";
  temp: number;
  description: string;
}

/** @deprecated Use CityWeather */
export type SydneyWeather = CityWeather;

export type TimeOfDay = "night" | "dawn" | "day" | "dusk";

export function getTimeOfDay(timezone?: string): TimeOfDay {
  const tz = timezone ?? defaultCity.timezone;
  const now = new Date();
  const hour = parseInt(
    now.toLocaleString("en-AU", { timeZone: tz, hour: "numeric", hour12: false })
  );

  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "dusk";
  return "night";
}

function parseCondition(code: string): CityWeather["condition"] {
  const c = parseInt(code);
  if ([200, 201, 202, 210, 211, 212, 221, 230, 231, 232].includes(c)) return "storm";
  if ([300, 301, 302, 310, 311, 312, 313, 314, 321, 500, 501, 502, 503, 504, 511, 520, 521, 522, 531].includes(c)) return "rain";
  if ([600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622].includes(c)) return "snow";
  if ([701, 711, 721, 741].includes(c)) return "fog";
  if ([801, 802, 803, 804].includes(c)) return "cloud";
  if (c >= 176 && c <= 377) return "rain";
  if (c >= 386 && c <= 395) return "storm";
  if (c >= 200 && c <= 299) return "storm";
  return "clear";
}

const descZh: Record<string, string> = {
  Clear: "晴", "Partly cloudy": "多云", Cloudy: "阴", Foggy: "雾",
  Drizzle: "小雨", Rain: "雨", "Rain showers": "阵雨", Thunderstorm: "雷暴",
};

export function useCityWeather(city: CityConfig): CityWeather | null {
  const [weather, setWeather] = useState<CityWeather | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code&timezone=${encodeURIComponent(city.timezone)}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (res.ok) {
          const data = await res.json();
          const current = data?.current;
          if (current) {
            const wmoCode = current.weather_code ?? 0;
            let condition: CityWeather["condition"] = "clear";
            let desc = "Clear";
            if (wmoCode >= 95) { condition = "storm"; desc = "Thunderstorm"; }
            else if (wmoCode >= 80) { condition = "rain"; desc = "Rain showers"; }
            else if (wmoCode >= 61) { condition = "rain"; desc = "Rain"; }
            else if (wmoCode >= 51) { condition = "rain"; desc = "Drizzle"; }
            else if (wmoCode >= 45) { condition = "fog"; desc = "Foggy"; }
            else if (wmoCode >= 3) { condition = "cloud"; desc = "Cloudy"; }
            else if (wmoCode >= 1) { condition = "cloud"; desc = "Partly cloudy"; }

            setWeather({
              condition,
              temp: Math.round(current.temperature_2m) || 20,
              description: city.locale === "zh" ? (descZh[desc] ?? desc) : desc,
            });
            return;
          }
        }
      } catch { /* fallback */ }

      try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(city.wttrName)}?format=j1`, {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          const current = data?.current_condition?.[0];
          if (current) {
            const code = current.weatherCode || "800";
            const rawDesc = current.weatherDesc?.[0]?.value || "Clear";
            setWeather({
              condition: parseCondition(code),
              temp: parseInt(current.temp_C) || 20,
              description: city.locale === "zh" ? (descZh[rawDesc] ?? rawDesc) : rawDesc,
            });
          }
        }
      } catch { /* no weather */ }
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city.id, city.latitude, city.longitude, city.timezone, city.wttrName, city.locale]);

  return weather;
}

/** @deprecated Use useCityWeather */
export function useSydneyWeather(): CityWeather | null {
  return useCityWeather(defaultCity);
}
