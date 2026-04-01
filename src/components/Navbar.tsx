import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Trophy, FolderOpen, LayoutDashboard, LogOut, Menu, X, Target, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '@/components/Logo';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/problems', label: 'Problems', icon: Target },
  { path: '/quiz', label: 'Quiz', icon: Gamepad2 },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/portfolio', label: 'Portfolio', icon: FolderOpen },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Solver';

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <Logo variant="full" size="sm" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <Link key={path} to={path}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`gap-2 transition-all duration-200 ${isActive ? 'text-primary bg-primary/10 border border-primary/20' : 'hover:text-primary'}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
            <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{username}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl p-4 space-y-2 animate-slide-up">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <Link key={path} to={path} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-2 ${isActive ? 'text-primary bg-primary/10' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            );
          })}
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      )}
    </nav>
  );
}
