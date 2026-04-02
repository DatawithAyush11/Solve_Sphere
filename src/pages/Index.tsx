import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import HeroSection from '@/components/dashboard/HeroSection';
import GamificationPanel from '@/components/dashboard/GamificationPanel';
import ProblemsPreview from '@/components/dashboard/ProblemsPreview';
import LeaderboardPreview from '@/components/dashboard/LeaderboardPreview';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import AnalyticsPanel from '@/components/dashboard/AnalyticsPanel';
import { format, subDays } from 'date-fns';
import { SkeletonCard, SkeletonAvatar, SkeletonText } from '@/components/ui/SkeletonCard';


interface DashboardData {
  xp: number;
  level: number;
  streak: number;
  solutionCount: number;
  problems: any[];
  leaderboard: any[];
  activities: any[];
  solutionsOverTime: { date: string; count: number }[];
  categoryBreakdown: { name: string; value: number; color: string }[];
}

const CATEGORY_COLORS = [
  'hsl(175 80% 50%)', 'hsl(38 92% 60%)', 'hsl(270 80% 65%)',
  'hsl(200 80% 55%)', 'hsl(150 60% 50%)', 'hsl(0 72% 60%)',
];

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const unique = [...new Set(dates.map(d => d.split('T')[0]))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let check = today;
  for (const d of unique) {
    if (d === check) {
      streak++;
      const prev = new Date(check);
      prev.setDate(prev.getDate() - 1);
      check = prev.toISOString().split('T')[0];
    } else break;
  }
  return streak;
}

export default function Index() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // ── User solutions ──
      const { data: sols } = await supabase
        .from('solutions')
        .select('id, ai_score, created_at, problem_id, problems(category, title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const xp = sols?.reduce((s, x) => s + (x.ai_score || 0), 0) || 0;
      const level = Math.floor(xp / 100) + 1;
      const dates = sols?.map(s => s.created_at) || [];
      const streak = computeStreak(dates);

      // Solutions over time (last 7 days)
      const solutionsOverTime = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        const key = format(d, 'yyyy-MM-dd');
        const count = dates.filter(dt => dt.startsWith(key)).length;
        return { date: format(d, 'MMM d'), count };
      });

      // Category breakdown
      const catMap: Record<string, number> = {};
      sols?.forEach(s => {
        const cat = (s.problems as any)?.category || 'other';
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      const categoryBreakdown = Object.entries(catMap).map(([name, value], i) => ({
        name, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));

      // ── Problems preview ──
      const { data: problems } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);

      // ── Leaderboard preview ──
      const { data: allSols } = await supabase
        .from('solutions')
        .select('id, user_id, ai_score, problem_id, problems(category), profiles:user_id(username)');

      const userMap = new Map<string, any>();
      (allSols || []).forEach((s: any) => {
        const existing = userMap.get(s.user_id) || {
          user_id: s.user_id,
          username: s.profiles?.username || 'Anonymous',
          final_score: 0,
          solution_count: 0,
        };
        existing.final_score += (s.ai_score || 0) * 0.7;
        existing.solution_count += 1;
        userMap.set(s.user_id, existing);
      });
      const leaderboard = Array.from(userMap.values()).sort((a, b) => b.final_score - a.final_score).slice(0, 5);

      // ── Activity feed ──
      const { data: recentSols } = await supabase
        .from('solutions')
        .select('id, created_at, problem_id, problems(title), profiles:user_id(username)')
        .order('created_at', { ascending: false })
        .limit(15);

      const activities = (recentSols || []).map((s: any) => ({
        id: s.id,
        type: 'solved' as const,
        username: s.profiles?.username || 'Anonymous',
        detail: (s.problems as any)?.title || 'a problem',
        timestamp: s.created_at,
      }));

      setData({
        xp, level, streak,
        solutionCount: sols?.length || 0,
        problems: (problems || []).map(p => ({ ...p, tags: p.tags || [], organization: p.organization || '' })),
        leaderboard,
        activities,
        solutionsOverTime,
        categoryBreakdown,
      });
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) return null;
  if (loading) return (
    <div className="container py-6 space-y-8 max-w-7xl">
      <div className="glass-card p-6 sm:p-8 flex items-center justify-between gap-6">
         <div className="space-y-4 w-full">
           <SkeletonText lines={1} className="w-[150px]" />
           <SkeletonText lines={2} className="w-[300px]" />
           <div className="h-3 mt-6 rounded-full bg-secondary/60 w-full" />
         </div>
         <div className="hidden sm:flex gap-4">
           <SkeletonCard lines={0} hasHeader={false} className="h-24 w-20" />
           <SkeletonCard lines={0} hasHeader={false} className="h-24 w-20" />
         </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SkeletonCard lines={4} hasHeader={true} />
          <SkeletonCard lines={5} hasHeader={true} className="h-64" />
        </div>
        <div className="space-y-8">
          <SkeletonCard lines={4} hasHeader={false} />
          <SkeletonCard lines={6} hasHeader={true} />
        </div>
      </div>
    </div>
  );

  const d = data!;

  return (
    <div className="container py-6 space-y-8 animate-fade-in max-w-7xl">
      {/* Hero Section */}
      <HeroSection
        user={user}
        xp={d.xp}
        level={d.level}
        streak={d.streak}
        xpToNextLevel={100}
      />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Activity + Analytics */}
        <div className="lg:col-span-2 space-y-8">
          <ProblemsPreview problems={d.problems} />
          <AnalyticsPanel
            solutionsOverTime={d.solutionsOverTime}
            categoryBreakdown={d.categoryBreakdown}
            totalSolutions={d.solutionCount}
          />
          <ActivityFeed activities={d.activities} />
        </div>

        {/* Right column: Gamification + Leaderboard */}
        <div className="space-y-8">
          <GamificationPanel
            xp={d.xp}
            level={d.level}
            solutionCount={d.solutionCount}
            streak={d.streak}
          />
          <LeaderboardPreview entries={d.leaderboard} />
        </div>
      </div>
    </div>
  );
}
