'use client';

import type { Question } from '@/lib/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Info, BookOpen, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuestionPreviewModalProps = {
  question: Question | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const difficultyStyle: Record<Question['difficulty'], string> = {
  easy: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  medium: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  hard: 'text-red-600 bg-red-500/10 border-red-500/30',
};

const typeLabel: Record<Question['type'], string> = {
  'mcq': 'Multiple Choice',
  'multi-select': 'Multi-Select',
  'true-false': 'True / False',
  'short-answer': 'Short Answer',
};

export function QuestionPreviewModal({ question, open, onOpenChange }: QuestionPreviewModalProps) {
  if (!question) return null;

  const correctOptions = Array.isArray(question.correctOption)
    ? question.correctOption
    : question.correctOption !== undefined ? [question.correctOption] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className={cn("text-xs capitalize", difficultyStyle[question.difficulty])}>
              {question.difficulty}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {typeLabel[question.type]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />{question.topic}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.marks} mark{question.marks !== 1 ? 's' : ''}
            </Badge>
          </div>
          <DialogTitle className="text-lg leading-snug">{question.text}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Answer options */}
          {question.type !== 'short-answer' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Options</p>
              {question.options.map((opt, i) => {
                const isCorrect = correctOptions.includes(i);
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 text-sm transition-colors",
                      isCorrect
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-border bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border",
                      isCorrect
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-background text-muted-foreground border-border"
                    )}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={cn("flex-1", isCorrect && "font-medium text-emerald-700")}>{opt}</span>
                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}

          {question.type === 'short-answer' && question.correctTextAnswer && (
            <div className="p-3 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10">
              <p className="text-xs font-semibold text-emerald-700 mb-1">Model Answer</p>
              <p className="text-sm text-emerald-800">{question.correctTextAnswer}</p>
            </div>
          )}

          {/* Explanation */}
          {question.explanation && (
            <>
              <Separator />
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
                    <p className="text-sm text-blue-800">{question.explanation}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {question.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
