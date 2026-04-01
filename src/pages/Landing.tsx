import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target, Sparkles, Trophy, Users, DollarSign, Globe, Lightbulb, Award, FolderOpen, ArrowRight, Zap, Shield } from 'lucide-react';
import { Logo } from '@/components/Logo';

const stats = [
  { icon: Target, value: '150+', label: 'Active Problems' },
  { icon: Sparkles, value: '2,340', label: 'Solutions Submitted' },
  { icon: Users, value: '5,600', label: 'Active Users' },
  { icon: DollarSign, value: '$50K', label: 'Total Rewards' },
];

const features = [
  { icon: Globe, title: 'Browse Real Problems', desc: 'Access real challenges from NGOs, enterprises, and government bodies around the world.' },
  { icon: Sparkles, title: 'AI-Powered Assistance', desc: 'Get real-time guidance and evaluation using our intelligent AI assistant.' },
  { icon: Trophy, title: 'Gamified Learning', desc: 'Earn XP points, unlock badges, and climb leaderboard rankings as you solve.' },
  { icon: FolderOpen, title: 'Build Your Portfolio', desc: 'Showcase your best solutions to recruiters and potential collaborators.' },
  { icon: Zap, title: 'Quiz Challenges', desc: 'Test your knowledge with technical and domain-specific quizzes across categories.' },
  { icon: Shield, title: 'Strict Evaluation', desc: 'AI scoring ensures only quality solutions rise to the top of the leaderboard.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="hover:opacity-85 transition-opacity">
            <Logo variant="full" size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">Problems</Link>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">Leaderboard</Link>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">Quiz</Link>
            <Link to="/auth">
              <Button size="sm" className="gradient-primary text-primary-foreground font-semibold">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="container relative text-center space-y-8 max-w-4xl">
          {/* Hero logo */}
          <div className="flex justify-center mb-6">
            <Logo variant="full" size="xl" animated className="justify-center" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Transform Ideas into{' '}
            <span className="text-gradient">Real-World</span>{' '}
            <span className="text-gradient-gold">Solutions</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The gamified platform for collaborative problem-solving. Earn XP, climb leaderboards, and build a portfolio while tackling real global challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary text-primary-foreground font-semibold px-8 text-base gap-2 glow-primary">
                Start Solving <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="border-primary/30 text-foreground hover:bg-primary/10 px-8 text-base">
                View Leaderboard
              </Button>
            </Link>
          </div>
          {/* Social proof */}
          <p className="text-xs text-muted-foreground">Join 5,600+ problem solvers already on the platform</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/30">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <div
              key={label}
              className="glass-card p-6 text-center group hover:border-primary/30 hover:scale-105 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="gradient-primary rounded-xl p-2.5 w-fit mx-auto mb-3">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="text-3xl font-extrabold text-gradient">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-24">
        <div className="container space-y-14">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold">Why Choose <span className="text-gradient">SolveSphere?</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to solve real problems, grow your skills, and get noticed.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="glass-card p-6 space-y-4 group hover:border-primary/30 hover:scale-[1.02] hover:glow-primary transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                <div className="gradient-primary rounded-xl p-3 w-fit group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <div className="gradient-primary rounded-2xl p-10 sm:p-14 text-center space-y-6 relative overflow-hidden glow-primary">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">Ready to Make an Impact?</h2>
              <p className="text-primary-foreground/80 mt-3 text-lg">Join thousands solving real-world problems</p>
              <Link to="/auth">
                <Button size="lg" className="mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-10 text-base gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo variant="full" size="sm" />
          <p className="text-sm text-muted-foreground">© 2026 SolveSphere. Gamified Collaborative Problem-Solving.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

