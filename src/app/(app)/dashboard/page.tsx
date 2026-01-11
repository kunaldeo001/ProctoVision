import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart, BookOpen, ShieldAlert } from 'lucide-react';
import { ExamList } from "@/components/dashboard/exam-list";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentViolationsChart } from "@/components/dashboard/recent-violations-chart";
import { mockExams } from "@/lib/mock-data";

export default function DashboardPage() {
  const liveExams = mockExams.filter(e => e.status === 'live').length;
  const totalStudentsInLiveExams = mockExams
    .filter(e => e.status === 'live')
    .reduce((sum, exam) => sum + exam.studentIds.length, 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-background">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Admin Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Exam
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Live Exams"
          value={liveExams.toString()}
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          description="Currently active proctoring sessions"
        />
        <StatCard
          title="Students Monitored"
          value={totalStudentsInLiveExams.toString()}
          icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
          description="Total students in live exams"
        />
        <StatCard
          title="High-Risk Alerts"
          value="7"
          icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}
          description="Incidents requiring immediate attention"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4">
          <ExamList exams={mockExams} />
        </div>
        <div className="col-span-full lg:col-span-3">
          <RecentViolationsChart />
        </div>
      </div>
    </div>
  );
}
