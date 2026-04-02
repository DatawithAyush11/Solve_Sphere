import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  hasHeader?: boolean;
  hasFooter?: boolean;
}

export function SkeletonCard({ className, lines = 3, hasHeader = true, hasFooter = false }: SkeletonCardProps) {
  return (
    <div className={cn('glass-card p-5 space-y-3', className)}>
      {hasHeader && (
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <div className="skeleton h-3.5 w-2/5 rounded" />
            <div className="skeleton h-3 w-1/5 rounded" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded"
          style={{ width: i === lines - 1 ? '65%' : '100%' }}
        />
      ))}
      {hasFooter && (
        <div className="flex justify-between pt-1">
          <div className="skeleton h-3 w-1/4 rounded" />
          <div className="skeleton h-7 w-24 rounded-lg" />
        </div>
      )}
    </div>
  );
}

export function SkeletonText({ lines = 2, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-3.5 rounded" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'h-7 w-7', md: 'h-10 w-10', lg: 'h-14 w-14' };
  return <div className={cn('skeleton rounded-full', sizeClasses[size])} />;
}
