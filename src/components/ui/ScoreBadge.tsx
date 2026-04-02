import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(score: number, max: number) {
  const pct = score / max;
  if (pct >= 0.8) return 'text-emerald-400 bg-emerald-500/12 border-emerald-500/25';
  if (pct >= 0.6) return 'text-amber-400 bg-amber-500/12 border-amber-500/25';
  return 'text-rose-400 bg-rose-500/12 border-rose-500/25';
}

export function ScoreBadge({ score, max = 100, size = 'md', showLabel = false, className }: ScoreBadgeProps) {
  const colorClass = getScoreColor(score, max);
  const sizeClass = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1', lg: 'text-base px-3 py-1.5' }[size];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-lg border font-semibold tabular-nums', colorClass, sizeClass, className)}>
      {score}
      {showLabel && <span className="opacity-60 font-normal text-[0.7em]">/{max}</span>}
    </span>
  );
}

interface ScoreRingProps {
  score: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreRing({ score, max = 100, size = 120, strokeWidth = 9, className }: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score / max;
  const strokeColor = pct >= 0.8 ? '#34d399' : pct >= 0.6 ? '#fbbf24' : '#f87171';
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="hsl(220 22% 14%)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          className="animate-draw-ring"
          style={{ transition: 'stroke-dashoffset 1.4s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color: strokeColor }}>{score}</span>
        <span className="text-xs text-muted-foreground">/{max}</span>
      </div>
    </div>
  );
}
