import { useLocation, useNavigate } from 'react-router-dom';
import { QUIZ_DOMAINS, type QuizQuestion } from '@/data/quizQuestions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, RefreshCw, Home, CheckCircle, XCircle, Clock, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsState {
  score: number;
  total: number;
  answers: (number | null)[];
  questions: QuizQuestion[];
  domain: string | null;
  timeTaken: number;
}

function ScoreCircle({ score, total }: { score: number; total: number }) {
  const pct = (score / total) * 100;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct / 100);

  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  const label = pct >= 80 ? 'Excellent! 🎉' : pct >= 60 ? 'Good job! 👍' : pct >= 40 ? 'Keep Practicing 💪' : 'Needs Work 📚';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{score}/{total}</span>
          <span className="text-xs text-muted-foreground">score</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xl font-bold">{label}</div>
        <div className="text-muted-foreground text-sm">{Math.round(pct)}% accuracy</div>
      </div>
    </div>
  );
}

export default function QuizResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultsState | null;

  if (!state) {
    navigate('/quiz');
    return null;
  }

  const { score, total, answers, questions, domain, timeTaken } = state;
  const domain_ = QUIZ_DOMAINS.find(d => d.id === domain);
  const xpEarned = score * 10;
  const avgTime = Math.round(timeTaken / total);

  return (
    <div className="container py-8 max-w-3xl animate-fade-in space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
          <Trophy className="h-4 w-4" />
          Quiz Complete — {domain_?.emoji} {domain_?.label}
        </div>
        <h1 className="text-3xl font-black">Your Results</h1>
      </div>

      {/* Score + Stats */}
      <div className="rounded-2xl border border-border/50 bg-card p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreCircle score={score} total={total} />
          <div className="flex-1 grid grid-cols-3 gap-4 w-full">
            {[
              { label: 'Correct', value: score, icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'Wrong', value: total - score, icon: XCircle, color: 'text-red-400' },
              { label: 'XP Earned', value: `+${xpEarned}`, icon: Zap, color: 'text-primary' },
              { label: 'Avg Time', value: `${avgTime}s`, icon: Clock, color: 'text-amber-400' },
              { label: 'Streak Bonus', value: score >= 8 ? '🔥 x2' : '-', icon: Target, color: 'text-orange-400' },
              { label: 'Accuracy', value: `${Math.round((score / total) * 100)}%`, icon: Trophy, color: 'text-violet-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl bg-secondary/50 p-3 text-center">
                <Icon className={cn('h-4 w-4 mx-auto mb-1', color)} />
                <div className={cn('text-lg font-bold', color)}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="space-y-3">
        <h2 className="font-bold text-lg">Question Review</h2>
        {questions.map((q, i) => {
          const userAnswer = answers[i];
          const isCorrect = userAnswer === q.correct;
          const isTimedOut = userAnswer === null;

          return (
            <div key={q.id} className={cn(
              'rounded-xl border p-4 space-y-3',
              isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5',
            )}>
              <div className="flex items-start gap-3">
                {isCorrect
                  ? <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  : <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">Q{i + 1}</span>
                    <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                  </div>
                  <p className="text-sm font-medium">{q.question}</p>
                </div>
              </div>

              <div className="pl-8 space-y-1.5">
                {userAnswer !== null && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Your answer: </span>
                    <span className={isCorrect ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium line-through'}>
                      {q.options[userAnswer]}
                    </span>
                  </div>
                )}
                {isTimedOut && (
                  <div className="text-sm text-amber-400">⏰ Timed out</div>
                )}
                {!isCorrect && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Correct: </span>
                    <span className="text-emerald-400 font-medium">{q.options[q.correct]}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground italic">{q.explanation}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button id="retake-quiz-btn" onClick={() => navigate(`/quiz/mcq?domain=${domain}`)} className="flex-1 gradient-primary text-white">
          <RefreshCw className="mr-2 h-4 w-4" /> Retake Quiz
        </Button>
        <Button id="go-to-quiz-hub-btn" variant="outline" onClick={() => navigate('/quiz')} className="flex-1">
          <Home className="mr-2 h-4 w-4" /> Quiz Hub
        </Button>
      </div>
    </div>
  );
}
