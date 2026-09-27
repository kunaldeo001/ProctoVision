import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <ShieldAlert className="w-16 h-16 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-headline font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved. Please check the URL or return to the dashboard.
      </p>
      <Link href="/dashboard">
        <Button size="lg">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
