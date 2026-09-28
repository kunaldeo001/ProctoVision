'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Video,
  VideoOff,
  UserCheck,
  UserX,
  Users,
  Smartphone,
  EyeOff,
  Sparkles,
  Cpu,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { playAlertChime } from './proctoring-handler';

type WebcamFeedProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  overlayCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  onReady: (isReady: boolean) => void;
  sensitivity?: 'standard' | 'high' | 'ultra';
  onSensitivityChange?: (s: 'standard' | 'high' | 'ultra') => void;
  proctoringStatus: {
    noFaceDetected: boolean;
    multiplePeopleDetected: boolean;
    phoneDetected: boolean;
    gazeAway: boolean;
  };
  onSimulateViolation?: (type: 'PHONE_DETECTED' | 'MULTIPLE_PEOPLE' | 'NO_FACE_DETECTED' | 'GAZE_AWAY') => void;
};

export function WebcamFeed({
  videoRef,
  overlayCanvasRef,
  onReady,
  sensitivity = 'high',
  onSensitivityChange,
  proctoringStatus,
  onSimulateViolation,
}: WebcamFeedProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [showSimControls, setShowSimControls] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let streamInstance: MediaStream | null = null;

    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API not available.');
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        });
        streamInstance = stream;
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            onReady(true);
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        onReady(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach(track => track.stop());
      } else if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoRef, onReady, toast]);

  const isReady = hasCameraPermission === true && videoRef.current?.srcObject != null;
  const { multiplePeopleDetected, phoneDetected, noFaceDetected, gazeAway } = proctoringStatus;
  const hasActiveViolation = multiplePeopleDetected || phoneDetected || noFaceDetected || gazeAway;

  const handleTestPhoneAlert = () => {
    playAlertChime(true);
    onSimulateViolation?.('PHONE_DETECTED');
    toast({
      variant: 'destructive',
      title: '🚨 Test Phone Alert Triggered',
      description: 'Phone detection simulation active. Reticle and warning banner demonstrated.',
    });
  };

  return (
    <Card className="overflow-hidden border-border/80 shadow-md">
      <CardHeader className="flex-row items-center justify-between space-y-0 py-3 px-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Live Camera & AI Vision</CardTitle>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-5 px-1.5 gap-1 font-mono transition-colors",
              phoneDetected ? "border-red-500 text-red-600 bg-red-500/10 animate-pulse font-bold" :
              multiplePeopleDetected ? "border-orange-500 text-orange-600 bg-orange-500/10" :
              noFaceDetected ? "border-red-500 text-red-600 bg-red-500/10" :
              "border-emerald-500 text-emerald-600 bg-emerald-500/10"
            )}
          >
            <Cpu className="w-2.5 h-2.5" />
            {phoneDetected ? "PHONE DETECTED" : multiplePeopleDetected ? "MULTI PERSON" : noFaceDetected ? "NO FACE" : "CV ACTIVE"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className={cn(
          "aspect-video bg-slate-950 rounded-lg flex items-center justify-center overflow-hidden relative border transition-all shadow-inner",
          phoneDetected ? "border-red-500 ring-2 ring-red-500/40" : "border-border"
        )}>
          <video
            ref={videoRef}
            className={cn("w-full h-full object-cover", !isReady && "hidden")}
            autoPlay
            muted
            playsInline
          />
          {overlayCanvasRef && (
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />
          )}

          {!isReady && hasCameraPermission === false && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/80 p-4 text-center">
              <VideoOff className="w-10 h-10 text-destructive" />
              <span className="text-xs font-semibold text-destructive">Camera Access Denied</span>
              <p className="text-[11px] text-muted-foreground">Allow webcam permissions in your browser.</p>
            </div>
          )}

          {!isReady && hasCameraPermission === null && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/80">
              <Video className="w-10 h-10 animate-pulse text-primary" />
              <span className="text-xs font-medium">Initializing camera & AI models...</span>
            </div>
          )}

          {/* Real-time Warning Banners floating over video */}
          {isReady && phoneDetected && (
            <div className="absolute top-2 inset-x-2 bg-red-600 text-white px-2.5 py-1.5 rounded-md flex items-center justify-between text-xs font-bold shadow-xl animate-pulse z-20 border-2 border-white">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-white animate-bounce" />
                <span>🚨 MOBILE PHONE DETECTED!</span>
              </div>
              <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-white tracking-wide font-mono">+40 PTS</span>
            </div>
          )}

          {isReady && !phoneDetected && multiplePeopleDetected && (
            <div className="absolute top-2 inset-x-2 bg-orange-600 text-white px-2.5 py-1.5 rounded-md flex items-center justify-between text-xs font-bold shadow-xl z-20 border border-white/20">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-white" />
                <span>MULTIPLE PEOPLE IN FRAME</span>
              </div>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-white tracking-wide">+30 PTS</span>
            </div>
          )}

          {isReady && !phoneDetected && !multiplePeopleDetected && noFaceDetected && (
            <div className="absolute top-2 inset-x-2 bg-red-600 text-white px-2.5 py-1.5 rounded-md flex items-center justify-between text-xs font-bold shadow-xl z-20 border border-white/20">
              <div className="flex items-center gap-1.5">
                <UserX className="w-4 h-4 text-white" />
                <span>NO FACE DETECTED</span>
              </div>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-white tracking-wide">+25 PTS</span>
            </div>
          )}

          {isReady && !phoneDetected && !multiplePeopleDetected && !noFaceDetected && gazeAway && (
            <div className="absolute top-2 inset-x-2 bg-amber-500 text-black px-2.5 py-1.5 rounded-md flex items-center justify-between text-xs font-bold shadow-xl z-20 border border-black/20">
              <div className="flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-black" />
                <span>EYES OFF SCREEN</span>
              </div>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-black tracking-wide">+10 PTS</span>
            </div>
          )}

          {isReady && !hasActiveViolation && (
            <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 z-20 shadow-md backdrop-blur-sm">
              <UserCheck className="w-3 h-3" />
              <span>Identity Verified</span>
            </div>
          )}

          {/* Bottom Feed Metadata */}
          <div className="absolute bottom-1.5 inset-x-2 flex items-center justify-between text-[10px] text-white/70 px-1 z-20 pointer-events-none drop-shadow">
            <span>TensorFlow + Optical CV</span>
            <span className="capitalize">{sensitivity} Mode</span>
          </div>
        </div>

        {hasCameraPermission === false && (
          <Alert variant="destructive" className="mt-3">
            <AlertTitle className="text-xs">Camera Required</AlertTitle>
            <AlertDescription className="text-xs">
              Please grant camera permissions to enable automated proctoring.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Sensitivity & Phone Test Bar */}
        <div className="mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] gap-2">
          {onSensitivityChange ? (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground flex items-center gap-1 font-medium text-[10px]">
                <SlidersHorizontal className="w-3 h-3" /> Mode:
              </span>
              <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-md">
                {(['standard', 'high', 'ultra'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSensitivityChange(s)}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize transition-all",
                      sensitivity === s
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s === 'ultra' ? 'Ultra (Max)' : s}
                  </button>
                ))}
              </div>
            </div>
          ) : <div />}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestPhoneAlert}
            className="h-6 text-[10px] gap-1 px-2 border-red-500/40 text-red-600 hover:bg-red-500/10"
          >
            <Smartphone className="w-3 h-3 text-red-600" />
            Test Phone Alert
          </Button>
        </div>

        {/* AI Proctoring Quick Controls & Testing Bar */}
        <div className="mt-2 pt-2 border-t space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-primary" />
              Proctor Testing Tools
            </span>
            <button
              type="button"
              onClick={() => setShowSimControls(!showSimControls)}
              className="text-[10px] text-primary hover:underline font-medium"
            >
              {showSimControls ? 'Hide tools' : 'Show tools'}
            </button>
          </div>

          {showSimControls && onSimulateViolation && (
            <div className="grid grid-cols-2 gap-1.5 pt-1 animate-in fade-in">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] text-destructive border-destructive/30 hover:bg-destructive/10 justify-start"
                onClick={() => onSimulateViolation('PHONE_DETECTED')}
              >
                <Smartphone className="w-3 h-3 mr-1" /> Sim Phone (+40)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] text-orange-600 border-orange-500/30 hover:bg-orange-500/10 justify-start"
                onClick={() => onSimulateViolation('MULTIPLE_PEOPLE')}
              >
                <Users className="w-3 h-3 mr-1" /> Multi-Person (+30)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] text-destructive border-destructive/30 hover:bg-destructive/10 justify-start"
                onClick={() => onSimulateViolation('NO_FACE_DETECTED')}
              >
                <UserX className="w-3 h-3 mr-1" /> No Face (+25)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] text-amber-600 border-amber-500/30 hover:bg-amber-500/10 justify-start"
                onClick={() => onSimulateViolation('GAZE_AWAY')}
              >
                <EyeOff className="w-3 h-3 mr-1" /> Gaze Away (+10)
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
