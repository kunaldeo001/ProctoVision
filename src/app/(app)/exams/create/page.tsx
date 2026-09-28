'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { mockQuestions, mockUsers } from '@/lib/mock-data';
import type { Question, Exam } from '@/lib/types';
import { CheckCircle2, ChevronRight, ChevronLeft, Save, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchQuestions } from '@/lib/question-service';
import { createExamApi } from '@/lib/exam-service';
import { ManualQuestionModal } from '@/components/questions/manual-question-modal';

const steps = [
  "Basic Info",
  "Select Questions",
  "Settings",
  "Proctoring",
  "Students",
  "Review & Publish"
];

export default function ExamBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Artificial Intelligence');
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState('60');
  const [passingPercentage, setPassingPercentage] = useState('50');
  const [proctoringLevel, setProctoringLevel] = useState<'none' | 'standard' | 'strict'>('standard');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [isPublishing, setIsPublishing] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Load questions dynamically from backend
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchQuestions();
        setQuestions(data);
      } catch (e) {
        console.error('Could not fetch questions for builder:', e);
      }
    }
    load();
  }, []);

  const handleNext = () => {
    if (currentStep === 0 && !title.trim()) {
      toast({
        variant: "destructive",
        title: "Title Required",
        description: "Please enter an exam title to proceed.",
      });
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Exam title cannot be empty.",
      });
      return;
    }

    setIsPublishing(true);
    try {
      const selectedQuestions = questions.filter(q => selectedQuestionIds.has(q.id));
      const payload: Partial<Exam> = {
        title: title.trim(),
        description: description.trim(),
        subject,
        duration: parseInt(duration, 10) || 60,
        passingPercentage: parseInt(passingPercentage, 10) || 50,
        proctoringLevel,
        questions: selectedQuestions,
        studentIds: Array.from(selectedStudentIds),
        status: 'upcoming',
        totalMarks: selectedQuestions.reduce((acc, q) => acc + (q.marks || 10), 0) || 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      };

      await createExamApi(payload);

      toast({
        title: "Exam Published Successfully",
        description: "The exam and all selected questions are now live on the backend.",
      });
      router.push('/exams');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Publish Failed",
        description: err?.message || "Could not publish exam. Please retry.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleQuestion = (id: string) => {
    const newSet = new Set(selectedQuestionIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedQuestionIds(newSet);
  };

  const toggleStudent = (id: string) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedStudentIds(newSet);
  };

  const handleManualQuestionAdded = (newQ: Question) => {
    setQuestions(prev => [newQ, ...prev]);
    setSelectedQuestionIds(prev => new Set(prev).add(newQ.id));
  };

  const students = mockUsers.filter(u => u.role === 'student');

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Smart Exam Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure assessments, select or manually author questions, and publish to the backend.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -z-10 transform -translate-y-1/2 rounded-full"></div>
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
              idx === currentStep ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25' :
              idx < currentStep ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-background text-muted-foreground border-muted'
            }`}>
              {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
            </div>
            <span className={`text-xs font-medium hidden md:block ${idx === currentStep ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{step}</span>
          </div>
        ))}
      </div>

      <Card className="max-w-4xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">{steps[currentStep]}</CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title *</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. CS401: Advanced Machine Learning Final" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject / Course</Label>
                <Input 
                  id="subject" 
                  placeholder="e.g. Computer Science & AI" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description & Syllabus</Label>
                <Textarea 
                  id="desc" 
                  placeholder="Provide students with context on topics covered, required setup, etc." 
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <p className="text-sm font-medium text-muted-foreground">
                  Selected <span className="font-bold text-foreground">{selectedQuestionIds.size}</span> of {questions.length} questions
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsManualModalOpen(true)}
                  className="gap-1.5 border-dashed text-primary hover:bg-primary/5"
                >
                  <PlusCircle className="h-4 w-4" /> Add Manual Question
                </Button>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {questions.map(q => (
                  <div 
                    key={q.id} 
                    className={`flex items-start space-x-3 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                      selectedQuestionIds.has(q.id) ? 'bg-primary/5 border-primary/60 shadow-sm' : 'hover:bg-muted/40'
                    }`} 
                    onClick={() => toggleQuestion(q.id)}
                  >
                    <Checkbox checked={selectedQuestionIds.has(q.id)} className="mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-sm leading-snug mb-1.5">{q.text}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="uppercase font-semibold tracking-wider">{q.type}</span>
                        <span>•</span>
                        <span className="capitalize">{q.difficulty}</span>
                        <span>•</span>
                        <span className="font-semibold text-foreground/80">{q.marks} marks</span>
                        {q.topic && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-medium">{q.topic}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass">Passing Percentage (%)</Label>
                  <Input id="pass" type="number" min="1" max="100" value={passingPercentage} onChange={e => setPassingPercentage(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Proctoring Level</Label>
                <Select value={proctoringLevel} onValueChange={(val: any) => setProctoringLevel(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (No webcam required)</SelectItem>
                    <SelectItem value="standard">Standard (Face tracking, tab tracking)</SelectItem>
                    <SelectItem value="strict">Strict (Standard + Multi-person + Phone detection + Audio)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Strict proctoring enables the highest sensitivity AI model to ensure complete academic integrity.
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
               <div className="flex items-center gap-2 mb-4 p-2">
                 <Checkbox 
                   checked={selectedStudentIds.size === students.length && students.length > 0} 
                   onCheckedChange={(checked) => {
                     if (checked) setSelectedStudentIds(new Set(students.map(s => s.id)));
                     else setSelectedStudentIds(new Set());
                   }}
                 />
                 <Label className="font-semibold">Select All Students ({students.length})</Label>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map(s => (
                  <div key={s.id} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${selectedStudentIds.has(s.id) ? 'bg-primary/5 border-primary/50' : 'hover:bg-muted/50'}`} onClick={() => toggleStudent(s.id)}>
                    <Checkbox checked={selectedStudentIds.has(s.id)} />
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                         <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                 <div>
                    <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-1">Title</h4>
                    <p className="font-medium text-sm truncate">{title || 'Untitled Exam'}</p>
                 </div>
                 <div>
                    <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-1">Duration</h4>
                    <p className="font-medium text-sm">{duration} minutes</p>
                 </div>
                 <div>
                    <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-1">Proctoring</h4>
                    <p className="font-medium text-sm capitalize">{proctoringLevel}</p>
                 </div>
                 <div>
                    <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-1">Passing Grade</h4>
                    <p className="font-medium text-sm">{passingPercentage}%</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2">Selected Questions ({selectedQuestionIds.size})</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                       {Array.from(selectedQuestionIds).slice(0, 3).map(id => {
                         const q = questions.find(mq => mq.id === id);
                         return <li key={id} className="truncate">{q?.text}</li>
                       })}
                       {selectedQuestionIds.size > 3 && <li>...and {selectedQuestionIds.size - 3} more</li>}
                       {selectedQuestionIds.size === 0 && <li>No questions selected</li>}
                    </ul>
                 </div>
                 <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2">Assigned Students ({selectedStudentIds.size})</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                       {Array.from(selectedStudentIds).slice(0, 3).map(id => {
                         const u = mockUsers.find(mu => mu.id === id);
                         return <li key={id} className="truncate">{u?.name}</li>
                       })}
                       {selectedStudentIds.size > 3 && <li>...and {selectedStudentIds.size - 3} more</li>}
                       {selectedStudentIds.size === 0 && <li>No students assigned</li>}
                    </ul>
                 </div>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6 bg-muted/10 rounded-b-lg">
          <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0 || isPublishing}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {currentStep < steps.length - 1 ? (
             <Button onClick={handleNext}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
             </Button>
          ) : (
             <Button 
               onClick={handlePublish} 
               disabled={isPublishing} 
               className="bg-emerald-600 text-white hover:bg-emerald-700 min-w-[140px]"
             >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Publish Exam
                  </>
                )}
             </Button>
          )}
        </CardFooter>
      </Card>

      {/* Manual question creation from inside builder */}
      <ManualQuestionModal
        open={isManualModalOpen}
        onOpenChange={setIsManualModalOpen}
        onQuestionSaved={(q) => handleManualQuestionAdded(q)}
      />
    </div>
  );
}
