import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target, Sparkles, Trophy, Users, DollarSign, Globe, FolderOpen, ArrowRight, Zap, Shield, Code, BrainCircuit, HeartHandshake } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Counter component for animated stats
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
}

const stats = [
  { icon: Target, value: 500, suffix: '+', label: 'Active Problems' },
  { icon: Sparkles, value: 12000, suffix: '+', label: 'Solutions Submitted' },
  { icon: Users, value: 25000, suffix: '+', label: 'Tech Innovators' },
  { icon: DollarSign, value: 1.2, suffix: 'M+', label: 'In Grants & Bounties' },
];

const features = [
  { icon: Globe, title: 'Global Challenges', desc: 'Sourced directly from NGOs, UN agencies, and leading tech startups.', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { icon: BrainCircuit, title: 'AI-Powered Evaluation', desc: 'Our proprietary engine grades your code and documentation in seconds.', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Trophy, title: 'Gamified Progression', desc: 'Earn reputation, climb leaderboards, and unlock exclusive opportunities.', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { icon: FolderOpen, title: 'Verified Portfolio', desc: 'Build a public portfolio of real impact that recruiters actually care about.', color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { icon: Code, title: 'Integrated Editor', desc: 'Write, run, and test code right in your browser. Seamless experience.', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { icon: Shield, title: 'Strict Quality Control', desc: 'Only high-quality solutions survive. Build skills that match enterprise standards.', color: 'text-rose-400', bg: 'bg-rose-400/10' },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[30%] right-[-10%] w-[35%] h-[50%] bg-violet-600/15 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Navbar */}
      <nav className={cn("fixed top-0 inset-x-0 z-50 transition-all duration-300", scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 py-3 shadow-sm" : "bg-transparent py-5")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="hover:opacity-85 transition-opacity">
            <Logo variant="full" size="sm" />
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground hidden sm:block transition-colors">Platform</a>
            <a href="#community" className="text-muted-foreground hover:text-foreground hidden sm:block transition-colors">Community</a>
            <Link to="/auth">
              <Button size="sm" className="gradient-primary text-primary-foreground font-semibold px-5 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                Start Solving
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 sm:pt-48 sm:pb-32 px-4 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>The Next-Gen Platform for Builders</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-6 max-w-5xl mx-auto animate-slide-up delay-100">
          Transform Code Into <br className="hidden sm:block"/>
          <span className="text-gradient-hero">Real-World Impact</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up delay-200">
          Stop building throwaway side projects. Solve critical challenges for NGOs and startups, level up your engineering skills, and build a verified portfolio that gets you hired.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up delay-300">
          <Link to="/auth">
            <Button size="lg" className="h-14 px-8 rounded-full gradient-primary text-black font-bold text-lg hover:scale-105 transition-transform glow-primary">
              Join the Network <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-border bg-card/50 backdrop-blur text-foreground font-semibold text-lg hover:bg-secondary transition-colors">
              Explore Problems
            </Button>
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-border/40 w-full max-w-3xl animate-fade-in delay-500">
          <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">Trusted by problem solvers scaling impact</p>
          <div className="flex justify-center gap-8 sm:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap">
             {/* Mock sponsor logos text */}
             <span className="text-xl font-black font-serif italic tracking-tighter">Oxfam</span>
             <span className="text-xl font-bold tracking-tight">OpenAI</span>
             <span className="text-xl font-black font-mono">UNICEF</span>
             <span className="text-xl font-bold tracking-widest uppercase">Techstars</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative z-10 border-y border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, suffix, label }, i) => (
            <div key={label} className="flex flex-col items-center text-center space-y-3 group">
              <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300 group-hover:bg-primary/10">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                  <AnimatedCounter end={value} suffix={suffix} />
                </h3>
                <p className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 sm:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Everything you need to <span className="text-gradient">stand out.</span></h2>
            <p className="text-lg text-muted-foreground">The only platform that combines rigorous engineering problems with verified real-world impact and automated feedback.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="glass-card p-8 group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:border-border cursor-default hover:bg-card">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300", f.bg, f.color)}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infinite Marquee Section */}
      <section id="community" className="py-20 relative z-10 overflow-hidden bg-primary/5 border-y border-primary/10">
        <div className="flex w-fit animate-marquee gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 bg-card px-6 py-4 rounded-full border border-border/50 shrink-0 whitespace-nowrap shadow-sm">
              <HeartHandshake className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm">
                <span className="text-primary font-bold">@alex_dev</span> solved "Water Quality Data Pipeline" for <span className="text-muted-foreground">CleanWater NGO</span>
              </span>
            </div>
          ))}
        </div>
        <div className="flex w-fit animate-marquee gap-6 mt-6" style={{ animationDirection: 'reverse' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 bg-card px-6 py-4 rounded-full border border-border/50 shrink-0 whitespace-nowrap shadow-sm">
               <Trophy className="h-5 w-5 text-amber-400" />
               <span className="font-medium text-sm">
                 <span className="text-amber-400 font-bold">@sarah_codes</span> earned the "Top Innovator" badge
               </span>
            </div>
          ))}
        </div>
        {/* Gradients to mask edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
      </section>

      {/* Bottom CTA */}
      <section className="py-32 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="card-premium p-12 text-center rounded-3xl relative overflow-hidden glow-primary-strong">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">Stop practicing.<br/>Start solving.</h2>
              <p className="text-lg text-white/70">Join the community of developers building the future while advancing their careers.</p>
              <div className="pt-4">
                <Link to="/auth">
                  <Button size="lg" className="h-14 px-10 rounded-full bg-white text-black font-bold hover:bg-white/90 transition-colors text-lg">
                    Create Free Account
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-white/40 mt-4">Takes less than 30 seconds. No credit card required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 relative z-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-70">
            <Logo variant="icon" size="sm" />
            <span className="font-bold tracking-tight text-lg">SolveSphere</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SolveSphere Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Platform</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
