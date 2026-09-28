'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, AlertTriangle, CheckCircle, Activity, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { MalpracticeEvent, RiskLevel, ViolationType } from '@/lib/types';
import { VIOLATION_DISPLAY_NAMES } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { detectExamMalpractice } from '@/ai/flows/detect-exam-malpractice';
import {
  analyzeVideoFrame,
  drawDetectionOverlay,
  loadVisionModel,
  isVisionModelReady,
} from '@/lib/vision-detector';
import { useToast } from '@/hooks/use-toast';

const riskStyles: Record<RiskLevel, { icon: React.ReactNode; color: string; text: string }> = {
  Low: {
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-green-500',
    text: 'Normal exam activity. No critical violations.',
  },
  Medium: {
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-yellow-500',
    text: 'Integrity warnings registered. Stay focused.',
  },
  High: {
    icon: <ShieldAlert className="w-5 h-5" />,
    color: 'text-red-500',
    text: 'High malpractice risk! Near termination threshold.',
  },
};

type ProctoringHandlerProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  overlayCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  enabled: boolean;
  sensitivity?: 'standard' | 'high' | 'ultra';
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

// Play short acoustic warning chime on severe malpractice
function playAlertChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(720, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Non-critical audio alert
  }
}

export function ProctoringHandler({
  videoRef,
  overlayCanvasRef,
  enabled,
  sensitivity = 'high',
  onDetectionUpdate,
  addMalpracticeEvent,
  events,
  totalScore,
  riskLevel,
}: ProctoringHandlerProps) {
  const [isAiReady, setIsAiReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDetectedObj, setLastDetectedObj] = useState<string | null>(null);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(true);
  const { toast } = useToast();

  const addMalpracticeEventRef = useRef(addMalpracticeEvent);
  useEffect(() => {
    addMalpracticeEventRef.current = addMalpracticeEvent;
  }, [addMalpracticeEvent]);

  // Cooldown tracker per violation type to avoid spamming
  const lastViolationTimeRef = useRef<Record<string, number>>({});
  const consecutiveAbsenceRef = useRef(0);
  const consecutiveGazeRef = useRef(0);

  const triggerViolationWithCooldown = useCallback((type: ViolationType, cooldownMs = 4500) => {
    const now = Date.now();
    const lastTime = lastViolationTimeRef.current[type] || 0;
    if (now - lastTime >= cooldownMs) {
      lastViolationTimeRef.current[type] = now;
      addMalpracticeEventRef.current(type);

      if (audioAlertsEnabled) {
        playAlertChime();
      }

      if (type === 'PHONE_DETECTED') {
        toast({
          variant: 'destructive',
          title: '🚨 Mobile Phone / Device Detected',
          description: 'A mobile phone or forbidden device was identified in the camera frame (+40 pts).',
        });
      } else if (type === 'MULTIPLE_PEOPLE') {
        toast({
          variant: 'destructive',
          title: '⚠️ Multiple People Detected',
          description: 'More than one person identified in camera view (+30 pts).',
        });
      } else if (type === 'NO_FACE_DETECTED') {
        toast({
          variant: 'destructive',
          title: '👤 Face Not Visible',
          description: 'Please remain clearly centered and visible in the camera frame (+25 pts).',
        });
      } else if (type === 'GAZE_AWAY') {
        toast({
          title: '👀 Gaze Deviation Detected',
          description: 'Please keep your eyes focused on the exam screen (+10 pts).',
        });
      }
    }
  }, [toast, audioAlertsEnabled]);

  // Pre-load TensorFlow.js COCO-SSD model
  useEffect(() => {
    loadVisionModel().then(model => {
      if (model) setIsAiReady(true);
    });
  }, []);

  // Primary Real-time Vision AI Loop (runs every 550ms for instant detection)
  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    let isDestroyed = false;

    const runVisionCycle = async () => {
      if (isDestroyed || !videoRef.current || videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
        return;
      }

      setIsProcessing(true);

      try {
        const analysis = await analyzeVideoFrame(videoRef.current, sensitivity);

        if (isDestroyed) return;

        // Render HUD bounding boxes if overlay canvas provided
        if (overlayCanvasRef?.current && videoRef.current) {
          drawDetectionOverlay(overlayCanvasRef.current, videoRef.current, analysis);
        }

        // Update parent status
        onDetectionUpdate({
          noFaceDetected: analysis.noFaceDetected,
          multiplePeopleDetected: analysis.multiplePeopleDetected,
          phoneDetected: analysis.phoneDetected,
          gazeAway: analysis.gazeAway,
        });

        // 1. Phone Detection (immediate priority)
        if (analysis.phoneDetected) {
          setLastDetectedObj(`Phone (${analysis.phoneConfidence || 88}%)`);
          triggerViolationWithCooldown('PHONE_DETECTED', 4500);
        }

        // 2. Multiple People Detection
        if (analysis.multiplePeopleDetected) {
          setLastDetectedObj(`${analysis.peopleCount} People`);
          triggerViolationWithCooldown('MULTIPLE_PEOPLE', 4500);
        }

        // 3. Absence / No Face
        if (analysis.noFaceDetected) {
          consecutiveAbsenceRef.current += 1;
          if (consecutiveAbsenceRef.current >= 2) {
            triggerViolationWithCooldown('NO_FACE_DETECTED', 6000);
          }
        } else {
          consecutiveAbsenceRef.current = 0;
        }

        // 4. Gaze Away
        if (analysis.gazeAway) {
          consecutiveGazeRef.current += 1;
          if (consecutiveGazeRef.current >= 2) {
            triggerViolationWithCooldown('GAZE_AWAY', 7000);
          }
        } else {
          consecutiveGazeRef.current = 0;
        }

        if (!analysis.phoneDetected && !analysis.multiplePeopleDetected) {
          setLastDetectedObj(null);
        }
      } catch (err) {
        console.error('Vision cycle error:', err);
      } finally {
        if (!isDestroyed) {
          setIsProcessing(false);
        }
      }
    };

    const interval = setInterval(runVisionCycle, 550);

    return () => {
      isDestroyed = true;
      clearInterval(interval);
      onDetectionUpdate({
        noFaceDetected: false,
        multiplePeopleDetected: false,
        phoneDetected: false,
        gazeAway: false,
      });
    };
  }, [enabled, videoRef, overlayCanvasRef, sensitivity, onDetectionUpdate, triggerViolationWithCooldown]);

  // Secondary Cloud Gemini AI Loop (every 10 seconds with compressed 480x270 snapshot)
  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 270;
    const ctx = canvas.getContext('2d');

    const runCloudGeminiCycle = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || !ctx) return;
      try {
        ctx.drawImage(videoRef.current, 0, 0, 480, 270);
        const photoDataUri = canvas.toDataURL('image/jpeg', 0.55);

        const result = await detectExamMalpractice({ photoDataUri });
        if (result && Array.isArray(result.violations)) {
          result.violations.forEach(v => {
            triggerViolationWithCooldown(v, 6000);
          });
        }
      } catch {
        // Fallback silently if Gemini API key not present
      }
    };

    const cloudInterval = setInterval(runCloudGeminiCycle, 10000);
    return () => clearInterval(cloudInterval);
  }, [enabled, videoRef, triggerViolationWithCooldown]);

  const currentRiskStyle = riskStyles[riskLevel];

  return (
    <Card className="flex-1 flex flex-col border-border/80 shadow-md">
      <CardHeader className="flex-row items-center justify-between space-y-0 py-3 px-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Integrity & Proctoring Engine</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
            title={audioAlertsEnabled ? "Audio chimes active" : "Audio muted"}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
          >
            {audioAlertsEnabled ? <Volume2 className="w-3.5 h-3.5 text-primary" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Risk Level and Score */}
        <div className="text-center space-y-2 p-3 bg-muted/20 rounded-xl border border-border/50">
          <div className={cn("flex items-center justify-center gap-2 text-base font-bold", currentRiskStyle.color)}>
            {currentRiskStyle.icon}
            <span>{riskLevel} Malpractice Risk</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isProcessing && lastDetectedObj ? `⚠️ Flagged: ${lastDetectedObj}` : currentRiskStyle.text}
          </p>
          <div className="space-y-1.5 pt-1">
            <Progress
              value={Math.min(totalScore, 100)}
              className={cn(
                "h-2.5 transition-all",
                totalScore >= 75 ? "[&>div]:bg-red-500" :
                totalScore >= 40 ? "[&>div]:bg-amber-500" :
                "[&>div]:bg-primary"
              )}
            />
            <div className="flex items-center justify-between text-xs font-semibold px-1">
              <span className="text-muted-foreground">Integrity Score</span>
              <span className={cn(
                totalScore >= 75 ? "text-red-600 font-bold" :
                totalScore >= 40 ? "text-amber-600 font-bold" :
                "text-primary"
              )}>
                {totalScore} / 100 pts
              </span>
            </div>
          </div>
        </div>

        {/* AI Vision Model Status */}
        <div className="text-[11px] bg-primary/5 text-muted-foreground border border-primary/20 rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span>Dual Vision Engine</span>
          </div>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {isAiReady || isVisionModelReady() ? 'TensorFlow + Optical Ready' : 'Optical Active'}
          </span>
        </div>

        {/* Event Log */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Violation Timeline</h4>
            <span className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {events.length} incident{events.length !== 1 ? 's' : ''}
            </span>
          </div>
          <ScrollArea className="flex-1 pr-3 -mr-3 border rounded-lg bg-card/50 p-2">
            <div className="space-y-2">
              {events.map(event => (
                <div
                  key={event.id}
                  className="flex items-start gap-2.5 p-2 rounded-md bg-muted/30 border border-border/50 text-xs transition-colors hover:bg-muted/50"
                >
                  <AlertTriangle className={cn(
                    "w-4 h-4 mt-0.5 flex-shrink-0",
                    event.severity === 'high' ? 'text-red-500' :
                    event.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {VIOLATION_DISPLAY_NAMES[event.type] || event.type}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <div className={cn(
                    "font-bold text-xs px-1.5 py-0.5 rounded",
                    event.score >= 30 ? "bg-red-500/10 text-red-600" :
                    event.score >= 15 ? "bg-amber-500/10 text-amber-700" :
                    "bg-blue-500/10 text-blue-600"
                  )}>
                    +{event.score}
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-500/80" />
                  <p className="font-medium">No violations recorded.</p>
                  <p className="text-[10px] text-muted-foreground/80">Proctoring camera is actively monitoring.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
