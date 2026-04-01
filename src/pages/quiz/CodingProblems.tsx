import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { codingProblems, type CodingProblem } from '@/data/codingProblems';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code2, ChevronRight, Search, Filter, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const DIFFICULTY_COLORS = {
  easy: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  medium: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  hard: 'text-red-400 border-red-500/30 bg-red-500/10',
};

const DIFFICULTY_BADGE = {
  easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function CodingProblems() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', ...new Set(codingProblems.map(p => p.category))];

  const filtered = codingProblems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.includes(search.toLowerCase()));
    const matchDiff = filterDifficulty === 'all' || p.difficulty === filterDifficulty;
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchDiff && matchCat;
  });

  const counts = {
    easy: codingProblems.filter(p => p.difficulty === 'easy').length,
    medium: codingProblems.filter(p => p.difficulty === 'medium').length,
    hard: codingProblems.filter(p => p.difficulty === 'hard').length,
  };

  return (
    <div className="container py-8 max-w-5xl animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button id="back-to-quiz-btn" onClick={() => navigate('/quiz')} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Code2 className="h-6 w-6 text-violet-400" />
            Coding Problems
          </h1>
          <p className="text-muted-foreground text-sm">Solve algorithmic challenges in your favorite language</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {(['easy', 'medium', 'hard'] as const).map(diff => (
          <button
            key={diff}
            id={`filter-diff-${diff}`}
            onClick={() => setFilterDifficulty(filterDifficulty === diff ? 'all' : diff)}
            className={cn(
              'rounded-xl border p-3 text-center transition-all hover:-translate-y-0.5',
              filterDifficulty === diff ? DIFFICULTY_COLORS[diff] : 'border-border/50 bg-card hover:border-border',
            )}
          >
            <div className={cn('text-xl font-black', filterDifficulty !== diff && 'text-foreground')}>
              {counts[diff]}
            </div>
            <div className="text-xs capitalize text-muted-foreground">{diff}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="problem-search"
            type="text"
            placeholder="Search problems or tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50 focus:bg-background transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            id="category-filter"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="rounded-xl bg-secondary/50 border border-border/50 px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none pr-8"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Problem List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Code2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No problems match your filters.</p>
          </div>
        )}
        {filtered.map((problem, index) => (
          <ProblemRow key={problem.id} problem={problem} index={index} onSelect={() => navigate(`/quiz/coding/${problem.id}`)} />
        ))}
      </div>
    </div>
  );
}

function ProblemRow({ problem, index, onSelect }: { problem: CodingProblem; index: number; onSelect: () => void }) {
  return (
    <div
      id={`problem-row-${problem.id}`}
      onClick={onSelect}
      className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/5 hover:shadow-lg transition-all duration-200 animate-slide-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="text-muted-foreground text-sm font-mono w-8 text-center">{String(index + 1).padStart(2, '0')}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm group-hover:text-violet-400 transition-colors">{problem.title}</span>
          <Badge className={cn('text-xs', DIFFICULTY_BADGE[problem.difficulty])}>
            {problem.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground">{problem.category}</span>
          <span className="text-muted-foreground/30">·</span>
          {problem.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs text-muted-foreground/70 bg-secondary/50 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1">
          {['JS', 'PY', 'Java'].map(lang => (
            <span key={lang} className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">{lang}</span>
          ))}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}
