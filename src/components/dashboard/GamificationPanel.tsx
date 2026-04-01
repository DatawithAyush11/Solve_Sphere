import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Target, Clock, CheckCircle, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GamificationPanelProps {
  xp: number;
  level: number;
  solutionCount: number;
  streak: number;
}

const BADGES = [
  { id: 'first_solve', icon: '🎯', title: 'First Blood', desc: 'Solve your first problem', req: 1, key: 'solutions' },
  { id: 'five_solve', icon: '⚡', title: 'On Fire', desc: 'Solve 5 problems', req: 5, key: 'solutions' },
  { id: 'ten_solve', icon: '🏆', title: 'Champion', desc: 'Solve 10 problems', req: 10, key: 'solutions' },
  { id: 'xp_100', icon: '💎', title: 'Diamond Mind', desc: 'Reach 100 XP', req: 100, key: 'xp' },
  { id: 'xp_500', icon: '🌟', title: 'Star Solver', desc: 'Reach 500 XP', req: 500, key: 'xp' },
  { id: 'streak_3', icon: '🔥', title: 'Hot Streak', desc: '3-day solving streak', req: 3, key: 'streak' },
  { id: 'level_3', icon: '🚀', title: 'Rising Star', desc: 'Reach Level 3', req: 3, key: 'level' },
  { id: 'level_5', icon: '👑', title: 'Elite Solver', desc: 'Reach Level 5', req: 5, key: 'level' },
];

function DailyChallenge() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="glass-card p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">Daily Challenge</span>
        </div>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">+25 XP</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Design a traffic management system for Mumbai's peak hours</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1 text-xs font-mono">
          <span className="bg-secondary px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
          <span className="text-muted-foreground">:</span>
          <span className="bg-secondary px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
          <span className="text-muted-foreground">:</span>
          <span className="bg-secondary px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> Resets at midnight
        </span>
      </div>
    </div>
  );
}

export default function GamificationPanel({ xp, level, solutionCount, streak }: GamificationPanelProps) {
  const stats = { xp, solutions: solutionCount, streak, level };
  const weeklyGoal = 5;
  const weeklyProgress = Math.min(solutionCount, weeklyGoal);

  return (
    <div className="space-y-4 animate-slide-up delay-100">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Trophy className="h-5 w-5 text-accent" />
        <span>Your Progress</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* XP Card */}
        <div className="glass-card p-4 space-y-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">XP Points</span>
            </div>
            <span className="text-2xl font-bold text-accent">{xp}</span>
          </div>
          <Progress value={Math.min((xp % 100), 100)} className="h-2" />
          <p className="text-[10px] text-muted-foreground">{100 - (xp % 100)} XP to next level</p>
        </div>

        {/* Weekly Goal */}
        <div className="glass-card p-4 space-y-2 border-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Weekly Goal</span>
            </div>
            <span className="text-sm font-bold text-primary">{weeklyProgress}/{weeklyGoal}</span>
          </div>
          <Progress value={(weeklyProgress / weeklyGoal) * 100} className="h-2" />
          <p className="text-[10px] text-muted-foreground">
            {weeklyProgress >= weeklyGoal ? '🎉 Goal achieved this week!' : `${weeklyGoal - weeklyProgress} more solutions to reach goal`}
          </p>
        </div>
      </div>

      {/* Daily Challenge */}
      <DailyChallenge />

      {/* Badges */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span>🏅</span> Achievements
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {BADGES.map(badge => {
            const current = stats[badge.key as keyof typeof stats] as number;
            const unlocked = current >= badge.req;
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 cursor-default ${
                  unlocked
                    ? 'border-primary/30 bg-primary/5 hover:glow-primary'
                    : 'border-border/30 opacity-50 grayscale'
                }`}
                title={`${badge.title}: ${badge.desc}`}
              >
                <span className="text-xl">{badge.icon}</span>
                <span className="text-[9px] text-center leading-tight text-muted-foreground">{badge.title}</span>
                {unlocked
                  ? <CheckCircle className="h-2.5 w-2.5 text-primary" />
                  : <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
