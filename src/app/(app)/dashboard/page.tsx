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

const notifTypeConfig = {
  danger: "text-red-500",
  warning: "text-amber-500",
  success: "text-emerald-500",
  info: "text-blue-500",
};

export default function DashboardPage() {
  const liveExams = mockExams.filter(e => e.status === 'live').length;
  const totalStudentsInLiveExams = mockExams
    .filter(e => e.status === 'live')
    .reduce((sum, exam) => sum + exam.studentIds.length, 0);
  const highRiskAlerts = mockReports.filter(r => r.riskLevel === 'High').length;
  const avgScore = Math.round(mockReports.reduce((acc, curr) => acc + curr.percentage, 0) / (mockReports.length || 1));

  // Build leaderboard from reports
  const students = mockUsers.filter(u => u.role === 'student');
  const leaderboard = students
    .map(student => {
      const reports = mockReports.filter(r => r.studentId === student.id);
      const avg = reports.length
        ? Math.round(reports.reduce((a, r) => a + r.percentage, 0) / reports.length)
        : 0;
      const avgIntegrity = reports.length
        ? Math.round(100 - reports.reduce((a, r) => a + r.malpracticeScore, 0) / reports.length)
        : 100;
      return { student, avg, avgIntegrity, examsCount: reports.length };
    })
    .filter(s => s.examsCount > 0)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  const recentAlerts = mockNotifications
    .filter(n => n.type === 'danger' || n.type === 'warning')
    .slice(0, 4);

  const trophyColors = ["text-amber-400", "text-slate-400", "text-orange-500"];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Command Center</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Kunal. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/calendar">
            <Button variant="outline" size="sm">
              <CalendarDays className="mr-2 h-4 w-4" /> Calendar
            </Button>
          </Link>
          <Link href="/exams/create">
            <Button className="shadow-lg shadow-primary/20">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Live Exams" value={liveExams.toString()} icon={<BookOpen className="h-4 w-4 text-primary" />} description="Currently active sessions" />
        <StatCard title="Active Students" value={totalStudentsInLiveExams.toString()} icon={<Users className="h-4 w-4 text-primary" />} description="Monitoring in real-time" />
        <StatCard title="High-Risk Alerts" value={highRiskAlerts.toString()} icon={<ShieldAlert className="h-4 w-4 text-destructive" />} description="Requires immediate review" />
        <StatCard title="Avg. Performance" value={`${avgScore}%`} icon={<GraduationCap className="h-4 w-4 text-success" />} description="Across all completed exams" />
      </div>

      {/* Main row: quick actions + violations chart */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4">
          <Card className="shadow-sm h-full flex flex-col">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              {[
                { href: "/exams/create", icon: <PlusCircle className="w-6 h-6" />, label: "New Exam", color: "text-primary bg-primary/10 hover:border-primary/30 hover:bg-primary/5" },
                { href: "/questions", icon: <BookOpen className="w-6 h-6" />, label: "Question Bank", color: "text-accent bg-accent/10 hover:border-accent/30 hover:bg-accent/5" },
                { href: "/reports", icon: <BarChart className="w-6 h-6" />, label: "Analytics", color: "text-emerald-500 bg-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/5" },
                { href: "/alerts", icon: <ShieldAlert className="w-6 h-6" />, label: "Alerts", color: "text-red-500 bg-red-500/10 hover:border-red-500/30 hover:bg-red-500/5" },
                { href: "/students", icon: <Users className="w-6 h-6" />, label: "Students", color: "text-blue-500 bg-blue-500/10 hover:border-blue-500/30 hover:bg-blue-500/5" },
                { href: "/analytics", icon: <GraduationCap className="w-6 h-6" />, label: "Performance", color: "text-purple-500 bg-purple-500/10 hover:border-purple-500/30 hover:bg-purple-500/5" },
                { href: "/calendar", icon: <CalendarDays className="w-6 h-6" />, label: "Calendar", color: "text-orange-500 bg-orange-500/10 hover:border-orange-500/30 hover:bg-orange-500/5" },
                { href: "/exams", icon: <BookOpen className="w-6 h-6" />, label: "All Exams", color: "text-muted-foreground bg-muted hover:border-border hover:bg-muted/80" },
              ].map(item => (
                <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center p-3 rounded-xl border bg-card transition-colors text-center gap-2 shadow-sm group", item.color.split(' ').slice(2).join(' '))}>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform", item.color.split(' ').slice(0, 2).join(' '))}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="col-span-full lg:col-span-3">
          <RecentViolationsChart />
        </div>
      </div>

      {/* Leaderboard + Recent Alerts row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Leaderboard */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <CardTitle className="text-base">Top Performers</CardTitle>
              </div>
              <Link href="/analytics">
                <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <CardDescription>Ranked by average exam score</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet.</p>
            ) : (
              <div className="divide-y">
                {leaderboard.map(({ student, avg, avgIntegrity, examsCount }, i) => (
                  <Link key={student.id} href={`/students/${student.id}`} className="block group">
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <span className={cn("text-lg font-bold w-6 text-center shrink-0", trophyColors[i] || "text-muted-foreground")}>
                        {i < 3 ? <Trophy className="w-4 h-4 inline" /> : i + 1}
                      </span>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={student.avatarUrl} alt={student.name} />
                        <AvatarFallback className="text-xs">{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{examsCount} exam{examsCount !== 1 ? 's' : ''} · Integrity {avgIntegrity}/100</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-primary">{avg}%</p>
                        <p className="text-xs text-muted-foreground">avg</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <CardTitle className="text-base">Recent Alerts</CardTitle>
              </div>
              <Link href="/alerts">
                <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <CardDescription>Latest integrity signals from all sessions</CardDescription>
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
                        "w-2 h-2 rounded-full mt-2 shrink-0",
                        notif.type === 'danger' ? "bg-red-500" : "bg-amber-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
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
            <Button variant="ghost" size="sm" className="text-xs gap-1">All Exams <ArrowRight className="w-3 h-3" /></Button>
          </Link>
        </div>
        <ExamList exams={mockExams.filter(e => e.status === 'live' || e.status === 'upcoming')} />
      </div>
    </div>
  );
}
