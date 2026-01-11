'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type WebcamFeedProps = {
    videoRef: React.RefObject<HTMLVideoElement>;
    onReady: (isReady: boolean) => void;
};

export function WebcamFeed({ videoRef, onReady }: WebcamFeedProps) {
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

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <Video className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg">Webcam Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted-foreground/20 rounded-md flex items-center justify-center overflow-hidden">
          <video ref={videoRef} className={cn("w-full aspect-video", hasCameraPermission === false && "hidden")} autoPlay muted playsInline />
          {hasCameraPermission === false && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/80">
                <VideoOff className="w-12 h-12" />
                <span className="text-sm font-medium">Camera Disabled</span>
            </div>
          )}
           {hasCameraPermission === null && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/80">
                <Video className="w-12 h-12 animate-pulse" />
                <span className="text-sm font-medium">Initializing...</span>
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
