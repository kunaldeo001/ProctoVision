import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Bot, Users, Gauge, FileText } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ProctoVisionLogo } from '@/components/icons/proctovision-logo';

const features = [
  {
    icon: <Bot className="w-8 h-8 text-primary" />,
    title: 'AI-Powered Proctoring',
    description: 'Leverage computer vision to detect multiple faces, mobile phones, and gaze direction.',
  },
  {
    icon: <Gauge className="w-8 h-8 text-primary" />,
    title: 'Malpractice Scoring',
    description: 'A weighted scoring system generates a real-time risk assessment for each student.',
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: 'Real-Time Monitoring',
    description: 'Admins can monitor all students during a live exam from a central dashboard.',
  },
  {
    icon: <FileText className="w-8 h-8 text-primary" />,
    title: 'Comprehensive Reports',
    description: 'Generate detailed post-exam reports with malpractice summaries and event logs.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <Link href="#" className="flex items-center justify-center gap-2" prefetch={false}>
          <ProctoVisionLogo className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold font-headline">ProctoVision</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Teacher Login
          </Link>
          <Button asChild>
            <Link href="/dashboard/exams/1/take">Student Demo</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    Ensure Academic Integrity with AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    ProctoVision is a comprehensive online proctoring solution that uses advanced AI to detect and prevent cheating during exams.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/dashboard">Admin Dashboard</Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                     <Link href="/dashboard/exams/1/monitor">Live Monitor Demo</Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  width={600}
                  height={400}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              )}
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">The Future of Remote Examinations</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides a secure and fair testing environment for everyone, powered by cutting-edge technology.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 mt-12">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="bg-accent/20 p-3 rounded-full">
                    {feature.icon}
                  </div>
                  <div className="grid gap-1">
                    <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 ProctoVision. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
