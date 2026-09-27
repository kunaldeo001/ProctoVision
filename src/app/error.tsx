'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertOctagon } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <AlertOctagon className="w-16 h-16 text-destructive" />
      </div>
      <h1 className="text-4xl font-headline font-bold mb-4">Something went wrong!</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error has occurred. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
        <Button onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
