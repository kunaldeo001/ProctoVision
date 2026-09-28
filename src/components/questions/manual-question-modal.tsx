'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Sparkles, BookOpen, HelpCircle } from 'lucide-react';
import type { Question } from '@/lib/types';
import { createQuestionApi, updateQuestionApi } from '@/lib/question-service';
import { useToast } from '@/hooks/use-toast';

type ManualQuestionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionToEdit?: Question | null;
  onQuestionSaved: (question: Question, isEdit: boolean) => void;
  existingTopics?: string[];
};

export function ManualQuestionModal({
  open,
  onOpenChange,
  questionToEdit,
  onQuestionSaved,
  existingTopics = ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Mathematics', 'Python', 'General'],
}: ManualQuestionModalProps) {
  const { toast } = useToast();
  const isEdit = Boolean(questionToEdit);

  // Form states
  const [text, setText] = useState('');
  const [type, setType] = useState<Question['type']>('mcq');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState<number>(0);
  const [multiCorrect, setMultiCorrect] = useState<number[]>([0]);
  const [correctTextAnswer, setCorrectTextAnswer] = useState('');
  const [topic, setTopic] = useState('Machine Learning');
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Question['difficulty']>('medium');
  const [marks, setMarks] = useState<number>(10);
  const [explanation, setExplanation] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset or populate form when opening/editing
  useEffect(() => {
    if (open) {
      setValidationError(null);
      if (questionToEdit) {
        setText(questionToEdit.text);
        setType(questionToEdit.type);
        setOptions(questionToEdit.options.length ? questionToEdit.options : ['', '']);
        if (questionToEdit.type === 'multi-select') {
          setMultiCorrect(
            Array.isArray(questionToEdit.correctOption)
              ? questionToEdit.correctOption
              : [questionToEdit.correctOption ?? 0]
          );
        } else {
          setCorrectOption(
            typeof questionToEdit.correctOption === 'number' ? questionToEdit.correctOption : 0
          );
        }
        setCorrectTextAnswer(questionToEdit.correctTextAnswer || '');
        if (existingTopics.includes(questionToEdit.topic)) {
          setTopic(questionToEdit.topic);
          setCustomTopic('');
        } else {
          setTopic('__custom__');
          setCustomTopic(questionToEdit.topic);
        }
        setDifficulty(questionToEdit.difficulty);
        setMarks(questionToEdit.marks || 10);
        setExplanation(questionToEdit.explanation || '');
        setTags(questionToEdit.tags || []);
      } else {
        // Defaults for new entry
        setText('');
        setType('mcq');
        setOptions(['Option A', 'Option B', 'Option C', 'Option D']);
        setCorrectOption(0);
        setMultiCorrect([0]);
        setCorrectTextAnswer('');
        setTopic(existingTopics[0] || 'Machine Learning');
        setCustomTopic('');
        setDifficulty('medium');
        setMarks(10);
        setExplanation('');
        setTags(['New']);
      }
    }
  }, [open, questionToEdit, existingTopics]);

  // Adjust options when type changes
  const handleTypeChange = (newType: Question['type']) => {
    setType(newType);
    if (newType === 'true-false') {
      setOptions(['True', 'False']);
      setCorrectOption(0);
    } else if (newType === 'short-answer') {
      setOptions([]);
    } else if (options.length < 2) {
      setOptions(['Option 1', 'Option 2']);
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length >= 8) return;
    setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);

    if (correctOption === idx) {
      setCorrectOption(0);
    } else if (correctOption > idx) {
      setCorrectOption(correctOption - 1);
    }

    setMultiCorrect(prev =>
      prev
        .filter(i => i !== idx)
        .map(i => (i > idx ? i - 1 : i))
    );
  };

  const toggleMultiSelectOption = (idx: number) => {
    setMultiCorrect(prev => {
      if (prev.includes(idx)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter(i => i !== idx);
      } else {
        return [...prev, idx].sort((a, b) => a - b);
      }
    });
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!text.trim()) {
      setValidationError('Please enter a question statement.');
      return;
    }

    const finalTopic = topic === '__custom__' ? customTopic.trim() : topic;
    if (!finalTopic) {
      setValidationError('Please specify a valid topic.');
      return;
    }

    if (type === 'mcq' || type === 'multi-select') {
      if (options.some(opt => !opt.trim())) {
        setValidationError('All options must have content.');
        return;
      }
      if (options.length < 2) {
        setValidationError('At least 2 options are required.');
        return;
      }
    }

    if (type === 'short-answer' && !correctTextAnswer.trim()) {
      setValidationError('Please provide the expected correct answer / keywords.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Partial<Question> = {
        text: text.trim(),
        type,
        options: type === 'short-answer' ? [] : options.map(o => o.trim()),
        correctOption: type === 'multi-select' ? multiCorrect : correctOption,
        correctTextAnswer: type === 'short-answer' ? correctTextAnswer.trim() : undefined,
        topic: finalTopic,
        difficulty,
        marks: Number(marks) || 10,
        explanation: explanation.trim(),
        tags: tags.length > 0 ? tags : [finalTopic],
      };

      let savedQuestion: Question;
      if (isEdit && questionToEdit) {
        savedQuestion = await updateQuestionApi(questionToEdit.id, payload);
        toast({
          title: 'Question Updated',
          description: 'Your changes have been saved to the backend.',
        });
      } else {
        savedQuestion = await createQuestionApi(payload);
        toast({
          title: 'Question Created',
          description: 'The question was successfully added to the database.',
        });
      }

      onQuestionSaved(savedQuestion, isEdit);
      onOpenChange(false);
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to save question to backend. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b bg-card">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {isEdit ? 'Edit Question' : 'Manual Question Entry'}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? 'Update question details and save changes to the backend database.'
                  : 'Add a new custom question to your exam repository with instant backend persistence.'}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
              Backend Connected
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6 space-y-6">
            <div className="space-y-6 pr-3">
              {validationError && (
                <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/15 text-destructive border border-destructive/20 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Question Statement */}
              <div className="space-y-2">
                <Label htmlFor="q-statement" className="font-semibold flex items-center justify-between">
                  <span>Question Statement <span className="text-destructive">*</span></span>
                  <span className="text-xs text-muted-foreground">{text.length} characters</span>
                </Label>
                <Textarea
                  id="q-statement"
                  placeholder="e.g. Which of the following loss functions is most suitable for binary classification tasks?"
                  rows={3}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="resize-y min-h-[85px] bg-background focus-visible:ring-primary"
                  required
                />
              </div>

              {/* Type & Difficulty & Marks Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Question Type</Label>
                  <Select value={type} onValueChange={(val: any) => handleTypeChange(val)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Single Choice (MCQ)</SelectItem>
                      <SelectItem value="multi-select">Multiple Select</SelectItem>
                      <SelectItem value="true-false">True / False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Difficulty Level</Label>
                  <div className="flex rounded-md border p-1 bg-muted/40 gap-1">
                    {(['easy', 'medium', 'hard'] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={`flex-1 text-xs py-1.5 rounded font-medium capitalize transition-all ${
                          difficulty === lvl
                            ? lvl === 'easy'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : lvl === 'medium'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-rose-600 text-white shadow-sm'
                            : 'hover:bg-background/80 text-muted-foreground'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="q-marks" className="font-semibold">Points / Marks</Label>
                  <Input
                    id="q-marks"
                    type="number"
                    min={1}
                    max={100}
                    value={marks}
                    onChange={e => setMarks(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Options Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold flex items-center gap-1.5">
                    <span>Options & Answer Key <span className="text-destructive">*</span></span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {type === 'mcq' && '(Select radio button for the correct answer)'}
                      {type === 'multi-select' && '(Check all correct answers)'}
                      {type === 'true-false' && '(Pick the correct truth state)'}
                      {type === 'short-answer' && '(Provide the reference answer)'}
                    </span>
                  </Label>
                  {(type === 'mcq' || type === 'multi-select') && options.length < 8 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="h-8 text-xs gap-1 border-dashed"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Option
                    </Button>
                  )}
                </div>

                {/* MCQ Mode */}
                {type === 'mcq' && (
                  <RadioGroup
                    value={correctOption.toString()}
                    onValueChange={v => setCorrectOption(parseInt(v, 10))}
                    className="space-y-2"
                  >
                    {options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                          correctOption === idx
                            ? 'border-primary/60 bg-primary/5'
                            : 'border-border/70 hover:border-border'
                        }`}
                      >
                        <RadioGroupItem value={idx.toString()} id={`opt-radio-${idx}`} className="shrink-0" />
                        <span className="text-xs font-bold text-muted-foreground w-5">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <Input
                          value={opt}
                          onChange={e => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                          className="flex-1 h-9 bg-background"
                          required
                        />
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOption(idx)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Multi-Select Mode */}
                {type === 'multi-select' && (
                  <div className="space-y-2">
                    {options.map((opt, idx) => {
                      const isChecked = multiCorrect.includes(idx);
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                            isChecked
                              ? 'border-primary/60 bg-primary/5'
                              : 'border-border/70 hover:border-border'
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleMultiSelectOption(idx)}
                            id={`multi-chk-${idx}`}
                            className="shrink-0"
                          />
                          <span className="text-xs font-bold text-muted-foreground w-5">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <Input
                            value={opt}
                            onChange={e => handleOptionChange(idx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                            className="flex-1 h-9 bg-background"
                            required
                          />
                          {options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(idx)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* True / False Mode */}
                {type === 'true-false' && (
                  <div className="grid grid-cols-2 gap-3">
                    {['True', 'False'].map((val, idx) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCorrectOption(idx)}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 text-left font-medium transition-all ${
                          correctOption === idx
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <span className="text-base font-semibold">{val}</span>
                        {correctOption === idx && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Short Answer Mode */}
                {type === 'short-answer' && (
                  <div className="space-y-2">
                    <Textarea
                      value={correctTextAnswer}
                      onChange={e => setCorrectTextAnswer(e.target.value)}
                      placeholder="Enter expected keywords or reference solution for manual/automated grading..."
                      rows={2}
                      className="bg-background"
                    />
                  </div>
                )}
              </div>

              {/* Topic & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="font-semibold">Subject / Topic</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingTopics.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                      <SelectItem value="__custom__">+ Enter Custom Topic</SelectItem>
                    </SelectContent>
                  </Select>
                  {topic === '__custom__' && (
                    <Input
                      placeholder="e.g. Natural Language Processing"
                      value={customTopic}
                      onChange={e => setCustomTopic(e.target.value)}
                      className="mt-2 bg-background animate-in fade-in"
                      autoFocus
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag and press Enter"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="bg-background"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1 min-h-[28px]">
                    {tags.map(t => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="text-xs gap-1 pl-2 pr-1.5 py-0.5"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-destructive ml-0.5 rounded-full"
                        >
                          &times;
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-2 pt-2">
                <Label htmlFor="q-explanation" className="font-semibold flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Explanation & Solution Rationale (Optional)</span>
                </Label>
                <Textarea
                  id="q-explanation"
                  placeholder="Explain why this answer is correct. This will be shown to students in post-exam review."
                  rows={2}
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  className="bg-background resize-y"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Save to Bank'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
