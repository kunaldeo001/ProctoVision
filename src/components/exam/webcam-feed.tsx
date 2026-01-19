'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, VideoOff, UserCheck, UserX, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type WebcamFeedProps = {
    videoRef: React.RefObject<HTMLVideoElement>;
    onReady: (isReady: boolean) => void;
    proctoringStatus: {
        noFaceDetected: boolean;
        multiplePeopleDetected: boolean;
    }
};

export function WebcamFeed({ videoRef, onReady, proctoringStatus }: WebcamFeedProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API not available.');
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }

  }, [videoRef, onReady, toast]);

  const isReady = hasCameraPermission === true && videoRef.current?.srcObject != null;

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <Video className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg">Webcam Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted-foreground/20 rounded-md flex items-center justify-center overflow-hidden relative">
          <video ref={videoRef} className={cn("w-full aspect-video", !isReady && "hidden")} autoPlay muted playsInline />
          {!isReady && hasCameraPermission === false && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/80">
                <VideoOff className="w-12 h-12" />
                <span className="text-sm font-medium">Camera Disabled</span>
            </div>
          )}
           {!isReady && hasCameraPermission === null && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/80">
                <Video className="w-12 h-12 animate-pulse" />
                <span className="text-sm font-medium">Initializing...</span>
            </div>
          )}

          {isReady && proctoringStatus.multiplePeopleDetected && (
            <div className="absolute inset-0 bg-destructive/80 flex flex-col items-center justify-center text-destructive-foreground p-4 text-center transition-all duration-300">
                <Users className="w-12 h-12 mb-2"/>
                <p className="font-semibold">Multiple People Detected</p>
                <p className="text-sm">Only you should be in the camera view.</p>
            </div>
          )}

          {isReady && !proctoringStatus.multiplePeopleDetected && proctoringStatus.noFaceDetected && (
             <div className="absolute inset-0 bg-destructive/80 flex flex-col items-center justify-center text-destructive-foreground p-4 text-center transition-all duration-300">
                <UserX className="w-12 h-12 mb-2"/>
                <p className="font-semibold">No Face Detected</p>
                <p className="text-sm">Please ensure your face is clearly visible.</p>
            </div>
          )}

          {isReady && !proctoringStatus.noFaceDetected && !proctoringStatus.multiplePeopleDetected && (
            <div className="absolute top-2 left-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-300">
                <UserCheck className="w-4 h-4" />
                <span className="font-medium">Proctoring Active</span>
            </div>
          )}
        </div>
        
        {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access to use this feature.
                </AlertDescription>
            </Alert>
        )}
         <p className="text-xs text-muted-foreground mt-2 text-center">Webcam access is mandatory for proctoring.</p>
      </CardContent>
    </Card>
  );
}
