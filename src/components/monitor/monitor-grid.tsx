'use client';

import { useState, useEffect } from 'react';
import type { Exam, User, MalpracticeEvent, RiskLevel, StudentSession } from '@/lib/types';
import { StudentMonitorCard } from './student-monitor-card';

type MonitorGridProps = {
  exam: Exam;
  students: User[];
  sessions: Record<string, StudentSession>;
};

export function MonitorGrid({ exam, students, sessions }: MonitorGridProps) {
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
