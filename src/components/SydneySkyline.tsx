"use client";

export default function SydneySkyline({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 pointer-events-none"
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 1440 220"
        fill="currentColor"
        className="w-full text-white"
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Harbour Bridge */}
        <path d="M200,200 L200,160 Q320,60 440,160 L440,200" />
        <rect x="195" y="150" width="10" height="50" />
        <rect x="435" y="150" width="10" height="50" />
        {/* Bridge cables */}
        <path d="M210,160 Q320,80 440,160" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M220,165 Q320,95 430,165" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Bridge road deck */}
        <rect x="200" y="165" width="240" height="8" rx="1" />
        {/* Bridge vertical cables */}
        {[230, 260, 290, 320, 350, 380, 410].map((x) => {
          const t = (x - 210) / 230;
          const y2 = 160 - Math.sin(t * Math.PI) * 80;
          return (
            <line key={x} x1={x} y1={165} x2={x} y2={y2} stroke="currentColor" strokeWidth="1" />
          );
        })}

        {/* Opera House */}
        <g transform="translate(520, 0)">
          {/* Shells */}
          <path d="M40,200 L40,170 Q60,100 80,170 L80,200 Z" />
          <path d="M70,200 L70,160 Q95,80 120,160 L120,200 Z" />
          <path d="M110,200 L110,150 Q140,60 170,150 L170,200 Z" />
          <path d="M155,200 L155,155 Q175,85 195,155 L195,200 Z" />
          {/* Base platform */}
          <rect x="30" y="195" width="180" height="10" rx="2" />
        </g>

        {/* Sydney Tower (Centrepoint) */}
        <g transform="translate(800, 0)">
          <rect x="18" y="80" width="4" height="120" />
          <ellipse cx="20" cy="100" rx="14" ry="8" />
          <ellipse cx="20" cy="95" rx="12" ry="6" />
          <rect x="19" y="60" width="2" height="35" />
          <line x1="20" y1="60" x2="20" y2="45" stroke="currentColor" strokeWidth="1.5" />
        </g>

        {/* City buildings - left cluster */}
        <rect x="850" y="130" width="25" height="70" rx="1" />
        <rect x="880" y="110" width="20" height="90" rx="1" />
        <rect x="905" y="140" width="30" height="60" rx="1" />
        <rect x="940" y="100" width="22" height="100" rx="1" />
        <rect x="967" y="120" width="18" height="80" rx="1" />

        {/* City buildings - right cluster */}
        <rect x="1010" y="135" width="28" height="65" rx="1" />
        <rect x="1045" y="105" width="24" height="95" rx="1" />
        <rect x="1075" y="125" width="20" height="75" rx="1" />
        <rect x="1100" y="145" width="30" height="55" rx="1" />
        <rect x="1140" y="115" width="22" height="85" rx="1" />
        <rect x="1170" y="140" width="26" height="60" rx="1" />

        {/* Scattered smaller buildings */}
        <rect x="100" y="175" width="15" height="25" rx="1" />
        <rect x="120" y="170" width="12" height="30" rx="1" />
        <rect x="140" y="180" width="18" height="20" rx="1" />

        <rect x="1220" y="160" width="20" height="40" rx="1" />
        <rect x="1250" y="170" width="16" height="30" rx="1" />
        <rect x="1280" y="165" width="22" height="35" rx="1" />
        <rect x="1320" y="175" width="18" height="25" rx="1" />
        <rect x="1350" y="180" width="25" height="20" rx="1" />

        {/* Water line */}
        <rect x="0" y="200" width="1440" height="20" opacity="0.3" />
      </svg>
    </div>
  );
}
