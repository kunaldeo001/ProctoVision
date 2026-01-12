'use client';

import { mockExams, mockUsers } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { MonitorGrid } from "@/components/monitor/monitor-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";
import type { User, StudentSession } from "@/lib/types";
import { ReportGenerator } from "@/components/monitor/report-generator";
import { useState, useEffect } from "react";
import type { MalpracticeEvent, RiskLevel } from '@/lib/types';

const MALPRACTICE_WEIGHTS = {
  'No Face Detected': 20,
  'Multiple People': 30,
  'Gaze Away': 10,
  'Phone Detected': 40,
  'Tab Switch': 15,
};
const VIOLATION_TYPES = Object.keys(MALPRACTICE_WEIGHTS) as (keyof typeof MALPRACTICE_WEIGHTS)[];

const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 60) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
};

export default function ExamMonitorPage({ params }: { params: { id: string } }) {
  const exam = mockExams.find((e) => e.id === params.id);
  const [sessions, setSessions] = useState<Record<string, StudentSession>>(() => {
    const initialSessions: Record<string, StudentSession> = {};
    if (exam) {
      exam.studentIds.forEach(studentId => {
        initialSessions[studentId] = {
          studentId: studentId,
          totalScore: 0,
          riskLevel: 'Low',
          events: [],
        };
      });
    }
    return initialSessions;
  });

  if (!exam) {
    notFound();
  }
  
  const students = exam.studentIds
    .map(id => mockUsers.find(u => u.id === id))
    .filter((u): u is User => u !== undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessions(prevSessions => {
        const newSessions = { ...prevSessions };
        
        // Randomly pick a student to have an event
        if (Math.random() > 0.5 && students.length > 0) {
          const studentIndex = Math.floor(Math.random() * students.length);
          const studentId = students[studentIndex].id;
          
          const type = VIOLATION_TYPES[Math.floor(Math.random() * VIOLATION_TYPES.length)];
          const newEvent: MalpracticeEvent = {
            id: `evt-${Date.now()}`,
            studentId,
            examId: exam.id,
            type,
            score: MALPRACTICE_WEIGHTS[type],
            timestamp: Date.now(),
          };

          const oldSession = newSessions[studentId];
          if (oldSession) {
            const updatedEvents = [newEvent, ...oldSession.events];
            const newTotalScore = oldSession.totalScore + newEvent.score;

            newSessions[studentId] = {
              ...oldSession,
              events: updatedEvents,
              totalScore: newTotalScore,
              riskLevel: getRiskLevel(newTotalScore),
            };
          }
        }
        
        return newSessions;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [exam.id, students]);


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
