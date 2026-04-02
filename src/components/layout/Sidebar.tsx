import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Target, Gamepad2, Trophy, FolderOpen, Zap } from 'lucide-react';
import { Logo } from '@/components/Logo';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/problems', label: 'Problems', icon: Target },
  { path: '/quiz', label: 'Quiz', icon: Gamepad2 },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/portfolio', label: 'Portfolio', icon: FolderOpen },
];

interface SidebarProps {
  collapsed: boolean;
  xp?: number;
}

export function Sidebar({ collapsed, xp = 0 }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-border bg-card flex flex-col",
      collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
    )}>
      {/* Brand */}
      <div className="h-[var(--topbar-height)] flex items-center px-4 border-b border-border/50 shrink-0 overflow-hidden">
        <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity whitespace-nowrap">
          <Logo variant={collapsed ? "icon" : "full"} size="sm" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto scrollbar-thin">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground border-l-2 border-transparent"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary")} />
              <span className={cn(
                "whitespace-nowrap transition-all duration-300",
                collapsed ? "opacity-0 -translate-x-2 absolute pointer-events-none" : "opacity-100 translate-x-0 relative"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Stats */}
      <div className="p-4 border-t border-border/50 shrink-0">
        <div className={cn(
          "flex items-center gap-3 rounded-xl bg-secondary/30 p-3 transition-opacity",
          collapsed && "opacity-0 pointer-events-none"
        )}>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total XP</p>
            <p className="font-bold text-foreground text-sm truncate">{xp.toLocaleString()} XP</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
