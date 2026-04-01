import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Trophy, Target, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Index() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ solutions: 0, problems: 0, score: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { count: solCount } = await supabase.from('solutions').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const { data: sols } = await supabase.from('solutions').select('ai_score').eq('user_id', user.id);
      const { count: probCount } = await supabase.from('problems').select('*', { count: 'exact', head: true });
      const totalScore = sols?.reduce((sum, s) => sum + (s.ai_score || 0), 0) || 0;
      setStats({ solutions: solCount || 0, problems: probCount || 0, score: totalScore });
    };
    load();
  }, [user]);

  const cards = [
    { icon: Target, label: 'Problems Available', value: stats.problems, color: 'text-primary', link: '/problems' },
    { icon: Sparkles, label: 'Your Solutions', value: stats.solutions, color: 'text-accent', link: '/portfolio' },
    { icon: Trophy, label: 'Total Score', value: stats.score, color: 'text-[hsl(var(--warning))]', link: '/leaderboard' },
  ];

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, <span className="text-gradient">{user?.user_metadata?.username || 'Solver'}</span></h1>
        <p className="text-muted-foreground">Ready to solve the world's problems?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ icon: Icon, label, value, color, link }) => (
          <Link key={label} to={link} className="glass-card p-6 hover:border-primary/30 transition-colors group">
            <div className="flex items-center gap-3">
              <Icon className={`h-8 w-8 ${color} group-hover:scale-110 transition-transform`} />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="glass-card p-8 text-center space-y-4 glow-primary">
        <Brain className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-xl font-bold">Start Solving</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Browse real-world problems, craft solutions with AI assistance, and climb the leaderboard.</p>
        <Link to="/problems">
          <Button className="gradient-primary text-primary-foreground font-semibold px-8">
            Browse Problems
          </Button>
        </Link>
      </div>
    </div>
  );
}
