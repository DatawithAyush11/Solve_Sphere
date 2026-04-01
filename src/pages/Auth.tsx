import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';
import { Eye, EyeOff, Loader2, Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Navigate } from 'react-router-dom';

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

  // Clear all fields whenever the mode changes so browser-autofilled
  // stale values (e.g. "6") don't persist across sign-in / sign-up switch.
  useEffect(() => {
    setEmail('');
    setPassword('');
    setUsername('');
    setEmailError('');
    setShowPassword(false);
  }, [mode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
    if (mode === 'signup' && !username) {
      toast({ title: 'Username required', description: 'Please choose a username.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
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

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <Logo variant="full" size="lg" />
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold">Check your email!</h2>
            <p className="text-muted-foreground">
              We sent a verification link to <span className="text-primary font-medium">{sentEmail}</span>. Click the link to activate your account.
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Didn't receive it? Check your spam folder.</span>
            </div>
            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => { setEmailSent(false); setMode('signin'); }}
              >
                Back to Sign In
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-muted-foreground"
                onClick={async () => {
                  const { error } = await signUp(sentEmail, password, username);
                  if (!error) toast({ title: 'Email resent!', description: 'Check your inbox again.' });
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Resend verification email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo variant="full" size="lg" />
          <p className="text-muted-foreground text-sm mt-2">
            {mode === 'signin' ? 'Welcome back, Solver!' : 'Join thousands of problem solvers'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card p-8 space-y-6 shadow-xl">
          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-border/50">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                id={`tab-${m}`}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === m
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/*
           * key={mode} forces a full DOM remount of the <form> when switching
           * between sign-in and sign-up. This flushes any browser-autofilled
           * values (like the stray "6") that browsers inject into fields.
           */}
          <form
            key={mode}
            onSubmit={handleSubmit}
            autoComplete="on"
            className="space-y-4"
          >
            {/* Hidden honeypot fields — trick browsers away from autofilling
                the wrong credential into the visible fields. */}
            <input type="text" name="fakeusername" tabIndex={-1} aria-hidden="true"
              style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
              autoComplete="username" />

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="auth-username">Username</Label>
                <Input
                  id="auth-username"
                  name="username"
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p id="email-error" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <div className="relative">
                <Input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              id="auth-submit-btn"
              type="submit"
              className="w-full gradient-primary text-white h-11 font-semibold"
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {mode === 'signin' ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {mode === 'signup' && (
            <div className="flex items-start gap-2 rounded-xl bg-secondary/50 px-3 py-2.5 text-xs text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span>By signing up, you agree to solve real-world problems and make the world better!</span>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-primary hover:underline font-medium"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}