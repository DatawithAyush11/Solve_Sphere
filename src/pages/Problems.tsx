import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Globe, MapPin, Search, ArrowRight } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  description: string;
  category: 'local' | 'global';
  difficulty: string;
  tags: string[];
  organization: string;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] border-[hsl(var(--success))]/30',
  medium: 'bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30',
  hard: 'bg-[hsl(var(--destructive))]/20 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30',
};

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'local' | 'global'>('all');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('problems').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setProblems((data as any[])?.map(p => ({ ...p, tags: p.tags || [], organization: p.organization || '' })) || []);
      setLoading(false);
    });
  }, []);

  const filtered = problems.filter(p => {
    if (filter !== 'all' && p.category !== filter) return false;
    if (difficulty !== 'all' && p.difficulty !== difficulty) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)) || p.organization.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Explore <span className="text-gradient">Problems</span></h1>
        <p className="text-muted-foreground mt-1">Browse real-world challenges from NGOs, enterprises, and government bodies</p>
      </div>

      {/* Search + Filters */}
      <div className="glass-card p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems, tags, or providers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-background/50 border-border/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Category tabs */}
          {(['all', 'local', 'global'] as const).map(f => (
            <Button key={f} variant={filter === f ? 'default' : 'secondary'} size="sm" onClick={() => setFilter(f)}
              className={filter === f ? 'gradient-primary text-primary-foreground' : ''}>
              {f === 'local' && <MapPin className="h-3 w-3 mr-1" />}
              {f === 'global' && <Globe className="h-3 w-3 mr-1" />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
          <div className="w-px bg-border/50 mx-1 hidden sm:block" />
          {/* Difficulty */}
          {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
            <Button key={d} variant={difficulty === d ? 'default' : 'secondary'} size="sm" onClick={() => setDifficulty(d)}
              className={difficulty === d ? 'gradient-primary text-primary-foreground' : ''}>
              {d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-muted-foreground">{filtered.length} problem{filtered.length !== 1 ? 's' : ''} found</p>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">No problems match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(problem => (
            <div key={problem.id} className="glass-card p-5 flex flex-col gap-3 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
              {/* Top badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={problem.category === 'global' ? 'default' : 'secondary'}
                  className={problem.category === 'global' ? 'gradient-primary text-primary-foreground' : ''}>
                  {problem.category === 'global' ? <Globe className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                  {problem.category}
                </Badge>
                {problem.difficulty && (
                  <Badge variant="outline" className={`text-xs ${difficultyColors[problem.difficulty] || ''}`}>
                    {problem.difficulty}
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1.5">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{problem.title}</h3>
                {problem.organization && <p className="text-xs text-muted-foreground">{problem.organization}</p>}
                <p className="text-sm text-muted-foreground line-clamp-2">{problem.description}</p>
              </div>

              {/* Tags */}
              {problem.tags && problem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {problem.tags.map(tag => (
                    <span key={tag} className="text-xs bg-secondary/60 text-secondary-foreground px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span className="text-xs text-muted-foreground">{Math.floor(Math.random() * 60 + 5)} submissions</span>
                <Link to={`/problems/${problem.id}`}>
                  <Button size="sm" className="gradient-primary text-primary-foreground gap-1">
                    Create Solution <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
