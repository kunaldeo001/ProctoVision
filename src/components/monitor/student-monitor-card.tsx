
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import type { User, StudentSession, RiskLevel } from '@/lib/types';
import { VIOLATION_DISPLAY_NAMES } from '@/lib/types';
import { Video, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const riskStyles: Record<RiskLevel, {
  icon: React.ReactNode,
  progressColor: string,
  bgColor: string,
  borderColor: string
}> = {
  Low: {
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    progressColor: 'bg-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  Medium: {
    icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    progressColor: 'bg-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/40'
  },
  High: {
    icon: <ShieldAlert className="w-4 h-4 text-red-500" />,
    progressColor: 'bg-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/50'
  },
};

type StudentMonitorCardProps = {
  student: User;
  session: StudentSession;
};

export function StudentMonitorCard({ student, session }: StudentMonitorCardProps) {
  const currentRisk = riskStyles[session.riskLevel];

  return (
    <Card className={cn("flex flex-col transition-all", currentRisk.bgColor, currentRisk.borderColor)}>
      <CardHeader className="flex-row items-center space-x-4 pb-2">
        <Avatar>
          <AvatarImage src={student.avatarUrl} alt={student.name} />
          <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-base">{student.name}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {currentRisk.icon}
            <span>{session.riskLevel} Risk</span>
            <span className="font-bold">({session.totalScore})</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2">
        <div className="aspect-video bg-muted/50 rounded-md flex items-center justify-center relative">
          <Video className="w-12 h-12 text-muted-foreground/30" />
          <Progress value={Math.min(session.totalScore, 100)} className={cn("absolute bottom-0 left-0 right-0 h-1", currentRisk.progressColor)} />
        </div>
        <ScrollArea className="h-32 pr-4 -mr-4">
          <div className="space-y-2 text-xs">
            {session.events.map(event => (
              <div key={event.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                  <span>{VIOLATION_DISPLAY_NAMES[event.type] || event.type}</span>
                </div>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                </span>
              </div>
            ))}
             {session.events.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No events detected.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
