'use client';

import { ExamList } from "@/components/dashboard/exam-list";
import { mockExams } from "@/lib/mock-data";

export default function ExamsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-background">
        <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
            All Exams
            </h1>
        </div>
        <ExamList exams={mockExams} />
    </div>
  );
}
