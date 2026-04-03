"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { type CityConfig, defaultCity, cities } from "./cities";

interface CityContextValue {
  city: CityConfig;
  setCity: (cityId: string) => void;
  clearCity: () => void;
  /** null = on landing page choosing city */
  isLanding: boolean;
}

const CityContext = createContext<CityContextValue>({
  city: defaultCity,
  setCity: () => {},
  clearCity: () => {},
  isLanding: true,
});

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<CityConfig | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Read localStorage only after hydration
  useEffect(() => {
    const saved = localStorage.getItem("selectedCity");
    if (saved && cities[saved]) {
      setCityState(cities[saved]);
    }
    setHydrated(true);
  }, []);

  const setCity = useCallback((cityId: string) => {
    const c = cities[cityId];
    if (c) {
      setCityState(c);
      localStorage.setItem("selectedCity", cityId);
    }
  }, []);

  const clearCity = useCallback(() => {
    setCityState(null);
    localStorage.removeItem("selectedCity");
  }, []);

  return (
    <CityContext value={{
      city: city ?? defaultCity,
      setCity,
      clearCity,
      isLanding: !hydrated || city === null,
    }}>
      {children}
    </CityContext>
  );
}

export function useCity() {
  return useContext(CityContext);
}
