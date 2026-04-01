import { User } from '@supabase/supabase-js';
import { Flame, Star, TrendingUp, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  user: User;
  xp: number;
  level: number;
  streak: number;
  xpToNextLevel: number;
}

export default function HeroSection({ user, xp, level, streak, xpToNextLevel }: HeroSectionProps) {
  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Solver';
  const xpInCurrentLevel = xp % 100;
  const xpProgress = (xpInCurrentLevel / xpToNextLevel) * 100;

  const levelTitles = [
    'Rookie Solver', 'Apprentice', 'Problem Seeker', 'Solution Builder',
    'Tech Innovator', 'Expert Solver', 'Master Mind', 'Grand Solver',
    'Elite Thinker', 'Legend'
  ];
  const levelTitle = levelTitles[Math.min(level - 1, levelTitles.length - 1)] || 'Legend';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 glow-primary animate-slide-up">
      {/* Background glow elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Left: Welcome + title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary/80 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
              Level {level} · {levelTitle}
            </span>
            {streak >= 3 && (
              <span className="text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/25 px-2.5 py-1 rounded-full flex items-center gap-1 animate-streak">
                <Flame className="h-3 w-3" /> {streak}-day streak!
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            Welcome back,{' '}
            <span className="text-gradient">{username}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {xp === 0
              ? "Ready to start your journey? Solve your first problem!"
              : `You've earned ${xp} XP total. Keep pushing to Level ${level + 1}!`}
          </p>
        </div>

        {/* Right: XP stats */}
        <div className="flex gap-4 shrink-0">
          <div className="glass-card p-4 text-center min-w-[80px]">
            <Star className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-accent">{xp}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total XP</p>
          </div>
          <div className="glass-card p-4 text-center min-w-[80px]">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-primary">#{level}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Level</p>
          </div>
          {streak > 0 && (
            <div className="glass-card p-4 text-center min-w-[80px]">
              <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-orange-400">{streak}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Streak</p>
            </div>
          )}
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="relative mt-6 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Level {level}</span>
          <span>{xpInCurrentLevel} / {xpToNextLevel} XP to Level {level + 1}</span>
          <span className="flex items-center gap-1">
            Level {level + 1} <ChevronRight className="h-3 w-3" />
          </span>
        </div>
        <div className="h-3 rounded-full bg-secondary/60 overflow-hidden">
          <div
            className="h-full rounded-full xp-bar-fill transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(xpProgress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
