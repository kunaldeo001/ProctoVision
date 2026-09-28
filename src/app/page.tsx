import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield, Brain, Activity, Clock, CheckCircle, ChevronRight, Lock, Eye,
  Video, Users, BarChart2, Zap, Star, ArrowRight, FileText, Globe, Cpu,
  ShieldCheck,
} from 'lucide-react';
import { ProctoVisionLogo } from '@/components/icons/proctovision-logo';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Automated Webcam Proctoring",
    description: "Real-time signals: face detection, multiple-person alerts, gaze tracking, and object detection built on browser APIs.",
    color: "text-primary bg-primary/10",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Gemini AI Insights",
    description: "AI-powered session summaries using Google Gemini to explain integrity signals in plain language.",
    color: "text-accent bg-accent/10",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Fullscreen Exam Lock",
    description: "Anti-cheat enforcement: fullscreen lock, right-click/copy block, dev-tools prevention, tab-switch detection.",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: <BarChart2 className="h-6 w-6" />,
    title: "Advanced Analytics",
    description: "Score distributions, per-student trends, question-level difficulty charts, and pass rate analytics with Recharts.",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: "Live Proctoring Dashboard",
    description: "Monitor every student simultaneously with live risk score rings, event logs, and integrity timelines.",
    color: "text-red-500 bg-red-500/10",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "AI Question Generation",
    description: "Generate exam questions instantly with Gemini — any topic, difficulty, and question type. Clearly marked for review.",
    color: "text-amber-500 bg-amber-500/10",
  },
];

const STATS = [
  { value: '16+', label: 'App pages', color: 'text-primary' },
  { value: '7', label: 'Violation types', color: 'text-red-500' },
  { value: '100%', label: 'TypeScript', color: 'text-blue-500' },
  { value: 'AI', label: 'Gemini powered', color: 'text-accent' },
];

