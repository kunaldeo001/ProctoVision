'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { MalpracticeEvent, RiskLevel } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { detectExamMalpractice } from '@/ai/flows/detect-exam-malpractice';

const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 40) return 'High';
  if (score >= 20) return 'Medium';
  return 'Low';
};

const riskStyles: Record<RiskLevel, { icon: React.ReactNode, color: string, text: string }> = {
  Low: { icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-500', text: 'No significant issues detected.' },
  Medium: { icon: <AlertTriangle className="w-5 h-5" />, color: 'text-yellow-500', text: 'Some suspicious behavior noted.' },
  High: { icon: <ShieldAlert className="w-5 h-5" />, color: 'text-red-500', text: 'High risk of malpractice detected.' },
};

type ProctoringHandlerProps = { 
  studentId: string; 
  examId: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
  onDetectionUpdate: (status: {
    noFaceDetected: boolean;
    multiplePeopleDetected: boolean;
  }) => void;
};


export function ProctoringHandler({ 
  studentId, 
  examId,
  videoRef,
  enabled,
  onDetectionUpdate
}: ProctoringHandlerProps) {
  const [events, setEvents] = useState<MalpracticeEvent[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Low');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    const processFrame = async () => {
      if (isProcessing || !videoRef.current || videoRef.current.readyState < 2) {
        return;
      }
      setIsProcessing(true);

      const canvas = canvasRef.current || document.createElement('canvas');
      if (!canvasRef.current) {
        (canvasRef as any).current = canvas;
      }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        setIsProcessing(false);
        return;
      }
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const photoDataUri = canvas.toDataURL('image/jpeg');

      try {
        const result = await detectExamMalpractice({ photoDataUri });
        
        onDetectionUpdate({
          noFaceDetected: result.noFaceDetected,
          multiplePeopleDetected: result.multiplePeopleDetected,
        });

        const newEvents: MalpracticeEvent[] = [];
        if(result.noFaceDetected) newEvents.push({id: `evt-${Date.now()}-1`, studentId, examId, type: 'No Face Detected', score: 20, timestamp: Date.now() });
        if(result.multiplePeopleDetected) newEvents.push({id: `evt-${Date.now()}-2`, studentId, examId, type: 'Multiple People', score: 30, timestamp: Date.now() });
        if(result.gazeAwayFromScreen) newEvents.push({id: `evt-${Date.now()}-3`, studentId, examId, type: 'Gaze Away', score: 10, timestamp: Date.now() });
        if(result.phoneDetected) newEvents.push({id: `evt-${Date.now()}-4`, studentId, examId, type: 'Phone Detected', score: 40, timestamp: Date.now() });

        if (newEvents.length > 0) {
          setEvents(prev => [...newEvents, ...prev]);
        }
      } catch (error) {
        console.error("Error detecting malpractice:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    const interval = setInterval(processFrame, 5000); // Check every 5 seconds
    return () => {
        clearInterval(interval);
        if (onDetectionUpdate) {
            onDetectionUpdate({ noFaceDetected: false, multiplePeopleDetected: false });
        }
    };

  }, [enabled, videoRef, isProcessing, studentId, examId, onDetectionUpdate]);

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
          <p className="text-xs text-muted-foreground">{isProcessing ? 'Analyzing...' : currentRiskStyle.text}</p>
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
