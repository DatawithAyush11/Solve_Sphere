import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Globe, MapPin, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard, SkeletonAvatar, SkeletonText } from '@/components/ui/SkeletonCard';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  ai_score_total: number;
  avg_rating: number;
  final_score: number;
  solution_count: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'global' | 'local'>('global');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: solutions } = await supabase
        .from('solutions')
        .select('id, user_id, ai_score, problem_id, problems(category), profiles:user_id(username)');

      if (!solutions || solutions.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }

      const filtered = solutions.filter((s: any) => s.problems?.category === tab);
      const solutionIds = filtered.map((s: any) => s.id);
      
      const { data: ratings } = await supabase
        .from('ratings')
        .select('solution_id, score')
        .in('solution_id', solutionIds.length > 0 ? solutionIds : ['__none__']);

      const ratingMap = new Map<string, number[]>();
      (ratings || []).forEach((r: any) => {
        const arr = ratingMap.get(r.solution_id) || [];
        arr.push(r.score);
        ratingMap.set(r.solution_id, arr);
      });

      const userMap = new Map<string, LeaderboardEntry>();
      filtered.forEach((s: any) => {
        const existing = userMap.get(s.user_id) || {
          user_id: s.user_id,
          username: (s.profiles as any)?.username || 'Anonymous',
          ai_score_total: 0,
          avg_rating: 0,
          final_score: 0,
          solution_count: 0,
        };
        const aiScore = s.ai_score || 0;
        const solRatings = ratingMap.get(s.id) || [];
        const solAvgRating = solRatings.length > 0 ? solRatings.reduce((a, b) => a + b, 0) / solRatings.length : 0;
        const weighted = (aiScore * 0.7) + (solAvgRating * 20 * 0.3);

        existing.ai_score_total += aiScore;
        existing.final_score += weighted;
        existing.solution_count += 1;
        const prevTotal = existing.avg_rating * (existing.solution_count - 1);
        existing.avg_rating = (prevTotal + solAvgRating) / existing.solution_count;

        userMap.set(s.user_id, existing);
      });

      const sorted = Array.from(userMap.values()).sort((a, b) => b.final_score - a.final_score);
      setEntries(sorted);
      setLoading(false);
    };
    load();
  }, [tab]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Reorder for podium: [2nd, 1st, 3rd]
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ ...top3[1], rank: 2 });
  if (top3[0]) podiumOrder.push({ ...top3[0], rank: 1 });
  if (top3[2]) podiumOrder.push({ ...top3[2], rank: 3 });

  return (
    <div className="page-container animate-fade-in pb-20 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <PageHeader 
          title="Global Rankings" 
          description="Top solvers ranked by weighted scores across all challenges."
          icon={<Trophy className="h-8 w-8 text-amber-400 drop-shadow-sm" />}
          className="mb-0"
        />
        
        <div className="flex gap-1.5 bg-secondary/50 p-1.5 rounded-xl shrink-0">
          <Button variant={tab === 'global' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('global')}
            className={cn("rounded-lg px-5 font-semibold transition-all", tab === 'global' ? 'bg-card text-foreground shadow-sm hover:bg-card' : 'text-muted-foreground')}>
            <Globe className="h-4 w-4 mr-1.5" /> Global
          </Button>
          <Button variant={tab === 'local' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('local')}
            className={cn("rounded-lg px-5 font-semibold transition-all", tab === 'local' ? 'bg-card text-foreground shadow-sm hover:bg-card' : 'text-muted-foreground')}>
            <MapPin className="h-4 w-4 mr-1.5" /> Local
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-12">
          {/* Skeleton Podium */}
          <div className="flex justify-center items-end gap-4 h-64 border-b border-border/50 pb-8">
            <SkeletonCard lines={2} hasHeader={false} className="w-32 h-32 rounded-t-xl rounded-b-none" />
            <SkeletonCard lines={2} hasHeader={false} className="w-36 h-48 rounded-t-xl rounded-b-none" />
            <SkeletonCard lines={2} hasHeader={false} className="w-32 h-24 rounded-t-xl rounded-b-none" />
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {Array.from({length: 5}).map((_,i) => <SkeletonCard key={i} lines={1} hasHeader={false} className="h-16" />)}
          </div>
        </div>
      ) : entries.length === 0 ? (
        <EmptyState 
           icon={<Trophy className="h-10 w-10 text-muted-foreground" />}
           title="No submissions yet"
           description="Looks like no one has solved any problems in this category yet. Be the first to top the leaderboard!"
           action={<Button onClick={() => window.location.href='/problems'} className="gradient-primary text-black">Start Solving</Button>}
        />
      ) : (
        <div className="space-y-16">
          
          {/* Podium */}
          {podiumOrder.length > 0 && (
            <div className="flex justify-center items-end gap-2 sm:gap-6 pt-10 border-b border-border/30 pb-10">
              {podiumOrder.map((entry, idx) => {
                const isFirst = entry.rank === 1;
                const isSecond = entry.rank === 2;
                const isThird = entry.rank === 3;
                
                const heightClass = isFirst ? 'h-52 sm:h-64' : isSecond ? 'h-40 sm:h-48' : 'h-32 sm:h-36';
                const bgClass = isFirst ? 'bg-gradient-to-t from-amber-400/20 to-amber-400/5 border-amber-400/30' 
                             : isSecond ? 'bg-gradient-to-t from-slate-400/20 to-slate-400/5 border-slate-400/30'
                             : 'bg-gradient-to-t from-amber-700/20 to-amber-700/5 border-amber-700/30';
                
                const medalColors = isFirst ? 'text-amber-400' : isSecond ? 'text-slate-300' : 'text-amber-700';

                return (
                  <div key={entry.user_id} className="flex flex-col items-center animate-slide-up" style={{ animationDelay: `${idx * 150}ms`}}>
                    <div className="relative mb-4 flex flex-col items-center">
                      {isFirst && <div className="absolute -top-6 -z-10 w-24 h-24 bg-amber-400/30 rounded-full blur-xl" />}
                      <div className={cn(
                        "rounded-full flex items-center justify-center font-black text-white shadow-xl z-10 border-2",
                        isFirst ? "w-20 h-20 text-3xl gradient-primary border-white" : "w-16 h-16 text-xl bg-secondary border-border"
                      )}>
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className={cn("absolute -bottom-3 flex items-center justify-center w-8 h-8 rounded-full bg-card shadow-md border border-border/50", medalColors)}>
                         {isFirst ? '🥇' : isSecond ? '🥈' : '🥉'}
                      </div>
                    </div>
                    
                    <p className={cn("font-bold truncate w-24 text-center mt-2", isFirst && "text-lg text-amber-400")}>{entry.username}</p>
                    <p className="text-xl font-black">{Math.round(entry.final_score)}</p>
                    
                    <div className={cn("w-24 sm:w-32 mt-4 rounded-t-2xl border-x border-t transition-all", heightClass, bgClass)}>
                       <div className="h-full flex items-center justify-center opacity-30 text-4xl font-black">
                         {entry.rank}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List Details for ALL entries (including top 3 to see their full stats) */}
          <div className="max-w-3xl mx-auto space-y-3">
             <div className="flex items-center px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
               <div className="w-12 text-center">Rank</div>
               <div className="flex-1 ml-4">Solver</div>
               <div className="w-24 text-right hidden sm:block mr-8">Solutions</div>
               <div className="w-24 text-right">Score</div>
             </div>
             
            {entries.map((entry, i) => {
              const isTop3 = i < 3;
              return (
                <div key={entry.user_id}
                  className={cn(
                    "glass-card p-4 flex items-center group transition-all duration-300 hover:scale-[1.01]",
                    isTop3 ? 'border-primary/20 bg-primary/5' : 'hover:border-primary/30 hover:bg-card'
                  )}
                >
                  <div className="w-12 text-center font-bold text-lg text-muted-foreground flex justify-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-sm opacity-50">#{i + 1}</span>}
                  </div>
                  
                  <div className="flex-1 ml-4 flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                      isTop3 ? "gradient-primary text-black" : "bg-secondary text-foreground"
                    )}>
                       {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={cn("font-bold text-base", isTop3 && "text-primary")}>{entry.username}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{entry.solution_count} solutions</p>
                    </div>
                  </div>
                  
                  <div className="w-24 text-right hidden sm:block mr-8 text-sm font-medium text-muted-foreground">
                    {entry.solution_count}
                  </div>

                  <div className="w-24 text-right space-y-0.5">
                    <p className={cn("text-xl font-black", isTop3 ? "text-primary" : "text-foreground")}>{Math.round(entry.final_score)}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">avg {entry.avg_rating.toFixed(1)}⭐</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