const TECH_STACK = [
  'Next.js 15', 'TypeScript', 'Tailwind CSS', 'shadcn/ui',
  'Google Gemini', 'Recharts', 'Vercel', 'date-fns',
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Nav */}
      <header className="px-4 lg:px-8 h-16 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <ProctoVisionLogo className="w-8 h-8 text-primary" />
          <span className="font-headline font-bold text-xl">ProctoVision</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-6 items-center">
          <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors" href="#features">Features</Link>
          <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors" href="#tech">Tech Stack</Link>
          <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors" href="#stats">About</Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="shadow-lg shadow-primary/25 glow-primary">
              Try Demo <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </nav>
        <Link href="/dashboard" className="ml-auto md:hidden">
          <Button size="sm">Demo</Button>
        </Link>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden relative">
          {/* Background gradient */}
          <div className="absolute inset-0 animated-gradient z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)] z-0" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03] z-0"
            style={{ backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--foreground)) 1px,transparent 1px)', backgroundSize: '50px 50px' }} />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 px-4 py-1.5 text-sm">
                <Star className="w-3 h-3 mr-1.5 fill-current" /> AI-Powered Examination Platform
              </Badge>

              <div className="space-y-4 max-w-4xl">
                <h1 className="text-5xl font-headline font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl leading-none">
                  Secure Exams.{' '}
                  <span className="text-gradient">Smart Proctoring.</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                  ProctoVision combines webcam-based integrity monitoring, Google Gemini AI insights, and real-time analytics into one cohesive platform for remote assessments.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-13 px-9 text-base shadow-2xl shadow-primary/30 glow-primary">
                    Explore Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/exams/1/take">
                  <Button variant="outline" size="lg" className="h-13 px-9 text-base border-primary/30 hover:bg-primary/5 hover:border-primary/50">
                    <Video className="mr-2 h-4 w-4 text-primary" /> Try Take Exam
                  </Button>
                </Link>
              </div>

              {/* Stats row */}
              <div id="stats" className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-border/30 w-full max-w-2xl">
                {STATS.map(s => (
                  <div key={s.label} className="text-center">
                    <p className={cn("text-3xl font-bold font-headline", s.color)}>{s.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="w-full py-20 md:py-28 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5">Core Features</Badge>
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">
                Everything you need for <span className="text-gradient">secure assessments</span>
              </h2>
              <p className="max-w-[700px] text-muted-foreground text-lg">
                Built for educators and institutions who care about academic integrity — without the complexity.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {FEATURES.map(f => (
                <div key={f.title} className="flex flex-col gap-4 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", f.color)}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="tech" className="w-full py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
              <div className="space-y-6">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/5">Technology</Badge>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">
                  Built with <span className="text-gradient-success">modern tech</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  A full-stack AI platform demonstrating production-grade Next.js patterns, AI integration, real-time data handling, and accessible UI design.
                </p>
                <div className="flex flex-wrap gap-2">
                  {TECH_STACK.map(tech => (
                    <Badge key={tech} variant="secondary" className="px-3 py-1 text-sm">{tech}</Badge>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { icon: <Cpu className="w-4 h-4 text-accent" />, text: "Genkit + Gemini 2.5 Flash for AI flows" },
                    { icon: <Globe className="w-4 h-4 text-blue-500" />, text: "Deployed on Vercel with auto-deploy CI/CD" },
                    { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, text: "Anti-cheat, fullscreen lock, tab detection" },
                    { icon: <FileText className="w-4 h-4 text-amber-500" />, text: "16+ pages, fully typed with TypeScript" },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-3 text-sm">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Code panel */}
              <div className="rounded-2xl border bg-card p-1 shadow-2xl shadow-primary/10">
                <div className="rounded-xl overflow-hidden bg-[hsl(225_28%_7%)] border border-white/5 p-5 font-mono text-sm space-y-2 text-left">
                  <div className="flex gap-1.5 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-slate-500">{'// AI Integrity Flow — Genkit + Gemini'}</p>
                  <p><span className="text-purple-400">const</span> <span className="text-blue-300">result</span> <span className="text-slate-400">=</span> <span className="text-yellow-300">await</span> <span className="text-emerald-300">summarizeMalpractice</span><span className="text-slate-300">{'({'}</span></p>
                  <p className="pl-4"><span className="text-blue-300">studentId</span><span className="text-slate-400">:</span> <span className="text-amber-300">"stu-001"</span><span className="text-slate-400">,</span></p>
                  <p className="pl-4"><span className="text-blue-300">events</span><span className="text-slate-400">:</span> <span className="text-blue-300">session</span><span className="text-slate-300">.events</span><span className="text-slate-400">,</span></p>
                  <p className="pl-4"><span className="text-blue-300">riskScore</span><span className="text-slate-400">:</span> <span className="text-amber-300">82</span><span className="text-slate-400">,</span></p>
                  <p className="text-slate-300">{'})'}</p>
                  <p className="mt-2 text-slate-500">{'// → AI-generated human-readable summary'}</p>
                  <p><span className="text-emerald-300">console</span><span className="text-slate-400">.</span><span className="text-blue-300">log</span><span className="text-slate-300">(result.</span><span className="text-yellow-300">summary</span><span className="text-slate-300">)</span></p>
                  <p className="text-emerald-400/80 text-xs mt-3 italic">
                    "High integrity risk detected. Student showed repeated gaze deviation, tab switching (3x), and phone detection at 14:23..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-20 md:py-28 bg-gradient-to-br from-primary/10 via-accent/5 to-background border-t">
          <div className="container px-4 md:px-6 text-center">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mb-6">Resume Project</Badge>
            <h2 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl mb-4">
              Ready to see it in <span className="text-gradient">action?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-[600px] mx-auto mb-10">
              Explore the full dashboard — create exams, run mock proctoring, analyze results, and see AI insights live.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="px-10 h-13 shadow-2xl shadow-primary/25 glow-primary">
                  Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/exams/1/take">
                <Button variant="outline" size="lg" className="px-10 h-13 border-primary/30 hover:bg-primary/5">
                  <Video className="mr-2 h-4 w-4" /> Take Demo Exam
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-muted/30 py-8">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ProctoVisionLogo className="w-5 h-5 text-primary" />
            <span className="font-semibold font-headline">ProctoVision</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Built with Next.js 15, Gemini AI & shadcn/ui · Demo project for internship portfolio
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/reports" className="hover:text-primary transition-colors">Reports</Link>
            <Link href="/analytics" className="hover:text-primary transition-colors">Analytics</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
