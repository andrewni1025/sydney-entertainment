"use client";

export default function SuzhouSkyline({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ opacity }}>
      <svg viewBox="0 0 1440 220" fill="currentColor" className="w-full text-white" preserveAspectRatio="xMidYMax meet">
        {/* Tiger Hill Pagoda (虎丘塔) — left landmark */}
        <g transform="translate(250, 0)">
          {/* 7 stories, slightly tilted */}
          <g transform="rotate(-3, 20, 200)">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const y = 60 + i * 20;
              const w = 22 - i * 1.5;
              const x = 20 - w / 2;
              return (
                <g key={i}>
                  <rect x={x} y={y} width={w} height={18} rx="1" />
                  <path d={`M${x - 3},${y} L${20},${y - 4} L${x + w + 3},${y}`} />
                </g>
              );
            })}
            <path d="M18,56 L20,45 L22,56" />
          </g>
        </g>

        {/* Suzhou Museum (贝聿铭几何屋顶) */}
        <g transform="translate(500, 0)">
          <rect x="0" y="170" width="120" height="30" rx="1" />
          {/* Geometric roofs — I.M. Pei style */}
          <path d="M10,170 L35,140 L60,170" />
          <path d="M60,170 L85,145 L110,170" />
          <path d="M30,170 L50,155 L70,170" opacity="0.5" />
          {/* Water reflection pool */}
          <rect x="15" y="195" width="90" height="5" rx="1" opacity="0.2" />
        </g>

        {/* Classical garden pavilions (园林) */}
        <g transform="translate(750, 0)">
          {/* Pavilion 1 — curved roof */}
          <rect x="0" y="175" width="40" height="25" rx="1" />
          <path d="M-5,175 Q20,155 45,175" />
          {/* Columns */}
          <rect x="5" y="175" width="2" height="20" />
          <rect x="33" y="175" width="2" height="20" />
          
          {/* Covered corridor */}
          <rect x="40" y="180" width="60" height="3" />
          {[50, 60, 70, 80, 90].map((x) => (
            <rect key={x} x={x} y={180} width="1.5" height="15" />
          ))}

          {/* Pavilion 2 */}
          <rect x="100" y="172" width="35" height="28" rx="1" />
          <path d="M95,172 Q117,150 140,172" />
        </g>

        {/* Modern Suzhou — Gate of the Orient (东方之门) */}
        <g transform="translate(1000, 0)">
          <path d="M0,200 L0,70 Q15,50 30,70 L30,200" />
          <path d="M40,200 L40,70 Q55,50 70,70 L70,200" />
          <path d="M5,80 Q35,60 65,80" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M5,100 Q35,85 65,100" fill="none" stroke="currentColor" strokeWidth="1" />
        </g>

        {/* Scattered traditional houses */}
        <rect x="80" y="180" width="25" height="20" rx="1" />
        <path d="M75,180 L92,168 L110,180" />
        <rect x="115" y="182" width="20" height="18" rx="1" />
        <path d="M112,182 L125,172 L138,182" />
        <rect x="150" y="185" width="22" height="15" rx="1" />

        {/* Right side houses and trees */}
        <rect x="1150" y="178" width="25" height="22" rx="1" />
        <path d="M1145,178 L1162,166 L1180,178" />
        <rect x="1190" y="182" width="20" height="18" rx="1" />
        <rect x="1220" y="180" width="28" height="20" rx="1" />
        <path d="M1215,180 L1234,168 L1253,180" />
        <rect x="1270" y="185" width="22" height="15" rx="1" />
        <rect x="1310" y="183" width="18" height="17" rx="1" />

        {/* Canal water */}
        <rect x="0" y="200" width="1440" height="20" opacity="0.25" />
      </svg>
    </div>
  );
}
