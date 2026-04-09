"use client";

import SydneySkyline from "./SydneySkyline";
import ShanghaiSkyline from "./ShanghaiSkyline";
import SuzhouSkyline from "./SuzhouSkyline";
import ChangzhouSkyline from "./ChangzhouSkyline";
import TokyoSkyline from "./TokyoSkyline";

const skylines: Record<string, React.ComponentType<{ opacity?: number }>> = {
  sydney: SydneySkyline,
  shanghai: ShanghaiSkyline,
  suzhou: SuzhouSkyline,
  changzhou: ChangzhouSkyline,
  tokyo: TokyoSkyline,
};

export default function CitySkyline({ cityId, opacity = 0.04 }: { cityId: string; opacity?: number }) {
  const Skyline = skylines[cityId] ?? SydneySkyline;
  return <Skyline opacity={opacity} />;
}
