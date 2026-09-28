'use client';
import { mockExams, mockUsers } from "@/lib/mock-data";
import { notFound, useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Timer, Bookmark, BookmarkCheck, WifiOff, CloudUpload, Maximize2, ShieldOff } from 'lucide-react';
import { ProctoringHandler } from '@/components/exam/proctoring-handler';
import { WebcamFeed } from "@/components/exam/webcam-feed";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { ViolationType } from "@/lib/types";
import { MalpracticeChecker } from "@/lib/proctoring";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ExamTakePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const exam = mockExams.find((e) => e.id === params.id);
  const student = mockUsers.find(u => u.role === 'student');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number[]>>({});
  const [reviewMarks, setReviewMarks] = useState<Set<string>>(new Set());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState((exam?.duration || 0) * 60);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sensitivity, setSensitivity] = useState<'standard' | 'high' | 'ultra'>('high');
  
  const [proctoringStatus, setProctoringStatus] = useState({
    noFaceDetected: false,
    multiplePeopleDetected: false,
    phoneDetected: false,
    gazeAway: false,
  });

  const malpracticeChecker = useMemo(() => {
    if (!student || !exam) return null;
    return new MalpracticeChecker(student.id, exam.id);
  }, [student, exam]);
  
  const [proctoringReport, setProctoringReport] = useState(() => malpracticeChecker?.getReport());

  const { toast } = useToast();
  const [warning75Issued, setWarning75Issued] = useState(false);
  const isSubmittedRef = useRef(false);

  const handleSubmit = useCallback((autoSubmit = false) => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setShowConfirmation(false);

    // Exit fullscreen on submit
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    if (autoSubmit) {
      toast({
        variant: "destructive",
        title: "Exam Terminated",
        description: "Your exam has been automatically submitted.",
      });
    } else {
      toast({
        title: "Exam Submitted Successfully",
        description: "Your responses have been recorded.",
      });
    }
    
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  }, [answers, proctoringReport, router, toast]);

  const addMalpracticeEvent = useCallback((type: ViolationType) => {
    if (!malpracticeChecker || isSubmittedRef.current) return;
    malpracticeChecker.addViolation(type);
    setProctoringReport(malpracticeChecker.getReport());

    if (malpracticeChecker.isOverThreshold()) {
      if (!isSubmittedRef.current) handleSubmit(true);
    } else if (malpracticeChecker.isAtWarningThreshold() && !warning75Issued) {
      toast({
        variant: 'destructive',
        title: 'High Malpractice Warning',
        description: 'Integrity score critical. Further violations will auto-submit your exam.',
      });
      setWarning75Issued(true);
    }
  }, [malpracticeChecker, warning75Issued, toast, handleSubmit]);

  const handleSimulateViolation = useCallback((type: 'PHONE_DETECTED' | 'MULTIPLE_PEOPLE' | 'NO_FACE_DETECTED' | 'GAZE_AWAY') => {
    addMalpracticeEvent(type);
    setProctoringStatus(prev => ({
      ...prev,
      phoneDetected: type === 'PHONE_DETECTED',
      multiplePeopleDetected: type === 'MULTIPLE_PEOPLE',
      noFaceDetected: type === 'NO_FACE_DETECTED',
      gazeAway: type === 'GAZE_AWAY',
    }));
    setTimeout(() => {
      setProctoringStatus(prev => ({
        ...prev,
        phoneDetected: false,
        multiplePeopleDetected: false,
        noFaceDetected: false,
        gazeAway: false,
      }));
    }, 4500);
  }, [addMalpracticeEvent]);

  // Countdown timer
  useEffect(() => {
    if (!exam || isSubmittedRef.current) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isSubmittedRef.current) handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam, handleSubmit]);

  // Tab visibility, focus loss & network detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittedRef.current) {
        addMalpracticeEvent('TAB_SWITCH');
        toast({
          variant: 'destructive',
          title: '⚠️ Tab Switch Detected',
          description: 'Navigating away from the exam tab is recorded as an integrity violation (+15 pts).',
        });
      }
    };
    const handleBlur = () => {
      if (!isSubmittedRef.current) {
        addMalpracticeEvent('TAB_SWITCH');
        toast({
          variant: 'destructive',
          title: '⚠️ Window Focus Lost',
          description: 'Leaving or clicking outside the exam application is flagged (+15 pts).',
        });
      }
    };
    const handleOnline = () => {
      setIsOffline(false);
      toast({ title: 'Connection restored', description: 'You are back online.' });
    };
    const handleOffline = () => setIsOffline(true);
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addMalpracticeEvent, toast]);

  // Anti-cheat: block right-click, copy, paste, keyboard shortcuts
  useEffect(() => {
    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({ variant: 'destructive', title: 'Action blocked', description: 'Right-click is disabled during the exam.' });
    };
    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({ variant: 'destructive', title: 'Action blocked', description: 'Copying is disabled during the exam.' });
    };
    const blockPaste = (e: ClipboardEvent) => e.preventDefault();
    const blockKeyCombo = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, PrintScreen
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        toast({ variant: 'destructive', title: 'Action blocked', description: 'This key combination is not allowed during the exam.' });
      }
    };

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('copy', blockCopy);
    document.addEventListener('paste', blockPaste);
    document.addEventListener('keydown', blockKeyCombo);

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('copy', blockCopy);
      document.removeEventListener('paste', blockPaste);
      document.removeEventListener('keydown', blockKeyCombo);
    };
  }, [toast]);

  // Fullscreen change detection → record violation
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      if (!isNowFullscreen && !isSubmittedRef.current) {
        addMalpracticeEvent('FULLSCREEN_EXIT');
        toast({
          variant: 'destructive',
          title: 'Fullscreen exited',
          description: 'Exiting fullscreen is flagged as a potential integrity violation.',
        });
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [addMalpracticeEvent, toast]);

  // Enter fullscreen
  const requestFullscreen = () => {
    document.documentElement.requestFullscreen().catch(() => {
      toast({ title: 'Fullscreen unavailable', description: 'Your browser did not allow fullscreen mode.' });
    });
  };

  if (!exam || !student || !proctoringReport) {
    notFound();
  }

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowConfirmation(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };
  
  const handleAnswerChange = (value: string | number[]) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    setLastSaved(new Date());
  };

  const toggleReviewMark = () => {
    const newMarks = new Set(reviewMarks);
    if (newMarks.has(currentQuestion.id)) newMarks.delete(currentQuestion.id);
    else newMarks.add(currentQuestion.id);
    setReviewMarks(newMarks);
  };

  const currentQuestion = exam.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;
  const timeWarning = timeLeft < 300; // last 5 minutes

  return (
    <div className="flex h-screen bg-muted flex-col select-none">
      {/* Status bars */}
      {isOffline && (
        <div className="bg-destructive text-destructive-foreground p-2 text-center text-sm font-semibold flex justify-center items-center gap-2 z-50">
          <WifiOff className="w-4 h-4" /> Connection interrupted — attempting to reconnect. Answers are saved locally.
        </div>
      )}
      {!isFullscreen && (
        <div className="bg-amber-500 text-white p-2 text-center text-sm font-semibold flex justify-center items-center gap-2">
          <ShieldOff className="w-4 h-4" />
          Fullscreen mode recommended for secure exam.
          <Button size="sm" variant="outline" className="h-6 text-xs border-white text-white hover:bg-white/20 hover:text-white ml-2" onClick={requestFullscreen}>
            <Maximize2 className="w-3 h-3 mr-1" /> Enter Fullscreen
          </Button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Main exam area */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          <Card className="flex-1 flex flex-col shadow-lg border-primary/10">
            <CardHeader className="bg-background rounded-t-lg border-b sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="font-headline text-xl">{exam.title}</CardTitle>
                  <CardDescription className="flex items-center gap-3 mt-1 flex-wrap">
                    <span>Q{currentQuestionIndex + 1} of {totalQuestions}</span>
                    <span className="text-emerald-600 font-medium">{answeredCount} answered</span>
                    <span className="text-amber-600">{totalQuestions - answeredCount} remaining</span>
                    {reviewMarks.size > 0 && (
                      <span className="text-amber-500">{reviewMarks.size} marked for review</span>
                    )}
                    {lastSaved && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <CloudUpload className="w-3 h-3" /> Saved {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleReviewMark}
                    className={cn(
                      "transition-colors",
                      reviewMarks.has(currentQuestion.id)
                        ? "text-amber-600 border-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                        : ""
                    )}
                  >
                    {reviewMarks.has(currentQuestion.id)
                      ? <BookmarkCheck className="w-4 h-4 mr-1.5" />
                      : <Bookmark className="w-4 h-4 mr-1.5" />}
                    {reviewMarks.has(currentQuestion.id) ? "Marked" : "Mark for Review"}
                  </Button>
                  <div className={cn(
                    "flex items-center gap-2 text-lg font-bold px-4 py-2 rounded-lg transition-colors",
                    timeWarning
                      ? "text-red-600 bg-red-500/15 animate-pulse"
                      : "text-destructive bg-destructive/10"
                  )}>
                    <Timer className="w-5 h-5" />
                    <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-8">
              <div className="space-y-8 max-w-3xl">
                {/* Question */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {currentQuestionIndex + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-medium">{currentQuestion.text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs uppercase font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">{currentQuestion.type.replace('-', ' ')}</span>
                      <span className="text-xs text-muted-foreground">{currentQuestion.marks} mark{currentQuestion.marks !== 1 ? 's' : ''}</span>
                      {currentQuestion.type === 'multi-select' && (
                        <span className="text-xs text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">Select all that apply</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Answer options */}
                <div className="pl-12">
                  {currentQuestion.type === 'multi-select' ? (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => {
                        const currentAns = (answers[currentQuestion.id] as number[]) || [];
                        const isChecked = currentAns.includes(index);
                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              isChecked
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-muted/50"
                            )}
                            onClick={() => {
                              const newAns = isChecked
                                ? currentAns.filter(a => a !== index)
                                : [...currentAns, index];
                              handleAnswerChange(newAns);
                            }}
                          >
                            <Checkbox
                              id={`option-${index}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const newAns = checked
                                  ? [...currentAns, index]
                                  : currentAns.filter(a => a !== index);
                                handleAnswerChange(newAns);
                              }}
                            />
                            <Label htmlFor={`option-${index}`} className="text-base flex-1 cursor-pointer">{option}</Label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <RadioGroup
                      value={answers[currentQuestion.id] as string}
                      onValueChange={handleAnswerChange}
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option, index) => {
                        const val = `option-${index}`;
                        const isSelected = answers[currentQuestion.id] === val;
                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-muted/50"
                            )}
                            onClick={() => handleAnswerChange(val)}
                          >
                            <RadioGroupItem value={val} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="text-base flex-1 cursor-pointer">{option}</Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}
                </div>
              </div>
            </CardContent>

            <div className="p-4 border-t bg-muted/20 flex justify-between gap-2 rounded-b-lg">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="w-32">
                ← Previous
              </Button>
              <Button
                onClick={handleNext}
                className="w-32"
                variant={currentQuestionIndex === exam.questions.length - 1 ? 'default' : 'secondary'}
              >
                {currentQuestionIndex === exam.questions.length - 1 ? 'Submit ✓' : 'Next →'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="w-80 border-l bg-background p-5 flex flex-col gap-5 overflow-y-auto shadow-2xl">
          <WebcamFeed
            videoRef={videoRef}
            overlayCanvasRef={overlayCanvasRef}
            onReady={setIsCameraReady}
            sensitivity={sensitivity}
            onSensitivityChange={setSensitivity}
            proctoringStatus={proctoringStatus}
            onSimulateViolation={handleSimulateViolation}
          />
          
          <ProctoringHandler
            videoRef={videoRef}
            overlayCanvasRef={overlayCanvasRef}
            enabled={isCameraReady}
            sensitivity={sensitivity}
            onDetectionUpdate={setProctoringStatus}
            addMalpracticeEvent={addMalpracticeEvent}
            events={proctoringReport.events}
            totalScore={proctoringReport.totalScore}
            riskLevel={proctoringReport.riskLevel}
          />
          
          {/* Question navigator */}
          <div className="border rounded-xl p-4 bg-card">
            <h4 className="text-sm font-semibold mb-3">Question Navigator</h4>
            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  title={`Question ${idx + 1}${reviewMarks.has(q.id) ? ' (Marked for review)' : ''}${answers[q.id] !== undefined ? ' (Answered)' : ''}`}
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center border-2 transition-all",
                    currentQuestionIndex === idx ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'hover:scale-105',
                    reviewMarks.has(q.id)
                      ? 'bg-amber-500/20 border-amber-400 text-amber-700'
                      : answers[q.id] !== undefined
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-700'
                        : 'bg-muted border-border text-muted-foreground'
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-400 inline-block" />Answered</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-400 inline-block" />Review</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-muted border border-border inline-block" />Pending</span>
            </div>
          </div>
        </aside>
      </div>
      
      {/* Submit dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {Object.keys(answers).length < exam.questions.length && (
                <p className="text-destructive font-semibold">
                  ⚠️ You have {exam.questions.length - Object.keys(answers).length} unanswered question{exam.questions.length - Object.keys(answers).length !== 1 ? 's' : ''}.
                </p>
              )}
              {reviewMarks.size > 0 && (
                <p className="text-amber-600 font-medium">
                  📌 You have {reviewMarks.size} question{reviewMarks.size !== 1 ? 's' : ''} marked for review.
                </p>
              )}
              <p>Once submitted, you cannot change your answers. Are you sure?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirmation(false)}>Review Answers</Button>
            <AlertDialogAction asChild>
              <Button onClick={() => handleSubmit(false)}>Submit Exam</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
