import { mockExams, mockUsers } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { MonitorGrid } from "@/components/monitor/monitor-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";
import type { User } from "@/lib/types";
import { ReportGenerator } from "@/components/monitor/report-generator";

export default function ExamMonitorPage({ params }: { params: { id: string } }) {
  const exam = mockExams.find((e) => e.id === params.id);

  if (!exam) {
    notFound();
  }

  const students = exam.studentIds
    .map(id => mockUsers.find(u => u.id === id))
    .filter((u): u is User => u !== undefined);

  return (
    <div className="flex flex-col h-screen bg-muted">
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <div>
          <h1 className="text-xl font-bold tracking-tight font-headline">{exam.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="capitalize">Live</Badge>
            <span className="text-sm text-muted-foreground">{students.length} students</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <ReportGenerator exam={exam} />
          <Button variant="destructive">
            <Power className="mr-2 h-4 w-4" /> End Exam
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <MonitorGrid exam={exam} students={students} />
      </main>
    </div>
  );
}
