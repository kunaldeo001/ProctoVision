import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart, BookOpen, ShieldAlert, GraduationCap, Users, Trophy, AlertTriangle, CalendarDays, ArrowRight } from 'lucide-react';
import { ExamList } from "@/components/dashboard/exam-list";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentViolationsChart } from "@/components/dashboard/recent-violations-chart";
import { mockExams, mockReports, mockUsers, mockNotifications } from "@/lib/mock-data";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { RiskLevel } from "@/lib/types";

const riskBadge: Record<RiskLevel, string> = {
  Low: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  Medium: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  High: "text-red-600 bg-red-500/10 border-red-500/30",
};

export default function DashboardPage() {
  const liveExams = mockExams.filter(e => e.status === 'live').length;
  const totalStudentsInLiveExams = mockExams
    .filter(e => e.status === 'live')
    .reduce((sum, exam) => sum + exam.studentIds.length, 0);
  const highRiskAlerts = mockReports.filter(r => r.riskLevel === 'High').length;
  const avgScore = Math.round(mockReports.reduce((acc, curr) => acc + curr.percentage, 0) / (mockReports.length || 1));
  const passRate = Math.round(mockReports.filter(r => {
    const exam = mockExams.find(e => e.id === r.examId);
    return r.percentage >= (exam?.passingPercentage ?? 50);
  }).length / (mockReports.length || 1) * 100);
  const totalStudents = mockUsers.filter(u => u.role === 'student').length;

  // Leaderboard
  const students = mockUsers.filter(u => u.role === 'student');
  const leaderboard = students
    .map(student => {
      const reports = mockReports.filter(r => r.studentId === student.id);
      const avg = reports.length ? Math.round(reports.reduce((a, r) => a + r.percentage, 0) / reports.length) : 0;
      const avgIntegrity = reports.length
        ? Math.round(100 - reports.reduce((a, r) => a + r.malpracticeScore, 0) / reports.length) : 100;
      return { student, avg, avgIntegrity, examsCount: reports.length };
    })
    .filter(s => s.examsCount > 0)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  const recentAlerts = mockNotifications
    .filter(n => n.type === 'danger' || n.type === 'warning')
    .slice(0, 5);

  const rankColors = [
    "text-amber-400 font-bold",
    "text-slate-400 font-bold",
    "text-orange-500 font-bold",
    "text-muted-foreground",
    "text-muted-foreground",
  ];
  const rankBg = [
    "bg-amber-500/10",
    "bg-slate-400/10",
    "bg-orange-500/10",
    "",
    "",
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Command Center <span className="text-gradient text-2xl">✦</span>
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back, Kunal. Here's your platform at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/calendar">
            <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/5 hover:border-primary/50">
              <CalendarDays className="mr-2 h-4 w-4 text-primary" /> Calendar
            </Button>
          </Link>
          <Link href="/exams/create">
            <Button className="shadow-lg shadow-primary/25 glow-primary">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Live Exams"
          value={liveExams.toString()}
          icon={<BookOpen className="h-4 w-4" />}
          description="Currently active sessions"
          variant="primary"
          trend={liveExams}
        />
        <StatCard
          title="Active Students"
          value={totalStudentsInLiveExams.toString()}
          icon={<Users className="h-4 w-4" />}
          description={`of ${totalStudents} total students`}
          variant="accent"
        />
        <StatCard
          title="High-Risk Alerts"
          value={highRiskAlerts.toString()}
          icon={<ShieldAlert className="h-4 w-4" />}
          description="Requires immediate review"
          variant="danger"
        />
        <StatCard
          title="Pass Rate"
          value={`${passRate}%`}
          icon={<GraduationCap className="h-4 w-4" />}
          description={`Avg score ${avgScore}% across all exams`}
          variant="success"
          trend={passRate - 50}
        />
      </div>

      {/* Main row: quick actions + chart */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4">
          <Card className="shadow-sm h-full flex flex-col border-primary/10">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-xl font-headline">Quick Actions</CardTitle>
              <CardDescription>Navigate to any area of the platform</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
              {[
                { href: "/exams/create", icon: <PlusCircle className="w-5 h-5" />, label: "New Exam", ring: "ring-primary/20", iconBg: "bg-primary/10 text-primary" },
                { href: "/questions", icon: <BookOpen className="w-5 h-5" />, label: "Questions", ring: "ring-accent/20", iconBg: "bg-accent/10 text-accent" },
                { href: "/reports", icon: <BarChart className="w-5 h-5" />, label: "Reports", ring: "ring-emerald-500/20", iconBg: "bg-emerald-500/10 text-emerald-600" },
                { href: "/alerts", icon: <ShieldAlert className="w-5 h-5" />, label: "Alerts", ring: "ring-red-500/20", iconBg: "bg-red-500/10 text-red-600" },
                { href: "/students", icon: <Users className="w-5 h-5" />, label: "Students", ring: "ring-blue-500/20", iconBg: "bg-blue-500/10 text-blue-600" },
                { href: "/analytics", icon: <GraduationCap className="w-5 h-5" />, label: "Analytics", ring: "ring-purple-500/20", iconBg: "bg-purple-500/10 text-purple-600" },
                { href: "/calendar", icon: <CalendarDays className="w-5 h-5" />, label: "Calendar", ring: "ring-orange-500/20", iconBg: "bg-orange-500/10 text-orange-600" },
                { href: "/exams", icon: <BookOpen className="w-5 h-5" />, label: "All Exams", ring: "ring-slate-500/20", iconBg: "bg-muted text-muted-foreground" },
              ].map(item => (
                <Link key={item.href} href={item.href} className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border bg-card hover:bg-muted/50 transition-all text-center gap-2.5 shadow-sm group ring-1",
                  item.ring
                )}>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", item.iconBg)}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{item.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="col-span-full lg:col-span-3">
          <RecentViolationsChart />
        </div>
      </div>

      {/* Leaderboard + Recent Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Leaderboard */}
        <Card className="shadow-sm border-amber-500/10">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Top Performers</CardTitle>
                  <CardDescription className="text-xs">Ranked by average score</CardDescription>
                </div>
              </div>
              <Link href="/analytics">
                <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-primary">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet.</p>
            ) : (
              <div className="divide-y">
                {leaderboard.map(({ student, avg, avgIntegrity, examsCount }, i) => (
                  <Link key={student.id} href={`/students/${student.id}`} className="block group">
                    <div className={cn("flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors", rankBg[i])}>
                      <span className={cn("text-sm w-5 text-center shrink-0", rankColors[i])}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </span>
                      <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border">
                        <AvatarImage src={student.avatarUrl} alt={student.name} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{examsCount} exam{examsCount !== 1 ? 's' : ''} · Integrity {avgIntegrity}/100</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-gradient">{avg}%</p>
                        <p className="text-[10px] text-muted-foreground">avg score</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="shadow-sm border-red-500/10">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Recent Alerts</CardTitle>
                  <CardDescription className="text-xs">Latest integrity signals</CardDescription>
                </div>
              </div>
              <Link href="/alerts">
                <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-red-500">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent alerts.</p>
            ) : (
              <div className="divide-y">
                {recentAlerts.map(notif => (
                  <Link key={notif.id} href={notif.link || '/alerts'} className="block group">
                    <div className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ring-2",
                        notif.type === 'danger'
                          ? "bg-red-500 ring-red-500/20"
                          : "bg-amber-500 ring-amber-500/20"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live & Upcoming */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight font-headline">Live & Upcoming Exams</h2>
          <Link href="/exams">
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">All Exams <ArrowRight className="w-3 h-3" /></Button>
          </Link>
        </div>
        <ExamList exams={mockExams.filter(e => e.status === 'live' || e.status === 'upcoming')} />
      </div>
    </div>
  );
}
