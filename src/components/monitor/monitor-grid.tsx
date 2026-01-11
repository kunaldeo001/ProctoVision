'use client';

import { useState, useEffect } from 'react';
import type { Exam, User, MalpracticeEvent, RiskLevel, StudentSession } from '@/lib/types';
import { StudentMonitorCard } from './student-monitor-card';

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

type MonitorGridProps = {
  exam: Exam;
  students: User[];
};

export function MonitorGrid({ exam, students }: MonitorGridProps) {
  const [sessions, setSessions] = useState<Record<string, StudentSession>>(() => {
    const initialSessions: Record<string, StudentSession> = {};
    students.forEach(student => {
      initialSessions[student.id] = {
        studentId: student.id,
        totalScore: 0,
        riskLevel: 'Low',
        events: [],
      };
    });
    return initialSessions;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSessions(prevSessions => {
        const newSessions = { ...prevSessions };
        
        // Randomly pick a student to have an event
        if (Math.random() > 0.5) {
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
          const updatedEvents = [newEvent, ...oldSession.events];
          const newTotalScore = oldSession.totalScore + newEvent.score;

          newSessions[studentId] = {
            ...oldSession,
            events: updatedEvents,
            totalScore: newTotalScore,
            riskLevel: getRiskLevel(newTotalScore),
          };
        }
        
        return newSessions;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [exam.id, students]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {students.map(student => (
        <StudentMonitorCard 
          key={student.id} 
          student={student}
          session={sessions[student.id]}
        />
      ))}
    </div>
  );
}
