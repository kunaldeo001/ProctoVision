'use client';

import { useState } from 'react';
import { mockQuestions } from '@/lib/mock-data';
import type { Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Sparkles } from 'lucide-react';
import { QuestionList } from '@/components/questions/question-list';
import { AiGeneratorModal } from '@/components/questions/ai-generator-modal';
import { useToast } from '@/hooks/use-toast';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const { toast } = useToast();

  const handleAddQuestions = (newQuestions: Question[]) => {
    setQuestions(prev => [...newQuestions, ...prev]);
    toast({
      title: "Questions Added",
      description: `Successfully added ${newQuestions.length} AI-generated questions.`,
    });
    setIsAiModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast({
      title: "Question deleted",
      description: "The question has been removed from the bank.",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/20 min-h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Question Bank
        </h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-accent text-accent hover:bg-accent/10" onClick={() => setIsAiModalOpen(true)}>
             <Sparkles className="mr-2 h-4 w-4" /> AI Generate
          </Button>
          <Button>
             <PlusCircle className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>
      
      <QuestionList questions={questions} onDelete={handleDelete} />

      <AiGeneratorModal 
        open={isAiModalOpen} 
        onOpenChange={setIsAiModalOpen}
        onQuestionsGenerated={handleAddQuestions}
      />
    </div>
  );
}
