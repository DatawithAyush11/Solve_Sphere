import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface AppShellProps {
  children: ReactNode;
  userXp?: number;
}

export function AppShell({ children, userXp = 0 }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // On mobile, always start collapsed
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setCollapsed(true);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} xp={userXp} />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          collapsed ? "ml-[var(--sidebar-collapsed-width)]" : "ml-[var(--sidebar-width)]"
        )}
      >
        <Topbar onToggleSidebar={() => setCollapsed(!collapsed)} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10 h-64" />
          {children}
        </main>
      </div>
      
      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
    </div>
  );
}
