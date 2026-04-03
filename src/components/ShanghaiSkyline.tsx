"use client";

export default function ShanghaiSkyline({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ opacity }}>
      <svg viewBox="0 0 1440 220" fill="currentColor" className="w-full text-white" preserveAspectRatio="xMidYMax meet">
        {/* Oriental Pearl Tower */}
        <g transform="translate(300, 0)">
          <rect x="18" y="50" width="4" height="150" />
          <circle cx="20" cy="80" r="18" />
          <circle cx="20" cy="80" r="12" opacity="0.5" />
          <circle cx="20" cy="130" r="10" />
          <rect x="19" y="30" width="2" height="25" />
          <line x1="20" y1="30" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5" />
          {/* Support legs */}
          <path d="M12,200 L18,130" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M28,200 L22,130" fill="none" stroke="currentColor" strokeWidth="2" />
        </g>

        {/* Shanghai Tower (tallest) */}
        <g transform="translate(400, 0)">
          <path d="M15,200 L15,25 Q20,15 25,25 L25,200" />
          <path d="M17,40 Q20,30 23,40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M16,80 Q20,70 24,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M16,120 Q20,110 24,120" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </g>

        {/* Shanghai World Financial Center (bottle opener) */}
        <g transform="translate(440, 0)">
          <rect x="5" y="40" width="20" height="160" rx="1" />
          <rect x="9" y="42" width="12" height="8" rx="4" fill="black" opacity="0.3" />
        </g>

        {/* Jin Mao Tower */}
        <g transform="translate(480, 0)">
          <rect x="8" y="55" width="18" height="145" rx="1" />
          {[70, 85, 100, 115, 130, 145].map((y) => (
            <rect key={y} x="6" y={y} width="22" height="2" rx="1" opacity="0.3" />
          ))}
          <rect x="14" y="45" width="6" height="12" rx="1" />
        </g>

        {/* Pudong buildings cluster */}
        <rect x="520" y="90" width="20" height="110" rx="1" />
        <rect x="545" y="110" width="16" height="90" rx="1" />
        <rect x="570" y="100" width="22" height="100" rx="1" />
        <rect x="600" y="120" width="18" height="80" rx="1" />

        {/* The Bund (Puxi side) — lower, classical */}
        <g transform="translate(700, 0)">
          {/* Row of colonial buildings */}
          <rect x="0" y="160" width="30" height="40" rx="1" />
          <path d="M0,160 L15,150 L30,160" />
          <rect x="35" y="155" width="25" height="45" rx="1" />
          <rect x="65" y="158" width="28" height="42" rx="1" />
          <path d="M65,158 L79,148 L93,158" />
          <rect x="98" y="162" width="22" height="38" rx="1" />
          <rect x="125" y="155" width="30" height="45" rx="1" />
          {/* Clock tower */}
          <rect x="133" y="140" width="14" height="15" rx="1" />
          <circle cx="140" cy="147" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <rect x="160" y="160" width="25" height="40" rx="1" />
          <rect x="190" y="157" width="28" height="43" rx="1" />
        </g>

        {/* Left side buildings */}
        <rect x="80" y="170" width="18" height="30" rx="1" />
        <rect x="105" y="165" width="15" height="35" rx="1" />
        <rect x="130" y="175" width="20" height="25" rx="1" />
        <rect x="160" y="160" width="16" height="40" rx="1" />
        <rect x="185" y="170" width="22" height="30" rx="1" />

        {/* Right side */}
        <rect x="1050" y="140" width="25" height="60" rx="1" />
        <rect x="1080" y="155" width="20" height="45" rx="1" />
        <rect x="1110" y="165" width="18" height="35" rx="1" />
        <rect x="1140" y="150" width="22" height="50" rx="1" />
        <rect x="1180" y="170" width="20" height="30" rx="1" />
        <rect x="1210" y="175" width="25" height="25" rx="1" />
        <rect x="1250" y="180" width="18" height="20" rx="1" />

        {/* Huangpu River */}
        <rect x="0" y="200" width="1440" height="20" opacity="0.3" />
      </svg>
    </div>
  );
}
