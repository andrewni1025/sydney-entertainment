"use client";

export default function ChangzhouSkyline({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ opacity }}>
      <svg viewBox="0 0 1440 220" fill="currentColor" className="w-full text-white" preserveAspectRatio="xMidYMax meet">
        {/* Tianning Pagoda (天宁宝塔) — tallest landmark */}
        <g transform="translate(300, 0)">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => {
            const y = 30 + i * 13;
            const w = 28 - i * 1.2;
            const x = 20 - w / 2;
            return (
              <g key={i}>
                <rect x={x} y={y} width={w} height={11} rx="0.5" />
                <path d={`M${x - 2},${y} L${20},${y - 3} L${x + w + 2},${y}`} />
              </g>
            );
          })}
          <path d="M18,26 L20,12 L22,26" />
          <line x1="20" y1="12" x2="20" y2="2" stroke="currentColor" strokeWidth="1" />
        </g>

        {/* Dinosaur Park entrance (恐龙园) */}
        <g transform="translate(600, 0)">
          {/* Main dome */}
          <path d="M0,200 L0,140 Q40,80 80,140 L80,200" />
          <ellipse cx="40" cy="130" rx="35" ry="25" opacity="0.3" />
          {/* Side structures */}
          <rect x="-20" y="160" width="20" height="40" rx="1" />
          <rect x="80" y="155" width="25" height="45" rx="1" />
          {/* Dino silhouette on dome */}
          <path d="M25,120 L30,110 L35,115 L40,108 L45,113 L50,118 L55,120" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        </g>

        {/* Qingguo Lane (青果巷) — traditional buildings */}
        <g transform="translate(800, 0)">
          <rect x="0" y="175" width="30" height="25" rx="1" />
          <path d="M-3,175 Q15,160 33,175" />
          <rect x="35" y="172" width="25" height="28" rx="1" />
          <path d="M32,172 Q47,158 63,172" />
          <rect x="68" y="178" width="28" height="22" rx="1" />
          <path d="M65,178 Q82,165 99,178" />
          <rect x="102" y="175" width="22" height="25" rx="1" />
          <path d="M99,175 Q113,162 127,175" />
        </g>

        {/* Modern Changzhou — Lotus Tower area */}
        <g transform="translate(1050, 0)">
          <rect x="0" y="110" width="22" height="90" rx="1" />
          <rect x="28" y="90" width="18" height="110" rx="1" />
          <rect x="52" y="120" width="25" height="80" rx="1" />
          <rect x="82" y="105" width="20" height="95" rx="1" />
          <rect x="108" y="130" width="24" height="70" rx="1" />
        </g>

        {/* Left side — scattered buildings */}
        <rect x="80" y="180" width="20" height="20" rx="1" />
        <path d="M76,180 L90,170 L104,180" />
        <rect x="110" y="178" width="18" height="22" rx="1" />
        <rect x="140" y="182" width="22" height="18" rx="1" />
        <rect x="175" y="175" width="15" height="25" rx="1" />
        <rect x="200" y="180" width="20" height="20" rx="1" />

        {/* Right side */}
        <rect x="1220" y="170" width="22" height="30" rx="1" />
        <rect x="1250" y="175" width="18" height="25" rx="1" />
        <rect x="1280" y="178" width="24" height="22" rx="1" />
        <rect x="1320" y="182" width="20" height="18" rx="1" />
        <rect x="1360" y="185" width="25" height="15" rx="1" />

        {/* Grand Canal */}
        <rect x="0" y="200" width="1440" height="20" opacity="0.25" />
      </svg>
    </div>
  );
}
