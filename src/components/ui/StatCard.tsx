import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  className?: string;
  glow?: boolean;
}

export function StatCard({ title, value, icon, trend, className, glow }: StatCardProps) {
  return (
    <div className={cn("glass-card p-5 group", glow && "glow-primary", className)}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</p>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-bold">{value}</h3>
        {trend && (
          <div className={cn("flex flex-col items-end text-xs font-medium", trend.isPositive !== false ? "text-emerald-400" : "text-rose-400")}>
            <span>{trend.isPositive !== false ? "+" : "-"}{Math.abs(trend.value)}%</span>
            {trend.label && <span className="text-muted-foreground mt-0.5 text-[10px]">{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
