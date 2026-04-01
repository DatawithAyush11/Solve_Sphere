import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, MapPin } from 'lucide-react';

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

interface ProblemsPreviewProps {
  problems: Problem[];
}

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'badge-easy' },
  medium: { label: 'Medium', className: 'badge-medium' },
  hard: { label: 'Hard', className: 'badge-hard' },
};

export default function ProblemsPreview({ problems }: ProblemsPreviewProps) {
  const preview = problems.slice(0, 6);

  return (
    <div className="space-y-4 animate-slide-up delay-200">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🔥 Featured Problems</h2>
        <Link to="/problems">
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {/* Horizontal scrollable cards */}
      <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-2 -mx-1 px-1">
        {preview.map((problem, i) => {
          const diff = difficultyConfig[problem.difficulty] || difficultyConfig.medium;
          const xpReward = problem.xp_reward || (problem.difficulty === 'easy' ? 10 : problem.difficulty === 'hard' ? 50 : 25);
          return (
            <div
              key={problem.id}
              className="flex-none w-64 glass-card p-4 flex flex-col gap-3 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diff.className}`}>
                  {diff.label}
                </span>
                <span className="text-[10px] text-accent font-bold bg-accent/10 px-2 py-0.5 rounded-full">
                  +{xpReward} XP
                </span>
              </div>

              <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {problem.title}
              </h3>

              <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{problem.description}</p>

              {problem.tags && problem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {problem.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] bg-secondary/60 text-secondary-foreground px-1.5 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-border/30">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {problem.category === 'global'
                    ? <Globe className="h-3 w-3" />
                    : <MapPin className="h-3 w-3" />}
                  {problem.category}
                </span>
                <Link to={`/problems/${problem.id}`}>
                  <Button size="sm" className="h-6 text-[10px] gradient-primary text-primary-foreground gap-1">
                    Solve <ArrowRight className="h-2.5 w-2.5" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
