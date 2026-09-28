import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
  trend?: number;      // positive = up, negative = down, 0 or undefined = neutral
  trendLabel?: string; // e.g. "vs last week"
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'accent';
};

const variantStyles = {
  default:  { card: '', iconBg: 'bg-muted text-muted-foreground', value: 'text-foreground' },
  primary:  { card: 'border-primary/20 bg-primary/3', iconBg: 'bg-primary/10 text-primary', value: 'text-primary' },
  success:  { card: 'border-emerald-500/20 bg-emerald-500/3', iconBg: 'bg-emerald-500/10 text-emerald-600', value: 'text-emerald-600' },
  warning:  { card: 'border-amber-500/20 bg-amber-500/3', iconBg: 'bg-amber-500/10 text-amber-600', value: 'text-amber-600' },
  danger:   { card: 'border-red-500/20 bg-red-500/3', iconBg: 'bg-red-500/10 text-red-600', value: 'text-red-600' },
  accent:   { card: 'border-accent/20 bg-accent/3', iconBg: 'bg-accent/10 text-accent', value: 'text-accent' },
};

export function StatCard({ title, value, icon, description, trend, trendLabel, variant = 'default' }: StatCardProps) {
  const s = variantStyles[variant];
  const hasTrend = trend !== undefined;
  const trendUp = hasTrend && trend > 0;
  const trendDown = hasTrend && trend < 0;
  const trendNeutral = hasTrend && trend === 0;

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow animate-fade-in", s.card)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.iconBg)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold tracking-tight", s.value)}>{value}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <p className="text-xs text-muted-foreground flex-1">{description}</p>
          {hasTrend && (
            <div className={cn(
              "flex items-center gap-0.5 text-xs font-semibold shrink-0",
              trendUp ? "text-emerald-600" : trendDown ? "text-red-600" : "text-muted-foreground"
            )}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : trendDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              <span>{trendUp ? '+' : ''}{trend}{trendLabel || ''}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
