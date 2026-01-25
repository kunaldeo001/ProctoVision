
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { MalpracticeEvent, RiskLevel, ViolationType } from '@/lib/types';
import { VIOLATION_DISPLAY_NAMES } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { detectExamMalpractice } from '@/ai/flows/detect-exam-malpractice';

const riskStyles: Record<RiskLevel, { icon: React.ReactNode, color: string, text: string }> = {
  Low: { icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-500', text: 'No significant issues detected.' },
  Medium: { icon: <AlertTriangle className="w-5 h-5" />, color: 'text-yellow-500', text: 'Some suspicious behavior noted.' },
  High: { icon: <ShieldAlert className="w-5 h-5" />, color: 'text-red-500', text: 'High risk of malpractice detected.' },
};

type ProctoringHandlerProps = { 
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
  onDetectionUpdate: (status: {
    noFaceDetected: boolean;
    multiplePeopleDetected: boolean;
    phoneDetected: boolean;
    gazeAway: boolean;
  }) => void;
  addMalpracticeEvent: (type: ViolationType) => void;
  events: MalpracticeEvent[];
  totalScore: number;
  riskLevel: RiskLevel;
};


export function ProctoringHandler({ 
  videoRef,
  enabled,
  onDetectionUpdate,
  addMalpracticeEvent,
  events,
  totalScore,
  riskLevel
}: ProctoringHandlerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isProcessingRef = useRef(false);

  const addMalpracticeEventRef = useRef(addMalpracticeEvent);
  useEffect(() => {
    addMalpracticeEventRef.current = addMalpracticeEvent;
  }, [addMalpracticeEvent]);

  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    const processFrame = async () => {
      if (isProcessingRef.current || !videoRef.current || videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
        return;
      }
      isProcessingRef.current = true;
      setIsProcessing(true);

      const canvas = canvasRef.current || document.createElement('canvas');
      if (!canvasRef.current) {
        (canvasRef as any).current = canvas;
      }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        isProcessingRef.current = false;
        setIsProcessing(false);
        return;
      }
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const photoDataUri = canvas.toDataURL('image/jpeg');

      try {
        const result = await detectExamMalpractice({ photoDataUri });
        const violations = new Set(result.violations || []);
        
        onDetectionUpdate({
          noFaceDetected: violations.has('NO_FACE_DETECTED'),
          multiplePeopleDetected: violations.has('MULTIPLE_PEOPLE'),
          phoneDetected: violations.has('PHONE_DETECTED'),
          gazeAway: violations.has('GAZE_AWAY'),
        });

        violations.forEach(violation => {
          addMalpracticeEventRef.current(violation);
        });

      } catch (error) {
        console.error("Error detecting malpractice:", error);
      } finally {
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    };

    const interval = setInterval(processFrame, 5000);
    return () => {
        clearInterval(interval);
        if (onDetectionUpdate) {
            onDetectionUpdate({ noFaceDetected: false, multiplePeopleDetected: false, phoneDetected: false, gazeAway: false });
        }
    };

  }, [enabled, videoRef, onDetectionUpdate]);

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
                        <p className="font-medium">{VIOLATION_DISPLAY_NAMES[event.type] || event.type}</p>
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
