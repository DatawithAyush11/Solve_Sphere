import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRandomQuestions, QUIZ_DOMAINS, type QuizQuestion } from '@/data/quizQuestions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronRight, X, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const QUESTIONS_PER_QUIZ = 10;
const TIME_PER_QUESTION = 30; // seconds

export default function MCQQuiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const domainParam = searchParams.get('domain');

  // Domain selection state
  const [selectedDomain, setSelectedDomain] = useState<string | null>(domainParam);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [timerActive, setTimerActive] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);

  const startQuiz = useCallback((domain: string) => {
    const qs = getRandomQuestions(domain, QUESTIONS_PER_QUIZ);
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setCurrentIndex(0);
    setSelectedOption(null);
    setRevealed(false);
    setTimeLeft(TIME_PER_QUESTION);
    setTimerActive(true);
    setQuizStarted(true);
    setTimeTaken(0);
    setTotalTimeElapsed(0);
  }, []);

  // Auto-start if domain in URL
  useEffect(() => {
    if (domainParam) {
      setSelectedDomain(domainParam);
      startQuiz(domainParam);
    }
  }, [domainParam, startQuiz]);

  // Timer
  useEffect(() => {
    if (!timerActive || revealed) return;
    if (timeLeft <= 0) {
      handleReveal();
      return;
    }
    const id = setTimeout(() => {
      setTimeLeft(t => t - 1);
      setTotalTimeElapsed(t => t + 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [timerActive, timeLeft, revealed]);

  const handleReveal = () => {
    setRevealed(true);
    setTimerActive(false);
    setTimeTaken(TIME_PER_QUESTION - timeLeft);
    // Record answer (null if timed out)
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = selectedOption;
      return next;
    });
  };

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelectedOption(idx);
  };

  const handleNext = () => {
    const isLast = currentIndex === questions.length - 1;
    if (isLast) {
      // Navigate to results
      const score = answers.filter((a, i) => a === questions[i]?.correct).length;
      navigate('/quiz/results', {
        state: {
          score,
          total: questions.length,
          answers,
          questions,
          domain: selectedDomain,
          timeTaken: totalTimeElapsed + (TIME_PER_QUESTION - timeLeft),
        },
      });
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelectedOption(null);
    setRevealed(false);
    setTimeLeft(TIME_PER_QUESTION);
    setTimerActive(true);
  };

  const domain = QUIZ_DOMAINS.find(d => d.id === selectedDomain);

  // ── Domain Selection Screen ──
  if (!quizStarted) {
    return (
      <div className="container py-12 max-w-4xl animate-fade-in">
        <button onClick={() => navigate('/quiz')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <X className="h-4 w-4" /> Back to Quiz Hub
        </button>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-2">Choose Your Domain</h1>
          <p className="text-muted-foreground">Pick a knowledge area to be tested on. You'll get {QUESTIONS_PER_QUIZ} questions with 30 seconds each.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUIZ_DOMAINS.map(d => (
            <button
              key={d.id}
              id={`domain-select-${d.id}`}
              onClick={() => { setSelectedDomain(d.id); startQuiz(d.id); }}
              className="group rounded-2xl border border-border/50 bg-card p-6 text-center hover:border-primary/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
            >
              <div className="text-4xl mb-3">{d.emoji}</div>
              <div className="font-semibold text-sm leading-tight">{d.label}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  if (!current) return null;

  const progress = ((currentIndex) / questions.length) * 100;
  const timePercent = (timeLeft / TIME_PER_QUESTION) * 100;
  const isCorrect = revealed && selectedOption === current.correct;
  const isWrong = revealed && selectedOption !== null && selectedOption !== current.correct;
  const isTimedOut = revealed && selectedOption === null;

  return (
    <div className="container py-8 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{domain?.emoji}</span>
          <div>
            <div className="font-semibold text-sm">{domain?.label}</div>
            <div className="text-xs text-muted-foreground">Question {currentIndex + 1} of {questions.length}</div>
          </div>
        </div>
        <button onClick={() => navigate('/quiz')} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2 mb-4" />

      {/* Timer */}
      <div className="flex items-center gap-3 mb-6">
        <Clock className={cn('h-4 w-4', timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-muted-foreground')} />
        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-1000', timeLeft > 15 ? 'bg-emerald-500' : timeLeft > 8 ? 'bg-amber-500' : 'bg-red-500')}
            style={{ width: `${timePercent}%` }}
          />
        </div>
        <span className={cn('text-sm font-mono font-bold w-8', timeLeft <= 10 && 'text-red-400')}>{timeLeft}s</span>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 md:p-8 space-y-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-3 text-xs">
              {current.difficulty.charAt(0).toUpperCase() + current.difficulty.slice(1)}
            </Badge>
            <h2 className="text-lg md:text-xl font-semibold leading-relaxed">{current.question}</h2>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {current.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === current.correct;
            let variant = 'default';
            if (revealed) {
              if (isCorrectOption) variant = 'correct';
              else if (isSelected && !isCorrectOption) variant = 'wrong';
            } else if (isSelected) variant = 'selected';

            return (
              <button
                key={idx}
                id={`option-${idx}`}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                className={cn(
                  'w-full text-left rounded-xl border p-4 transition-all duration-200 flex items-center gap-3',
                  variant === 'default' && 'border-border/50 bg-secondary/30 hover:border-primary/40 hover:bg-primary/5',
                  variant === 'selected' && 'border-primary bg-primary/10 text-primary',
                  variant === 'correct' && 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
                  variant === 'wrong' && 'border-red-500 bg-red-500/10 text-red-400',
                  revealed && variant === 'default' && 'opacity-50 cursor-default',
                )}
              >
                <div className={cn(
                  'h-7 w-7 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold',
                  variant === 'correct' && 'border-emerald-500 bg-emerald-500 text-white',
                  variant === 'wrong' && 'border-red-500 bg-red-500 text-white',
                  variant === 'selected' && 'border-primary bg-primary text-white',
                  variant === 'default' && 'border-border',
                )}>
                  {revealed && isCorrectOption ? <CheckCircle className="h-4 w-4" /> :
                    revealed && isSelected && !isCorrectOption ? <XCircle className="h-4 w-4" /> :
                    String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {revealed && (
          <div className={cn(
            'rounded-xl p-4 border flex gap-3 animate-slide-up',
            isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5',
          )}>
            <Lightbulb className={cn('h-5 w-5 flex-shrink-0 mt-0.5', isCorrect ? 'text-emerald-400' : 'text-amber-400')} />
            <div className="space-y-1">
              <div className={cn('font-semibold text-sm', isCorrect ? 'text-emerald-400' : isWrong ? 'text-red-400' : 'text-amber-400')}>
                {isCorrect ? '✅ Correct!' : isTimedOut ? '⏰ Time\'s up!' : '❌ Incorrect'}
              </div>
              <p className="text-sm text-muted-foreground">{current.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!revealed ? (
        <Button
          id="submit-answer-btn"
          onClick={handleReveal}
          disabled={selectedOption === null}
          className="w-full gradient-primary text-white h-12"
        >
          Submit Answer
        </Button>
      ) : (
        <Button id="next-question-btn" onClick={handleNext} className="w-full gradient-primary text-white h-12">
          {currentIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
