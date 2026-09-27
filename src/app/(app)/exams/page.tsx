'use client';

import { useState } from 'react';
import { ExamList } from "@/components/dashboard/exam-list";
import { mockExams } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import type { Exam } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>(mockExams);
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    toast({
      title: "Exam deleted",
      description: "The exam has been successfully deleted.",
    });
  };

  const handleArchive = (id: string) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, status: 'archived' } : e));
    toast({
      title: "Exam archived",
      description: "The exam is now archived.",
    });
  };

  const handleDuplicate = (id: string) => {
    const examToDuplicate = exams.find(e => e.id === id);
    if (!examToDuplicate) return;
    const duplicatedExam: Exam = {
      ...examToDuplicate,
      id: `copy-${Date.now()}`,
      title: `${examToDuplicate.title} (Copy)`,
      status: 'draft',
    };
    setExams(prev => [duplicatedExam, ...prev]);
    toast({
      title: "Exam duplicated",
      description: "A draft copy has been created.",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/20 min-h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Exam Management
        </h1>
        <Link href="/exams/create">
          <Button>
             <PlusCircle className="mr-2 h-4 w-4" /> Create Exam
          </Button>
        </Link>
      </div>
      <ExamList 
        exams={exams} 
        onDelete={handleDelete}
        onArchive={handleArchive}
        onDuplicate={handleDuplicate}
      />
    </div>
  );
}
