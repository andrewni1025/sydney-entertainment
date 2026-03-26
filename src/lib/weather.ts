"use client";

import { useEffect, useState } from "react";

export interface SydneyWeather {
  condition: "rain" | "cloud" | "clear" | "snow" | "storm" | "fog";
  temp: number;
  description: string;
}

export type TimeOfDay = "night" | "dawn" | "day" | "dusk";

export function getTimeOfDay(): TimeOfDay {
  // Use Sydney time (AEST = UTC+11 in DST, UTC+10 otherwise)
  const now = new Date();
  const sydneyHour = parseInt(
    now.toLocaleString("en-AU", { timeZone: "Australia/Sydney", hour: "numeric", hour12: false })
  );

  if (sydneyHour >= 5 && sydneyHour < 7) return "dawn";
  if (sydneyHour >= 7 && sydneyHour < 17) return "day";
  if (sydneyHour >= 17 && sydneyHour < 19) return "dusk";
  return "night";
}

function parseCondition(code: string): SydneyWeather["condition"] {
  const c = parseInt(code);
  // wttr.in weather codes: https://github.com/chubin/wttr.in/blob/master/lib/constants.py
  if ([200, 201, 202, 210, 211, 212, 221, 230, 231, 232].includes(c)) return "storm";
  if ([300, 301, 302, 310, 311, 312, 313, 314, 321, 500, 501, 502, 503, 504, 511, 520, 521, 522, 531].includes(c)) return "rain";
  if ([600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622].includes(c)) return "snow";
  if ([701, 711, 721, 741].includes(c)) return "fog";
  if ([801, 802, 803, 804].includes(c)) return "cloud";
  // wttr.in uses simpler codes sometimes
  if (c >= 176 && c <= 377) return "rain";
  if (c >= 386 && c <= 395) return "storm";
  if (c >= 200 && c <= 299) return "storm";
  return "clear";
}

export function useSydneyWeather(): SydneyWeather | null {
  const [weather, setWeather] = useState<SydneyWeather | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("https://wttr.in/Sydney?format=j1", {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return;
        const data = await res.json();
        const current = data?.current_condition?.[0];
        if (!current) return;

        const code = current.weatherCode || "800";
        const desc = current.weatherDesc?.[0]?.value || "Clear";

        setWeather({
          condition: parseCondition(code),
          temp: parseInt(current.temp_C) || 20,
          description: desc,
        });
      } catch {
        // Fallback: no weather data
      }
    }

    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return weather;
}
