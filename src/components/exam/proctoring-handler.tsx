'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { MalpracticeEvent, RiskLevel } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const MALPRACTICE_WEIGHTS = {
  'No Face Detected': 20,
  'Multiple People': 30,
  'Gaze Away': 10,
  'Phone Detected': 40,
  'Tab Switch': 15,
};

const VIOLATION_TYPES = Object.keys(MALPRACTICE_WEIGHTS) as (keyof typeof MALPRACTICE_WEIGHTS)[];

const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 60) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
};

const riskStyles: Record<RiskLevel, { icon: React.ReactNode, color: string, text: string }> = {
  Low: { icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-500', text: 'No significant issues detected.' },
  Medium: { icon: <AlertTriangle className="w-5 h-5" />, color: 'text-yellow-500', text: 'Some suspicious behavior noted.' },
  High: { icon: <ShieldAlert className="w-5 h-5" />, color: 'text-red-500', text: 'High risk of malpractice detected.' },
};

export function ProctoringHandler({ studentId, examId }: { studentId: string; examId: string }) {
  const [events, setEvents] = useState<MalpracticeEvent[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Low');

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate a random malpractice event
      if (Math.random() > 0.7) {
        const type = VIOLATION_TYPES[Math.floor(Math.random() * VIOLATION_TYPES.length)];
        const newEvent: MalpracticeEvent = {
          id: `evt-${Date.now()}`,
          studentId,
          examId,
          type,
          score: MALPRACTICE_WEIGHTS[type],
          timestamp: Date.now(),
        };
        setEvents(prev => [newEvent, ...prev]);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [studentId, examId]);

  useEffect(() => {
    const newTotalScore = events.reduce((sum, event) => sum + event.score, 0);
    setTotalScore(newTotalScore);
    setRiskLevel(getRiskLevel(newTotalScore));
  }, [events]);

  const currentRiskStyle = riskStyles[riskLevel];

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <ShieldAlert className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg">Proctoring Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="text-center space-y-2">
          <div className={cn("flex items-center justify-center gap-2 text-lg font-semibold", currentRiskStyle.color)}>
            {currentRiskStyle.icon}
            <span>{riskLevel} Risk</span>
          </div>
          <p className="text-xs text-muted-foreground">{currentRiskStyle.text}</p>
          <div className="space-y-1">
            <Progress value={Math.min(totalScore, 100)} className="h-2" />
            <p className="text-sm font-medium">Malpractice Score: {totalScore}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
            <h4 className="text-sm font-medium mb-2">Event Log</h4>
            <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-3">
                {events.map(event => (
                    <div key={event.id} className="flex items-start gap-3">
                    <div>
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    </div>
                    <div className="text-sm">
                        <p className="font-medium">{event.type}</p>
                        <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                        </p>
                    </div>
                    <div className="ml-auto text-sm font-bold text-destructive">+{event.score}</div>
                    </div>
                ))}
                {events.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No events detected yet.</p>
                )}
                </div>
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
