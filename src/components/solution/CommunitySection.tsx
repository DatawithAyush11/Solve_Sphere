import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SolutionEntry {
  id: string;
  content: string;
  ai_score: number | null;
  ai_feedback: string | null;
  created_at: string;
  user_id: string;
  profiles: { username: string } | null;
  avg_rating?: number;
}

interface Props {
  solutions: SolutionEntry[];
  userId?: string;
  onRefresh: () => void;
}

function getMaxRating(aiScore: number | null): number {
  const score = aiScore ?? 50;
  if (score <= 20) return 1;
  if (score <= 40) return 2;
  if (score <= 60) return 3;
  if (score <= 80) return 4;
  return 5;
}

export default function CommunitySection({ solutions, userId, onRefresh }: Props) {
  const { toast } = useToast();
  const [ratingSolutionId, setRatingSolutionId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleDelete = async (solutionId: string) => {
    if (!userId) return;
    const { error } = await supabase.from('solutions').delete().eq('id', solutionId).eq('user_id', userId);
    if (!error) {
      toast({ title: 'Solution deleted' });
      onRefresh();
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleRate = async (solutionId: string) => {
    if (!userId || ratingValue < 1) return;
    setSubmittingRating(true);
    try {
      const res = await supabase.functions.invoke('ai-solve', {
        body: { action: 'rate', solutionId, score: ratingValue, comment: comment.trim() || null },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) {
        toast({ title: 'Rating rejected', description: res.data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Rating submitted!' });
        setRatingSolutionId(null);
        setRatingValue(0);
        setComment('');
        onRefresh();
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setSubmittingRating(false);
  };

  if (solutions.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Community Solutions</h2>
      {solutions.map(sol => {
        const maxRating = getMaxRating(sol.ai_score);
        return (
          <div key={sol.id} className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{sol.profiles?.username || 'Anonymous'}</span>
              <div className="flex items-center gap-2">
                {sol.avg_rating != null && sol.avg_rating > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3 fill-accent text-accent" /> {sol.avg_rating.toFixed(1)}
                  </span>
                )}
                {sol.ai_score !== null && <Badge variant="outline" className="text-accent border-accent/30">Score: {sol.ai_score}</Badge>}
                {sol.user_id === userId && (
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(sol.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{sol.content}</p>

            {sol.user_id !== userId && userId && (
              ratingSolutionId === sol.id ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Max rating allowed: {maxRating}⭐ based on AI evaluation</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => v <= maxRating && setRatingValue(v)} disabled={v > maxRating}>
                          <Star className={`h-5 w-5 ${v <= ratingValue ? 'fill-accent text-accent' : v > maxRating ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                    </div>
                    <input type="text" placeholder="Comment (optional)" value={comment} onChange={e => setComment(e.target.value.slice(0, 500))} className="flex-1 min-w-[120px] bg-background/50 border border-border/50 rounded-md px-3 py-1.5 text-sm" />
                    <Button size="sm" onClick={() => handleRate(sol.id)} disabled={submittingRating || ratingValue < 1} className="gradient-primary text-primary-foreground">Rate</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setRatingSolutionId(null); setRatingValue(0); setComment(''); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setRatingSolutionId(sol.id)} className="gap-1">
                  <Star className="h-3 w-3" /> Rate this solution
                </Button>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
