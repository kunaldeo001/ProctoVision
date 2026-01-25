'use client';

import { mockExams, mockUsers } from "@/lib/mock-data";
import { notFound, useParams } from "next/navigation";
import { MonitorGrid } from "@/components/monitor/monitor-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";
import type { User, StudentSession } from "@/lib/types";
import { ReportGenerator } from "@/components/monitor/report-generator";
import { useState, useEffect, useMemo, useRef } from "react";
import { MALPRACTICE_WEIGHTS, MalpracticeChecker } from "@/lib/proctoring";

const VIOLATION_TYPES = Object.keys(MALPRACTICE_WEIGHTS) as (keyof typeof MALPRACTICE_WEIGHTS)[];

export default function ExamMonitorPage() {
  const params = useParams<{ id: string }>();
  const exam = mockExams.find((e) => e.id === params.id);

  const students = useMemo(() => {
    if (!exam) return [];
    return exam.studentIds
      .map(id => mockUsers.find(u => u.id === id))
      .filter((u): u is User => u !== undefined);
  }, [exam]);
  
  const checkers = useRef<Record<string, MalpracticeChecker>>({});

  const [sessions, setSessions] = useState<Record<string, StudentSession>>(() => {
    const initialSessions: Record<string, StudentSession> = {};
    if (exam) {
      exam.studentIds.forEach(studentId => {
        checkers.current[studentId] = new MalpracticeChecker(studentId, exam.id);
        initialSessions[studentId] = checkers.current[studentId].getReport();
      });
    }
    return initialSessions;
  });

  if (!exam) {
    notFound();
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly pick a student to have an event
      if (Math.random() > 0.5 && students.length > 0) {
        const studentIndex = Math.floor(Math.random() * students.length);
        const studentId = students[studentIndex].id;
        
        const type = VIOLATION_TYPES[Math.floor(Math.random() * VIOLATION_TYPES.length)];
        
        const studentChecker = checkers.current[studentId];
        if (studentChecker) {
          studentChecker.addViolation(type);
          setSessions(prev => ({
            ...prev,
            [studentId]: studentChecker.getReport(),
          }));
        }
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [students, exam.id]);


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
           <ReportGenerator exam={exam} sessions={sessions} />
          <Button variant="destructive">
            <Power className="mr-2 h-4 w-4" /> End Exam
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <MonitorGrid exam={exam} students={students} sessions={sessions} />
      </main>
    </div>
  );
}
