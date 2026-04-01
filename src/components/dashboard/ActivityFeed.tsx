import { formatDistanceToNow } from 'date-fns';
import { Sparkles, TrendingUp, Plus, Star, Zap } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'solved' | 'leveled_up' | 'new_problem' | 'badge_earned';
  username: string;
  detail: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const typeConfig = {
  solved: { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10', label: 'solved' },
  leveled_up: { icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10', label: 'leveled up' },
  new_problem: { icon: Plus, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'new challenge' },
  badge_earned: { icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'earned badge' },
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4 animate-slide-up delay-400">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        Activity Feed
      </h2>

      <div className="glass-card overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No activity yet. Start solving to appear here!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30 max-h-72 overflow-y-auto scrollbar-thin">
            {activities.map((activity, i) => {
              const config = typeConfig[activity.type];
              const Icon = config.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 hover:bg-secondary/20 transition-colors animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${config.bg} shrink-0`}>
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.username}</span>{' '}
                      <span className="text-muted-foreground">{config.label}</span>{' '}
                      <span className="font-medium text-foreground/90 truncate">{activity.detail}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
