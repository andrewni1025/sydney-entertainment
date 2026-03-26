"use client";

interface RatingRingProps {
  score: number | null;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  displayValue?: string;
  icon?: React.ReactNode;
  animated?: boolean;
}

export default function RatingRing({
  score,
  maxScore = 100,
  size = 52,
  strokeWidth = 3,
  color,
  label,
  displayValue,
  icon,
}: RatingRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = score !== null ? Math.min(score / maxScore, 1) : 0;
  const offset = circumference - percent * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Score ring */}
          {score !== null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                filter: `drop-shadow(0 0 4px ${color}66)`,
                transition: "stroke-dashoffset 1s ease-out",
              }}
            />
          )}
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          {score !== null ? (
            <span className="text-xs font-bold text-white">
              {displayValue ?? score}
            </span>
          ) : (
            <span className="text-xs text-white/30">—</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 text-[10px] text-white/40">
        {icon && <span className="text-sm leading-none">{icon}</span>}
        <span>{label}</span>
      </div>
    </div>
  );
}
