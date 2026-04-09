"use client";

export default function TokyoSkyline({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 flex items-end justify-center pointer-events-none" style={{ opacity }}>
      <svg viewBox="0 0 1200 200" className="w-full h-auto" fill="currentColor" style={{ color: "#e11d48" }}>
        {/* Tokyo Tower */}
        <polygon points="480,200 490,40 495,20 500,40 510,200" />
        <rect x="488" y="60" width="14" height="3" />
        <rect x="486" y="90" width="18" height="3" />
        <rect x="484" y="120" width="22" height="3" />
        {/* Tokyo Skytree */}
        <polygon points="700,200 706,30 708,10 710,30 716,200" />
        <rect x="704" y="50" width="8" height="2" />
        <rect x="702" y="80" width="12" height="2" />
        <rect x="700" y="110" width="16" height="3" />
        <ellipse cx="708" cy="45" rx="6" ry="4" fillOpacity="0.5" />
        {/* Shinjuku buildings cluster */}
        <rect x="200" y="100" width="30" height="100" rx="1" />
        <rect x="235" y="80" width="25" height="120" rx="1" />
        <rect x="265" y="110" width="20" height="90" rx="1" />
        <rect x="290" y="90" width="28" height="110" rx="1" />
        <rect x="323" y="105" width="22" height="95" rx="1" />
        {/* Shibuya / mid buildings */}
        <rect x="380" y="130" width="25" height="70" rx="1" />
        <rect x="410" y="120" width="20" height="80" rx="1" />
        <rect x="435" y="140" width="18" height="60" rx="1" />
        {/* Roppongi / right side */}
        <rect x="550" y="115" width="22" height="85" rx="1" />
        <rect x="577" y="125" width="18" height="75" rx="1" />
        <rect x="600" y="105" width="25" height="95" rx="1" />
        {/* Marunouchi / far right */}
        <rect x="780" y="110" width="28" height="90" rx="1" />
        <rect x="813" y="95" width="22" height="105" rx="1" />
        <rect x="840" y="120" width="20" height="80" rx="1" />
        <rect x="865" y="100" width="25" height="100" rx="1" />
        {/* Asakusa temple silhouette */}
        <rect x="950" y="140" width="40" height="60" rx="1" />
        <polygon points="950,140 970,110 990,140" />
        <rect x="1000" y="130" width="15" height="70" rx="1" />
        {/* Ground line */}
        <rect x="0" y="198" width="1200" height="2" fillOpacity="0.3" />
      </svg>
    </div>
  );
}
