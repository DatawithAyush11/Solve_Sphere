import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  final_score: number;
  solution_count: number;
}

interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[];
}

const medals = ['🥇', '🥈', '🥉'];
const rankColors = [
  'text-accent border-accent/30 bg-accent/5',
  'text-slate-300 border-slate-400/30 bg-slate-400/5',
  'text-amber-600 border-amber-700/30 bg-amber-700/5',
];

export default function LeaderboardPreview({ entries }: LeaderboardPreviewProps) {
  const top5 = entries.slice(0, 5);

  return (
    <div className="space-y-4 animate-slide-up delay-300">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          Top Solvers
        </h2>
        <Link to="/leaderboard">
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            Full Leaderboard <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {top5.length === 0 ? (
        <div className="glass-card p-6 text-center text-muted-foreground text-sm">
          <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
          No submissions yet. Be the first on the board!
        </div>
      ) : (
        <div className="space-y-2">
          {top5.map((entry, i) => (
            <div
              key={entry.user_id}
              className={`glass-card px-4 py-3 flex items-center gap-3 hover:border-primary/30 transition-all duration-200 hover:scale-[1.01] animate-slide-up`}
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
            >
              {/* Rank */}
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg font-bold shrink-0 ${rankColors[i] || 'text-muted-foreground border-border/30 bg-secondary/30'}`}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                {entry.username.charAt(0).toUpperCase()}
              </div>

              {/* Name & stats */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{entry.username}</p>
                <p className="text-[10px] text-muted-foreground">{entry.solution_count} solution{entry.solution_count !== 1 ? 's' : ''}</p>
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <p className="font-bold text-accent text-base">{Math.round(entry.final_score)}</p>
                <p className="text-[10px] text-muted-foreground">pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
