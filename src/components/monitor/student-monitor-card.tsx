import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { User, StudentSession, RiskLevel } from '@/lib/types';
import { VIOLATION_DISPLAY_NAMES } from '@/lib/types';
import { Video, ShieldAlert, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const riskConfig: Record<RiskLevel, {
  icon: React.ReactNode;
  ringClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  barColor: string;
}> = {
  Low: {
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
    ringClass: 'ring-emerald-500/30',
    bgClass: 'bg-emerald-500/5',
    borderClass: 'border-emerald-500/20',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
    barColor: 'bg-emerald-500',
  },
  Medium: {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    ringClass: 'ring-amber-500/40',
    bgClass: 'bg-amber-500/5',
    borderClass: 'border-amber-500/30',
    badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    barColor: 'bg-amber-500',
  },
  High: {
    icon: <ShieldAlert className="w-3.5 h-3.5 text-red-500" />,
    ringClass: 'ring-red-500/50',
    bgClass: 'bg-red-500/5',
    borderClass: 'border-red-500/30',
    badgeClass: 'bg-red-500/10 text-red-700 border-red-500/30',
    barColor: 'bg-red-500',
  },
};

type StudentMonitorCardProps = {
  student: User;
  session: StudentSession;
};

export function StudentMonitorCard({ student, session }: StudentMonitorCardProps) {
  const cfg = riskConfig[session.riskLevel];
  const scorePercent = Math.min(session.totalScore, 100);
  // SVG ring gauge
  const R = 28;
  const circ = 2 * Math.PI * R;
  const dashoffset = circ * (1 - scorePercent / 100);

  return (
    <Card className={cn(
      "flex flex-col transition-all border-2 shadow-sm hover:shadow-md overflow-hidden ring-1",
      cfg.bgClass, cfg.borderClass, cfg.ringClass,
      session.riskLevel === 'High' && "animate-pulse-subtle"
    )}>
      {/* Header */}
      <CardHeader className="flex-row items-center gap-3 pb-2 pt-3 px-3">
        <div className="relative shrink-0">
          <Avatar className="h-9 w-9 ring-2 ring-border">
            <AvatarImage src={student.avatarUrl} alt={student.name} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
              {student.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm font-semibold leading-tight truncate">{student.name}</CardTitle>
          <div className="flex items-center gap-1.5 mt-0.5">
            {cfg.icon}
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 font-semibold", cfg.badgeClass)}>
              {session.riskLevel} Risk
            </Badge>
          </div>
        </div>
        {/* Mini ring gauge */}
        <div className="shrink-0 relative w-12 h-12">
          <svg viewBox="0 0 70 70" className="w-full h-full -rotate-90">
            <circle cx="35" cy="35" r={R} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/40" />
            <circle
              cx="35" cy="35" r={R} fill="none"
              strokeWidth="6"
              strokeDasharray={circ}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-700",
                scorePercent > 60 ? "text-red-500" : scorePercent > 25 ? "text-amber-500" : "text-emerald-500"
              )}
              stroke="currentColor"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn(
              "text-[11px] font-bold leading-none",
              scorePercent > 60 ? "text-red-600" : scorePercent > 25 ? "text-amber-600" : "text-emerald-600"
            )}>{scorePercent}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-2 px-3 pb-3">
        {/* Webcam placeholder */}
        <div className="aspect-video bg-muted/60 rounded-lg flex items-center justify-center relative border border-border/50 overflow-hidden">
          <Video className="w-10 h-10 text-muted-foreground/25" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
            <div
              className={cn("h-full transition-all", cfg.barColor)}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
          {/* Live badge */}
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            LIVE
          </div>
          <div className="absolute top-1.5 right-1.5">
            <Wifi className="w-3 h-3 text-emerald-400" />
          </div>
        </div>

        {/* Event log */}
        <ScrollArea className="h-28">
          <div className="space-y-1.5 text-xs pr-2">
            {session.events.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-muted-foreground">
                <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-500" />
                <span>No violations detected</span>
              </div>
            ) : (
              session.events.slice(0, 8).map(event => (
                <div key={event.id} className={cn(
                  "flex justify-between items-center py-1 px-2 rounded-md",
                  event.severity === 'high' ? 'bg-red-500/10' :
                  event.severity === 'medium' ? 'bg-amber-500/10' : 'bg-muted/50'
                )}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      event.severity === 'high' ? 'bg-red-500' :
                      event.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-400'
                    )} />
                    <span className="truncate">{VIOLATION_DISPLAY_NAMES[event.type] || event.type}</span>
                  </div>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
