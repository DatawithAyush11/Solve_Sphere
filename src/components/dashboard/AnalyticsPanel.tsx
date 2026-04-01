import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart2 } from 'lucide-react';

interface AnalyticsPanelProps {
  solutionsOverTime: { date: string; count: number }[];
  categoryBreakdown: { name: string; value: number; color: string }[];
  totalSolutions: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="font-medium">{label}</p>
        <p className="text-primary">{payload[0].value} solution{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPanel({ solutionsOverTime, categoryBreakdown, totalSolutions }: AnalyticsPanelProps) {
  if (totalSolutions === 0) {
    return (
      <div className="space-y-4 animate-slide-up delay-300">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          Performance Analytics
        </h2>
        <div className="glass-card p-8 text-center text-muted-foreground space-y-3">
          <BarChart2 className="h-12 w-12 mx-auto opacity-20" />
          <div>
            <p className="font-medium">No data yet</p>
            <p className="text-sm mt-1">Submit solutions to see your analytics here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up delay-300">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <BarChart2 className="h-5 w-5 text-primary" />
        Performance Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Solutions over time */}
        <div className="glass-card p-4 space-y-3">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Solutions Over Time</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={solutionsOverTime} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
              <XAxis dataKey="date" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(175 80% 50% / 0.05)' }} />
              <Bar dataKey="count" fill="hsl(175 80% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="glass-card p-4 space-y-3">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Category Breakdown</p>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 10, color: 'hsl(215 20% 65%)' }}>{value}</span>}
                />
                <Tooltip
                  formatter={(value) => [value, 'Solutions']}
                  contentStyle={{ background: 'hsl(222 47% 9%)', border: '1px solid hsl(222 30% 18%)', borderRadius: 8, fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
