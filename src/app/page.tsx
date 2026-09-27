import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Brain, Activity, Clock, CheckCircle, ChevronRight, Lock, Eye, Video } from 'lucide-react';
import { ProctoVisionLogo } from '@/components/icons/proctovision-logo';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-8 h-16 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <ProctoVisionLogo className="w-8 h-8 text-primary" />
          <span className="font-headline font-bold text-xl">ProctoVision</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">Features</Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#how-it-works">How it works</Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#analytics">Analytics</Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button>View Dashboard</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 z-0"></div>
          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  AI-Powered Online <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    Examination & Proctoring
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Automated proctoring signals, real-time event monitoring, and AI-assisted integrity insights for secure remote assessments.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-primary/25 transition-all">
                    Try Demo <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">Core Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ensure Academic Integrity</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  ProctoVision uses advanced automated signals to assist proctors and educators.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Automated Proctoring Signals</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Monitors webcam feed for missing faces, multiple people, and suspicious objects.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Brain className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">AI Exam Insights</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Leverages Gemini AI to summarize session events and explain integrity risks.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-success/10 rounded-full">
                  <Lock className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-bold">Secure Exam Engine</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Tracks browser tab switches, connection losses, and prevents data loss.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="technology" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
             <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-4">
                  <div className="inline-block rounded-lg bg-accent/10 px-3 py-1 text-sm text-accent font-medium">Technology Stack</div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Built with Modern Tech</h2>
                  <p className="text-muted-foreground text-lg">
                    ProctoVision is built to be fast, reliable, and intelligent.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Next.js 15 (App Router)</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Google Genkit & Gemini 2.5</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Tailwind CSS & shadcn/ui</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Vercel Deployment</li>
                  </ul>
                </div>
                <div className="flex-1">
                   <div className="rounded-2xl border bg-card p-2 shadow-xl shadow-primary/5">
                      <div className="rounded-xl overflow-hidden bg-muted aspect-video relative flex items-center justify-center border">
                          <Video className="w-16 h-16 text-muted-foreground/30" />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-4">
                            <span className="font-code text-sm text-foreground">const result = await detectExamMalpractice(...)</span>
                          </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-muted/40 py-6">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ProctoVisionLogo className="w-5 h-5 text-primary" />
            <span className="font-semibold">ProctoVision</span>
          </div>
          <p className="text-xs text-muted-foreground">
             &copy; {new Date().getFullYear()} ProctoVision. All rights reserved. Demo Project.
          </p>
        </div>
      </footer>
    </div>
  );
}
