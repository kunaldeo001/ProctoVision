'use client';

import { useState, useEffect } from 'react';
import { ExamList } from "@/components/dashboard/exam-list";
import { mockExams } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Layers } from 'lucide-react';
import Link from 'next/link';
import type { Exam } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { fetchExams, deleteExamApi, createExamApi } from '@/lib/exam-service';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>(mockExams);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadExams = async () => {
    setIsLoading(true);
    try {
      const data = await fetchExams();
      setExams(data);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteExamApi(id);
      setExams(prev => prev.filter(e => e.id !== id));
      toast({
        title: "Exam deleted",
        description: "The exam has been successfully deleted from the backend.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err?.message || "Failed to delete exam from backend.",
      });
    }
  };

  const handleArchive = (id: string) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, status: 'archived' } : e));
    toast({
      title: "Exam archived",
      description: "The exam is now archived.",
    });
  };

  const handleDuplicate = async (id: string) => {
    const examToDuplicate = exams.find(e => e.id === id);
    if (!examToDuplicate) return;
    const duplicatedExamData = {
      ...examToDuplicate,
      title: `${examToDuplicate.title} (Copy)`,
      status: 'draft' as const,
    };

    try {
      const saved = await createExamApi(duplicatedExamData);
      setExams(prev => [saved, ...prev]);
      toast({
        title: "Exam duplicated",
        description: "A draft copy has been created and saved to the backend.",
      });
    } catch {
      const localCopy: Exam = {
        ...duplicatedExamData,
        id: `copy-${Date.now()}`,
      };
      setExams(prev => [localCopy, ...prev]);
      toast({
        title: "Exam duplicated (Local)",
        description: "A draft copy has been created.",
      });
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/20 min-h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Exam Management
            </h1>
            <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-primary/5 text-primary border-primary/20">
              <Layers className="w-3.5 h-3.5" />
              {exams.length} Exams
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Build, schedule, monitor, and manage proctored assessments.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadExams}
            title="Refresh from backend"
            disabled={isLoading}
            className="h-9 w-9 text-muted-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Link href="/exams/create">
            <Button className="shadow-sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Exam
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <ExamList 
          exams={exams} 
          onDelete={handleDelete}
          onArchive={handleArchive}
          onDuplicate={handleDuplicate}
        />
      )}
    </div>
  );
}
