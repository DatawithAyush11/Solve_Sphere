import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Globe, MapPin, ArrowRight, CheckCircle2, SlidersHorizontal, PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

interface Problem {
  id: string;
  title: string;
  description: string;
  category: 'local' | 'global';
  difficulty: string;
  tags: string[];
  organization?: string;
  xp_reward?: number;
}

export default function Problems() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'local' | 'global'>('all');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: probData } = await supabase.from('problems').select('*').order('created_at', { ascending: false });
      
      let solved = new Set<string>();
      if (user) {
        const { data: solData } = await supabase.from('solutions').select('problem_id').eq('user_id', user.id);
        if (solData) {
          solved = new Set(solData.map(s => s.problem_id));
        }
      }

      setProblems((probData as any[])?.map(p => ({ ...p, tags: p.tags || [], organization: p.organization || '' })) || []);
      setSolvedIds(solved);
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = useMemo(() => {
    return problems.filter(p => {
      if (filter !== 'all' && p.category !== filter) return false;
      if (difficulty !== 'all' && p.difficulty !== difficulty) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        return p.title.toLowerCase().includes(q) || 
               p.description.toLowerCase().includes(q) || 
               p.tags.some(t => t.toLowerCase().includes(q)) || 
               (p.organization && p.organization.toLowerCase().includes(q));
      }
      return true;
    });
  }, [problems, filter, difficulty, debouncedSearch]);

  const getDifficultyStyles = (diff: string) => {
    switch(diff) {
      case 'easy': return { bar: 'diff-bar-easy', badge: 'badge-easy', label: 'Easy', xp: 10 };
      case 'hard': return { bar: 'diff-bar-hard', badge: 'badge-hard', label: 'Hard', xp: 50 };
      default: return { bar: 'diff-bar-medium', badge: 'badge-medium', label: 'Medium', xp: 25 };
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <PageHeader 
        title="Explore Problems" 
        description="Browse real-world challenges from NGOs, enterprises, and government bodies"
        icon={<Globe className="h-8 w-8" />}
      />

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 space-y-4 shadow-sm border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, tags, or organization..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 bg-background/50 focus-visible:ring-primary rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl shrink-0">
              {(['all', 'local', 'global'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize whitespace-nowrap flex items-center gap-1.5",
                    filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === 'local' && <MapPin className="h-3.5 w-3.5" />}
                  {f === 'global' && <Globe className="h-3.5 w-3.5" />}
                  {f}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl shrink-0">
              <div className="pl-2 pr-1 text-muted-foreground"><SlidersHorizontal className="h-4 w-4" /></div>
              {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize whitespace-nowrap",
                    difficulty === d ? d === 'all' ? "bg-card text-foreground shadow-sm" : `bg-card shadow-sm ${getDifficultyStyles(d).badge.split(' ')[1]}` : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      {!loading && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-medium text-muted-foreground">
            Showing {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
          </p>
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
             <SkeletonCard key={i} lines={3} hasHeader={true} hasFooter={true} className="h-56" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          icon={<PackageOpen className="h-8 w-8" />}
          title="No problems found"
          description="We couldn't find any challenges matching your current search and filters. Try adjusting your criteria."
          action={<Button variant="outline" onClick={() => { setSearch(''); setFilter('all'); setDifficulty('all'); }}>Clear Filters</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((problem, i) => {
            const styles = getDifficultyStyles(problem.difficulty);
            const isSolved = solvedIds.has(problem.id);
            const xpReward = problem.xp_reward || styles.xp;

            return (
              <div 
                key={problem.id} 
                className={cn(
                  "glass-card hover-lift group flex flex-col relative overflow-hidden",
                  styles.bar,
                  isSolved && "opacity-80"
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Solved Overlay/Badge */}
                {isSolved && (
                  <div className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-400 p-1.5 rounded-full backdrop-blur-sm shadow-sm z-10" title="You solved this problem">
                    <CheckCircle2 className="h-5 w-5 fill-emerald-500/20" />
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2 flex-wrap pr-8">
                    <Badge variant={problem.category === 'global' ? 'default' : 'secondary'} 
                      className={cn("text-xs font-semibold", problem.category === 'global' && 'gradient-primary text-primary-foreground')}>
                      {problem.category === 'global' ? <Globe className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                      {problem.category}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs font-semibold", styles.badge)}>
                      {styles.label}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                       <Link to={`/problems/${problem.id}`} className="absolute inset-0 z-0"></Link>
                       {problem.title}
                    </h3>
                    {problem.organization && <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{problem.organization}</p>}
                    <p className="text-sm text-foreground/80 line-clamp-3 relative z-10 pointer-events-none mt-2">{problem.description}</p>
                  </div>

                  {problem.tags && problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 relative z-10 pointer-events-none mt-2">
                      {problem.tags.slice(0,3).map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-bold tracking-wider bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                      {problem.tags.length > 3 && <span className="text-[10px] text-muted-foreground font-medium px-1">+{problem.tags.length - 3}</span>}
                    </div>
                  )}
                </div>

                <div className="bg-secondary/20 p-4 border-t border-border/50 flex items-center justify-between relative z-10">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <span className="bg-primary/20 p-1 rounded"><MapPin className="h-3 w-3" /></span> +{xpReward} XP
                  </span>
                  <Link to={`/problems/${problem.id}`}>
                    <Button size="sm" className="group/btn h-auto rounded-full px-5 py-2.5 text-xs font-semibold gap-1.5 shadow-md hover:shadow-lg hover:scale-105 transition-all bg-gradient-to-r from-teal-400 to-cyan-500 text-white hover:brightness-110 border-0">
                      {isSolved ? "View Solution" : "Create Solution"} <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
