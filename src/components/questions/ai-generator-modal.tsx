'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateQuestions } from '@/ai/flows/generate-questions';
import type { Question } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

type AiGeneratorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionsGenerated: (questions: Question[]) => void;
};

export function AiGeneratorModal({ open, onOpenChange, onQuestionsGenerated }: AiGeneratorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState('5');
  const [type, setType] = useState('mcq');
  const [marks, setMarks] = useState('10');

  const [generatedPreview, setGeneratedPreview] = useState<Question[] | null>(null);

  const handleGenerate = async () => {
    if (!subject || !topic) {
      setError("Subject and Topic are required.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedPreview(null);
    
    try {
      const result = await generateQuestions({
        subject,
        topic,
        difficulty: difficulty as any,
        count: parseInt(count, 10),
        type: type as any,
        marks: parseInt(marks, 10),
      });

      // Map output to our Question interface
      const newQuestions: Question[] = result.questions.map(q => ({
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: q.text,
        type: type as any,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        marks: parseInt(marks, 10),
        difficulty: difficulty as any,
        topic: topic,
        tags: [subject, 'AI_GENERATED'],
      }));

      setGeneratedPreview(newQuestions);
    } catch (e) {
      console.error(e);
      setError("AI generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = () => {
    if (generatedPreview) {
      onQuestionsGenerated(generatedPreview);
      setGeneratedPreview(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" /> AI Question Generator
          </DialogTitle>
          <DialogDescription>
            Specify parameters and our AI will generate questions for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 flex-1 overflow-y-auto">
          {!generatedPreview ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="e.g. Physics" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input placeholder="e.g. Thermodynamics" value={topic} onChange={e => setTopic(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="true-false">True/False</SelectItem>
                    <SelectItem value="multi-select">Multiple Select</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Input type="number" min="1" max="10" value={count} onChange={e => setCount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Marks per Question</Label>
                <Input type="number" min="1" value={marks} onChange={e => setMarks(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-4">
               <Alert className="bg-accent/10 text-accent border-accent/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Review Required</AlertTitle>
                <AlertDescription>
                  These questions are AI generated. Please review them carefully before adding to the bank.
                </AlertDescription>
              </Alert>
              <ScrollArea className="flex-1 rounded-md border p-4 max-h-[400px]">
                 <div className="space-y-6">
                    {generatedPreview.map((q, idx) => (
                      <div key={idx} className="space-y-2 border-b pb-4 last:border-0">
                         <div className="font-medium text-sm flex gap-2">
                            <span className="text-muted-foreground">{idx + 1}.</span> {q.text}
                         </div>
                         <div className="pl-6 space-y-1">
                            {q.options.map((opt, oIdx) => {
                               const isCorrect = Array.isArray(q.correctOption) ? q.correctOption.includes(oIdx) : q.correctOption === oIdx;
                               return (
                                 <div key={oIdx} className={`text-sm ${isCorrect ? 'text-success font-medium flex items-center gap-2' : 'text-muted-foreground'}`}>
                                    {isCorrect && <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>}
                                    {opt}
                                 </div>
                               )
                            })}
                         </div>
                         <div className="pl-6 text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
                           <strong>Explanation:</strong> {q.explanation}
                         </div>
                      </div>
                    ))}
                 </div>
              </ScrollArea>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive font-medium">{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          {!generatedPreview ? (
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Questions
            </Button>
          ) : (
             <>
               <Button variant="outline" onClick={() => setGeneratedPreview(null)}>Discard</Button>
               <Button onClick={handleApprove} className="bg-accent text-white hover:bg-accent/90">Add to Bank</Button>
             </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
