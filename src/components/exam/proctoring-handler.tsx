'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, AlertTriangle, CheckCircle, Activity, Sparkles, Volume2, VolumeX, Smartphone } from 'lucide-react';
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

// Play distinct acoustic warning chime on malpractice
export function playAlertChime(isPhone = false) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isPhone) {
      // Rapid dual-beep for phone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(960, ctx.currentTime);
      osc.frequency.setValueAtTime(640, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(960, ctx.currentTime + 0.24);

      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(720, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
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
  const consecutiveMultiPersonRef = useRef(0);

  // Phone detection latch to ensure warnings stay visible for at least 2.5 seconds
  const phoneLatchUntilRef = useRef(0);

  const triggerViolationWithCooldown = useCallback((type: ViolationType, cooldownMs = 4000) => {
    const now = Date.now();
    const lastTime = lastViolationTimeRef.current[type] || 0;
    if (now - lastTime >= cooldownMs) {
      lastViolationTimeRef.current[type] = now;
      addMalpracticeEventRef.current(type);

      if (audioAlertsEnabled) {
        playAlertChime(type === 'PHONE_DETECTED');
      }

      if (type === 'PHONE_DETECTED') {
        toast({
          variant: 'destructive',
          title: '🚨 MOBILE PHONE DETECTED!',
          description: 'A mobile phone or forbidden device was identified in the camera frame (+40 pts penalty). Put it away immediately.',
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

  // Primary Real-time Vision AI Loop (runs every 380ms for ultra-fast, smooth detection)
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

        const now = Date.now();
        if (analysis.phoneDetected) {
          // Latch phone detection active for at least 2500ms
          phoneLatchUntilRef.current = now + 2500;
        }

        const isEffectivePhone = analysis.phoneDetected || now < phoneLatchUntilRef.current;

        // Render HUD bounding boxes if overlay canvas provided
        if (overlayCanvasRef?.current && videoRef.current) {
          drawDetectionOverlay(overlayCanvasRef.current, videoRef.current, {
            ...analysis,
            phoneDetected: isEffectivePhone,
          });
        }

        // Update parent status
        onDetectionUpdate({
          noFaceDetected: analysis.noFaceDetected,
          multiplePeopleDetected: analysis.multiplePeopleDetected,
          phoneDetected: isEffectivePhone,
          gazeAway: analysis.gazeAway,
        });

        // 1. Phone Detection (immediate priority)
        if (analysis.phoneDetected) {
          setLastDetectedObj(`Phone (${analysis.phoneConfidence || 92}%)`);
          triggerViolationWithCooldown('PHONE_DETECTED', 3500);
        }

        // 2. Multiple People Detection (require 3 consecutive cycles ~1.1s)
        if (analysis.multiplePeopleDetected) {
          consecutiveMultiPersonRef.current += 1;
          if (consecutiveMultiPersonRef.current >= 3) {
            setLastDetectedObj(`${analysis.peopleCount} People`);
            triggerViolationWithCooldown('MULTIPLE_PEOPLE', 4500);
          }
        } else {
          consecutiveMultiPersonRef.current = 0;
        }

        // 3. Absence / No Face (require 6 consecutive cycles ~2.3s to avoid blink/frame lag false alarms)
        if (analysis.noFaceDetected) {
          consecutiveAbsenceRef.current += 1;
          if (consecutiveAbsenceRef.current >= 6) {
            triggerViolationWithCooldown('NO_FACE_DETECTED', 6000);
          }
        } else {
          consecutiveAbsenceRef.current = 0;
        }

        // 4. Gaze Away (require 7 consecutive cycles ~2.7s to allow natural question reading)
        if (analysis.gazeAway) {
          consecutiveGazeRef.current += 1;
          if (consecutiveGazeRef.current >= 7) {
            triggerViolationWithCooldown('GAZE_AWAY', 7000);
          }
        } else {
          consecutiveGazeRef.current = 0;
        }

        if (!isEffectivePhone && !analysis.multiplePeopleDetected) {
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

    const interval = setInterval(runVisionCycle, 380);

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
            triggerViolationWithCooldown(v, 4000);
          });
        }
      } catch (e) {
        // Silently skip if cloud AI unavailable
      }
    };

    const geminiInterval = setInterval(runCloudGeminiCycle, 10000);
    return () => clearInterval(geminiInterval);
  }, [enabled, videoRef, triggerViolationWithCooldown]);

  const style = riskStyles[riskLevel];
  const maxScore = 100;
  const scorePercent = Math.min(100, Math.round((totalScore / maxScore) * 100));

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Integrity Monitor</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
            title={audioAlertsEnabled ? 'Audio warnings active (Click to mute)' : 'Audio warnings muted (Click to unmute)'}
            className={cn(
              "p-1 rounded text-xs transition-colors",
              audioAlertsEnabled ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {audioAlertsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <span className={cn('text-xs font-bold uppercase flex items-center gap-1', style.color)}>
            {style.icon}
            {riskLevel}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Risk meter */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-muted-foreground">Malpractice Score</span>
            <span className={cn('font-bold', totalScore > 40 ? 'text-destructive' : 'text-foreground')}>
              {totalScore} / {maxScore} pts
            </span>
          </div>
          <Progress
            value={scorePercent}
            className={cn(
              'h-2',
              totalScore >= 75 ? '[&>div]:bg-red-500' : totalScore >= 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-primary'
            )}
          />
        </div>

        {/* Live Detected Target Banner */}
        {lastDetectedObj && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold animate-pulse">
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>Active Tracking: {lastDetectedObj}</span>
          </div>
        )}

        {/* Violations stream */}
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5 font-medium">
            <span>Recorded Incidents ({events.length})</span>
            {isProcessing && <span className="text-[10px] text-primary flex items-center gap-1">Scanning...</span>}
          </div>
          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2 bg-muted/20 rounded-md">
              No integrity violations recorded.
            </p>
          ) : (
            <ScrollArea className="h-28 rounded-md border p-2 bg-muted/10">
              <div className="space-y-1.5">
                {events.slice(0, 10).map((event, idx) => (
                  <div
                    key={event.id || idx}
                    className="flex items-center justify-between text-xs py-1 px-1.5 rounded bg-background border"
                  >
                    <span className="font-medium text-[11px] truncate max-w-[170px]">
                      {VIOLATION_DISPLAY_NAMES[event.type] || event.type}
                    </span>
                    <span className="text-[10px] text-destructive font-mono font-bold">
                      +{event.score}pts
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
