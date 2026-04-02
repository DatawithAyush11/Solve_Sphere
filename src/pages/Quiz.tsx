import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { QUIZ_DOMAINS } from '@/data/quizQuestions';
import { codingProblems } from '@/data/codingProblems';
import {
  Brain, Code2, ArrowRight, Zap, Trophy, Clock,
  BookOpen, Sparkles, ChevronRight, Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Quiz() {
  const navigate = useNavigate();
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  const easyCount = codingProblems.filter(p => p.difficulty === 'easy').length;
  const mediumCount = codingProblems.filter(p => p.difficulty === 'medium').length;
  const hardCount = codingProblems.filter(p => p.difficulty === 'hard').length;

  return (
    <div className="container py-8 space-y-12 max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Quiz Arena
        </div>
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent leading-tight">
          Test Your Knowledge
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Challenge yourself with MCQ quizzes across 8 domains or sharpen your coding skills with algorithmic problems.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MCQ Quiz Card */}
        <div className="group relative glass-card card-premium overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
          onClick={() => navigate('/quiz/mcq')}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Brain className="h-7 w-7 text-primary" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Non-Technical</Badge>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Knowledge Quiz</h2>
              <p className="text-muted-foreground">
                Test your understanding across General Knowledge, Science, Environment, India, AI, Economics, Social Issues, and Health.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Domains', value: '8', icon: BookOpen },
                { label: 'Questions', value: '120+', icon: Target },
                { label: 'Time', value: '10 min', icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl bg-secondary/50 p-3 text-center">
                  <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            <Button className="w-full gradient-primary text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
              Choose Domain <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Coding Problems Card */}
        <div className="group relative glass-card card-premium overflow-hidden cursor-pointer hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1"
          onClick={() => navigate('/quiz/coding')}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div className="h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Code2 className="h-7 w-7 text-violet-400" />
              </div>
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">Technical</Badge>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Coding Problems</h2>
              <p className="text-muted-foreground">
                Solve algorithmic challenges in JavaScript, Python, or Java. LeetCode-style with an in-browser code editor.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Easy', value: String(easyCount), color: 'text-emerald-400' },
                { label: 'Medium', value: String(mediumCount), color: 'text-amber-400' },
                { label: 'Hard', value: String(hardCount), color: 'text-red-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl bg-secondary/50 p-3 text-center">
                  <div className={`text-lg font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white group-hover:shadow-lg group-hover:shadow-violet-500/30 transition-all">
              Browse Problems <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Domain Quick-Select */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Quick Start — Pick a Domain</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUIZ_DOMAINS.map(domain => (
            <button
              key={domain.id}
              id={`domain-btn-${domain.id}`}
              onMouseEnter={() => setHoveredDomain(domain.id)}
              onMouseLeave={() => setHoveredDomain(null)}
              onClick={() => navigate(`/quiz/mcq?domain=${domain.id}`)}
              className="group relative glass-card p-4 text-left hover:border-primary/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{domain.emoji}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-sm font-semibold leading-tight">{domain.label}</div>
              <div className="text-xs text-muted-foreground mt-1">10 questions</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats banner */}
      <div className="glass-card bg-gradient-to-r from-primary/5 via-violet-500/5 to-fuchsia-500/5 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Total Questions', value: '120+', icon: '📝' },
            { label: 'Coding Problems', value: `${codingProblems.length}`, icon: '💻' },
            { label: 'Knowledge Domains', value: '8', icon: '🌐' },
            { label: 'XP per Correct Answer', value: '+10 XP', icon: '⚡' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="space-y-1">
              <div className="text-2xl">{icon}</div>
              <div className="text-2xl font-black text-primary">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
