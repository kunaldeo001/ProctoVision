import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart, BookOpen, ShieldAlert, GraduationCap, Users } from 'lucide-react';
import { ExamList } from "@/components/dashboard/exam-list";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentViolationsChart } from "@/components/dashboard/recent-violations-chart";
import { mockExams, mockReports, mockUsers } from "@/lib/mock-data";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const liveExams = mockExams.filter(e => e.status === 'live').length;
  const completedExams = mockExams.filter(e => e.status === 'completed').length;
  
  const totalStudentsInLiveExams = mockExams
    .filter(e => e.status === 'live')
    .reduce((sum, exam) => sum + exam.studentIds.length, 0);
    
  const highRiskAlerts = mockReports.filter(r => r.riskLevel === 'High').length;
  
  const avgScore = Math.round(mockReports.reduce((acc, curr) => acc + curr.percentage, 0) / (mockReports.length || 1));
  const totalStudents = mockUsers.filter(u => u.role === 'student').length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight font-headline">
             Command Center
           </h1>
           <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/exams/create">
            <Button className="shadow-lg shadow-primary/20">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Exam
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Live Exams"
          value={liveExams.toString()}
          icon={<BookOpen className="h-4 w-4 text-primary" />}
          description="Currently active sessions"
        />
        <StatCard
          title="Active Students"
          value={totalStudentsInLiveExams.toString()}
          icon={<Users className="h-4 w-4 text-primary" />}
          description="Monitoring in real-time"
        />
        <StatCard
          title="High-Risk Alerts"
          value={highRiskAlerts.toString()}
          icon={<ShieldAlert className="h-4 w-4 text-destructive" />}
          description="Requires immediate review"
        />
        <StatCard
          title="Avg. Performance"
          value={`${avgScore}%`}
          icon={<GraduationCap className="h-4 w-4 text-success" />}
          description="Across all completed exams"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4">
           <Card className="shadow-sm h-full flex flex-col">
              <CardHeader className="pb-4 border-b">
                 <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                 <Link href="/exams/create" className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/30 transition-colors text-center gap-3 shadow-sm group">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                       <PlusCircle className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">New Exam</span>
                 </Link>
                 <Link href="/questions" className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-accent/5 hover:border-accent/30 transition-colors text-center gap-3 shadow-sm group">
                    <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                       <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">Question Bank</span>
                 </Link>
                 <Link href="/reports" className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-success/5 hover:border-success/30 transition-colors text-center gap-3 shadow-sm group">
                    <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                       <BarChart className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">Analytics</span>
                 </Link>
                 <Link href="/exams" className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-warning/5 hover:border-warning/30 transition-colors text-center gap-3 shadow-sm group">
                    <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center group-hover:scale-110 transition-transform">
                       <ShieldAlert className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">Manage Exams</span>
                 </Link>
              </CardContent>
           </Card>
        </div>
        <div className="col-span-full lg:col-span-3">
          <RecentViolationsChart />
        </div>
      </div>
      
      <div className="pt-4">
        <h2 className="text-xl font-bold tracking-tight font-headline mb-4">Live & Upcoming Exams</h2>
        <ExamList exams={mockExams.filter(e => e.status === 'live' || e.status === 'upcoming')} />
      </div>
    </div>
  );
}
