"use client";

import { useState, useEffect } from "react";

function useClientOnly() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function RainEffect({ intensity = "normal" }: { intensity?: "light" | "normal" | "heavy" }) {
  const mounted = useClientOnly();
  const count = intensity === "heavy" ? 120 : intensity === "light" ? 30 : 60;

  if (!mounted) return null;

  const drops = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${seededRandom(i * 7 + 1) * 100}%`,
    delay: `${seededRandom(i * 13 + 2) * 2}s`,
    duration: `${0.4 + seededRandom(i * 17 + 3) * 0.3}s`,
    opacity: 0.15 + seededRandom(i * 23 + 4) * 0.2,
    width: seededRandom(i * 31 + 5) > 0.7 ? 2 : 1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute top-0"
          style={{
            left: drop.left,
            width: `${drop.width}px`,
            height: "20px",
            background: `linear-gradient(to bottom, transparent, rgba(174, 194, 224, ${drop.opacity}))`,
            animation: `rainFall ${drop.duration} linear ${drop.delay} infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes rainFall {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function StarsEffect() {
  const mounted = useClientOnly();
  if (!mounted) return null;

  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${seededRandom(i * 11 + 100) * 100}%`,
    top: `${seededRandom(i * 19 + 200) * 60}%`,
    size: 1 + seededRandom(i * 29 + 300) * 2,
    delay: `${seededRandom(i * 37 + 400) * 4}s`,
    duration: `${2 + seededRandom(i * 43 + 500) * 3}s`,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration} ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

export function CloudsEffect() {
  const mounted = useClientOnly();
  if (!mounted) return null;

  const clouds = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    top: `${10 + seededRandom(i * 53 + 600) * 30}%`,
    size: 200 + seededRandom(i * 59 + 700) * 300,
    opacity: 0.03 + seededRandom(i * 61 + 800) * 0.04,
    duration: `${40 + seededRandom(i * 67 + 900) * 30}s`,
    delay: `${-seededRandom(i * 71 + 1000) * 40}s`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute rounded-full"
          style={{
            top: cloud.top,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.4}px`,
            background: `radial-gradient(ellipse, rgba(200,200,220,${cloud.opacity}), transparent 70%)`,
            animation: `cloudDrift ${cloud.duration} linear ${cloud.delay} infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes cloudDrift {
          0% { transform: translateX(-400px); }
          100% { transform: translateX(calc(100vw + 400px)); }
        }
      `}</style>
    </div>
  );
}

export function SunGlowEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute -top-20 right-[10%] w-[400px] h-[400px] rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, rgba(255,200,50,0.8), transparent 70%)",
        }}
      />
    </div>
  );
}
