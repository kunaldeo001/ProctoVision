'use client';

import { useState, useEffect, useMemo } from 'react';
import { mockQuestions } from '@/lib/mock-data';
import type { Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Sparkles, RefreshCw, Database } from 'lucide-react';
import { QuestionList } from '@/components/questions/question-list';
import { AiGeneratorModal } from '@/components/questions/ai-generator-modal';
import { ManualQuestionModal } from '@/components/questions/manual-question-modal';
import { useToast } from '@/hooks/use-toast';
import {
  fetchQuestions,
  bulkCreateQuestionsApi,
  deleteQuestionApi,
} from '@/lib/question-service';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchQuestions();
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const existingTopics = useMemo(() => {
    const set = new Set(questions.map(q => q.topic).filter(Boolean));
    return Array.from(set);
  }, [questions]);

  const handleManualQuestionSaved = (savedQuestion: Question, isEdit: boolean) => {
    if (isEdit) {
      setQuestions(prev => prev.map(q => (q.id === savedQuestion.id ? savedQuestion : q)));
    } else {
      setQuestions(prev => [savedQuestion, ...prev]);
    }
    setEditingQuestion(null);
  };

  const handleAddAiQuestions = async (newQuestions: Question[]) => {
    try {
      const saved = await bulkCreateQuestionsApi(newQuestions);
      setQuestions(prev => [...saved, ...prev]);
      toast({
        title: "AI Questions Saved",
        description: `Successfully added and saved ${saved.length} questions to the database.`,
      });
    } catch {
      // Fallback in-memory
      setQuestions(prev => [...newQuestions, ...prev]);
      toast({
        title: "Questions Added (Local)",
        description: `Added ${newQuestions.length} questions locally.`,
      });
    }
    setIsAiModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestionApi(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast({
        title: "Question deleted",
        description: "The question has been removed from the backend database.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err?.message || "Could not delete question from backend.",
      });
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsManualModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/20 min-h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Question Bank
            </h1>
            <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-primary/5 text-primary border-primary/20">
              <Database className="w-3.5 h-3.5" />
              {questions.length} Questions
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Create, manage, and AI-generate questions with automated backend synchronization.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadQuestions}
            title="Refresh from backend"
            disabled={isLoading}
            className="h-9 w-9 text-muted-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="outline"
            className="border-accent text-accent hover:bg-accent/10"
            onClick={() => setIsAiModalOpen(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" /> AI Generate
          </Button>

          <Button
            onClick={() => {
              setEditingQuestion(null);
              setIsManualModalOpen(true);
            }}
            className="shadow-sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <QuestionList
          questions={questions}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}

      {/* Manual Entry / Edit Question Modal */}
      <ManualQuestionModal
        open={isManualModalOpen}
        onOpenChange={open => {
          setIsManualModalOpen(open);
          if (!open) setEditingQuestion(null);
        }}
        questionToEdit={editingQuestion}
        onQuestionSaved={handleManualQuestionSaved}
        existingTopics={existingTopics}
      />

      {/* AI Generator Modal */}
      <AiGeneratorModal
        open={isAiModalOpen}
        onOpenChange={setIsAiModalOpen}
        onQuestionsGenerated={handleAddAiQuestions}
      />
    </div>
  );
}
