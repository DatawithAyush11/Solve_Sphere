import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Globe, MapPin } from 'lucide-react';

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
      // Get solutions with problem category and profile username
      const { data: solutions } = await supabase
        .from('solutions')
        .select('id, user_id, ai_score, problem_id, problems(category), profiles:user_id(username)');

      if (!solutions || solutions.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }

      const filtered = solutions.filter((s: any) => s.problems?.category === tab);

      // Get all ratings for these solutions
      const solutionIds = filtered.map((s: any) => s.id);
      const { data: ratings } = await supabase
        .from('ratings')
        .select('solution_id, score')
        .in('solution_id', solutionIds.length > 0 ? solutionIds : ['__none__']);

      // Build rating map: solution_id -> avg rating
      const ratingMap = new Map<string, number[]>();
      (ratings || []).forEach((r: any) => {
        const arr = ratingMap.get(r.solution_id) || [];
        arr.push(r.score);
        ratingMap.set(r.solution_id, arr);
      });

      // Aggregate by user
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
        const solAvgRating = solRatings.length > 0
          ? solRatings.reduce((a, b) => a + b, 0) / solRatings.length
          : 0;

        // Weighted: (ai_score * 0.7) + (avg_rating * 20 * 0.3)
        const weighted = (aiScore * 0.7) + (solAvgRating * 20 * 0.3);

        existing.ai_score_total += aiScore;
        existing.final_score += weighted;
        existing.solution_count += 1;
        // Running average of ratings across solutions
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

  return (
    <div className="container py-8 space-y-6 max-w-3xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-accent" /> Leaderboard
          </h1>
          <p className="text-muted-foreground">Top solvers ranked by weighted scores</p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === 'global' ? 'default' : 'secondary'} size="sm" onClick={() => setTab('global')}
            className={tab === 'global' ? 'gradient-primary text-primary-foreground' : ''}>
            <Globe className="h-3 w-3 mr-1" /> Global
          </Button>
          <Button variant={tab === 'local' ? 'default' : 'secondary'} size="sm" onClick={() => setTab('local')}
            className={tab === 'local' ? 'gradient-primary text-primary-foreground' : ''}>
            <MapPin className="h-3 w-3 mr-1" /> Local
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : entries.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">No submissions yet. Be the first!</div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div key={entry.user_id}
              className={`glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 hover-scale ${i < 3 ? 'glow-accent' : ''}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`text-2xl font-bold w-10 text-center ${i === 0 ? 'text-accent' : i === 1 ? 'text-muted-foreground' : i === 2 ? 'text-[hsl(var(--warning))]' : 'text-muted-foreground'}`}>
                {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{entry.username}</p>
                <p className="text-xs text-muted-foreground">{entry.solution_count} solution{entry.solution_count !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-xl font-bold text-accent">{Math.round(entry.final_score)}</p>
                <p className="text-[10px] text-muted-foreground">AI: {entry.ai_score_total} · ⭐ {entry.avg_rating.toFixed(1)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
