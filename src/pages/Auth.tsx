import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';
import { Eye, EyeOff, Loader2, Mail, AlertCircle, CheckCircle, RefreshCw, Target, Shield, Zap } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Auth() {
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (!password) return score;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-rose-500', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500', 'bg-primary'];

  useEffect(() => {
    setEmail('');
    setPassword('');
    setUsername('');
    setEmailError('');
    setShowPassword(false);
  }, [mode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError(val && !validateEmail(val) ? 'Please enter a valid email address' : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (mode === 'signup') {
      if (!username) {
        toast({ title: 'Username required', description: 'Please choose a username.', variant: 'destructive' });
        return;
      }
      if (password.length < 6) {
        toast({ title: 'Password too short', description: 'Password must be at least 6 characters.', variant: 'destructive' });
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: 'Sign in failed', description: error, variant: 'destructive' });
        }
      } else {
        const { error } = await signUp(email, password, username);
        if (error) {
          toast({ title: 'Sign up failed', description: error, variant: 'destructive' });
        } else {
          setEmailSent(true);
          setSentEmail(email);
          toast({ title: 'Account created!', description: 'Check your email to verify your account.' });
        }
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── EMAIL SENT STATE ───
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Confetti particles bg via css mesh */}
        <div className="absolute inset-0 gradient-mesh opacity-50 z-0"></div>
        <div className="w-full max-w-md text-center space-y-6 relative z-10 animate-fade-in">
          <div className="flex justify-center mb-4 cursor-pointer" onClick={() => window.location.href = '/'}>
            <Logo variant="full" size="lg" animated />
          </div>
          <div className="rounded-2xl card-premium p-8 space-y-5 animate-slide-up hover-glow">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto relative group">
              <CheckCircle className="h-10 w-10 text-emerald-400 z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-slow"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                Check your email!
              </h2>
              <p className="text-muted-foreground mt-2">
                We sent a verification link to <br />
                <span className="text-foreground font-semibold">{sentEmail}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3 text-sm text-muted-foreground text-left border border-border/50">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <span>Click the link to activate your account. Check spam if you don't see it.</span>
            </div>
            <div className="space-y-3 pt-4">
              <Button
                variant="outline"
                className="w-full gap-2 border-primary/30 hover:bg-primary/10 transition-colors h-11 pointer-events-auto relative z-20 cursor-pointer"
                onClick={() => { setEmailSent(false); setMode('signin'); }}
              >
                Back to Sign In
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-muted-foreground hover:text-primary transition-colors pointer-events-auto relative z-20 cursor-pointer"
                onClick={async () => {
                  const { error } = await signUp(sentEmail, password, username);
                  if (!error) toast({ title: 'Email resent!', description: 'Check your inbox again.' });
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Resend email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN AUTH LAYOUT ───
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel: Hero/Brand area (hidden on smaller screens) */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-secondary items-center justify-center">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background opacity-80" />
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 w-full max-w-lg p-12 space-y-10">
          <div className="animate-fade-in delay-100 cursor-pointer" onClick={() => window.location.href = '/'}>
            <Logo variant="full" size="xl" />
          </div>
          <div className="space-y-4 animate-slide-up delay-200">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              A smarter way to build <br />
              <span className="text-gradient">Real Solutions</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join thousands of developers turning their skills into impactful real-world projects. Level up, earn verifiable XP, and build an exceptional portfolio.
            </p>
          </div>

          <div className="grid gap-4 animate-slide-up delay-300">
            {[
              { icon: Target, title: 'Real World Problems', desc: 'Sourced from top NGOs and startups' },
              { icon: Shield, title: 'AI Evaluated', desc: 'Get rigorous, immediate feedback' },
              { icon: Zap, title: 'Gamified Growth', desc: 'Climb leaderboards as you improve' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-sm">
                <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Form area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto w-full lg:max-w-[600px] border-l border-border/50 bg-background">
        <div className="w-full max-w-sm space-y-8 animate-fade-in relative z-10">
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex justify-center mb-8 cursor-pointer" onClick={() => window.location.href = '/'}>
            <Logo variant="full" size="lg" />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'signin'
                ? 'Enter your credentials to access your dashboard'
                : 'Join the premier problem solving platform today'}
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 shadow-md">
            {/* Tabs */}
            <div className="flex p-1 rounded-lg bg-secondary mb-6 border border-border/50">
              {(['signin', 'signup'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                    mode === m
                      ? "bg-card text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form
              key={mode}
              onSubmit={handleSubmit}
              autoComplete="on"
              className="space-y-4 animate-scale-in"
            >
              <input type="text" name="fakeusername" tabIndex={-1} aria-hidden="true" className="absolute opacity-0 h-0 w-0 pointer-events-none" autoComplete="username" />

              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-username" className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Username</Label>
                  <Input
                    id="auth-username"
                    name="username"
                    type="text"
                    placeholder="e.g. CodeNinja"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoComplete="username"
                    className="focus-visible:ring-primary h-10"
                    disabled={submitting}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auth-email" className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Email</Label>
                  {emailError && (
                    <span className="text-[10px] text-destructive flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> Invalid email
                    </span>
                  )}
                </div>
                <Input
                  id="auth-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                  className={cn("h-10 transition-colors", emailError ? "input-error" : "focus-visible:ring-primary", email && !emailError && validateEmail(email) ? "input-success" : "")}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auth-password" className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Password</Label>
                  {mode === 'signin' && (
                    <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className="h-10 pr-10 focus-visible:ring-primary"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength meter */}
                {mode === 'signup' && password.length > 0 && (
                  <div className="pt-2 pb-1 space-y-1.5 animate-fade-in">
                    <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 transition-all duration-300",
                            i < strength ? strengthColors[strength] : "bg-secondary"
                          )}
                        />
                      ))}
                    </div>
                    <p className={cn("text-[10px] uppercase font-bold tracking-wide", strength > 3 ? "text-emerald-400" : "text-muted-foreground")}>
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  id="auth-submit-btn"
                  type="submit"
                  className="w-full text-white h-11 font-semibold group relative overflow-hidden transition-all duration-300"
                  disabled={submitting}
                  style={{
                    background: submitting
                      ? "hsl(var(--primary) / 0.5)"
                      : mode === 'signin' ? "linear-gradient(135deg, hsl(174, 84%, 48%), hsl(195, 85%, 44%))" : "linear-gradient(135deg, hsl(270, 80%, 65%), hsl(290, 80%, 72%))"
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {mode === 'signin' ? 'Authenticating...' : 'Provisioning account...'}</>
                    ) : (
                      mode === 'signin' ? 'Sign In to Dashboard' : 'Create Access Key'
                    )}
                  </span>
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-semibold tracking-wider">or</span>
                </div>
              </div>
              <p className="text-center text-sm text-foreground mt-6 font-medium">
                {mode === 'signin' ? "New here? " : 'Already a member? '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-primary hover:text-primary/80 transition-colors font-bold"
                >
                  {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
                </button>
              </p>
            </div>

          </div>

          <p className="text-center text-[11px] text-muted-foreground px-6 mt-4 leading-relaxed">
            By continuing, you agree to SolveSphere's <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}