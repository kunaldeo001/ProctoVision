'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Timer,
  Bookmark,
  BookmarkCheck,
  WifiOff,
  CloudUpload,
  Maximize2,
  ShieldOff,
  Smartphone,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ProctoringHandler } from '@/components/exam/proctoring-handler';
import { WebcamFeed } from '@/components/exam/webcam-feed';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ViolationType, Exam } from '@/lib/types';
import { mockExams, mockUsers } from '@/lib/mock-data';
import { MalpracticeChecker } from '@/lib/proctoring';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { fetchExams } from '@/lib/exam-service';
import { Progress } from '@/components/ui/progress';

export default function ExamTakePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [exam, setExam] = useState<Exam | null>(() => {
    return mockExams.find(e => e.id === params.id) || null;
  });
  const [isLoadingExam, setIsLoadingExam] = useState(!exam);
  const student = mockUsers.find(u => u.role === 'student') || mockUsers[0];

  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [reviewMarks, setReviewMarks] = useState<Set<string>>(new Set());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sensitivity, setSensitivity] = useState<'standard' | 'high' | 'ultra'>('high');
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const [proctoringStatus, setProctoringStatus] = useState({
    noFaceDetected: false,
    multiplePeopleDetected: false,
    phoneDetected: false,
    gazeAway: false,
  });

  // Fetch exam dynamically if not in mockExams
  useEffect(() => {
    async function loadExam() {
      try {
        const allExams = await fetchExams();
        const found = allExams.find(e => e.id === params.id);
        if (found) {
          setExam(found);
          setTimeLeft((found.duration || 60) * 60);
        }
      } catch (err) {
        console.error('Error fetching exam:', err);
      } finally {
        setIsLoadingExam(false);
      }
    }

    if (!exam) {
      loadExam();
    } else {
      setTimeLeft((exam.duration || 60) * 60);
      setIsLoadingExam(false);
    }
  }, [params.id, exam]);

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

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    if (autoSubmit) {
      toast({
        variant: 'destructive',
        title: 'Exam Terminated & Submitted',
        description: 'Exceeded maximum permitted malpractice threshold. Your exam has been locked and submitted for review.',
      });
    } else {
      toast({
        title: 'Exam Submitted Successfully',
        description: 'All answers recorded and integrity logs stored.',
      });
    }

    setTimeout(() => {
      router.push('/dashboard');
    }, 2200);
  }, [router, toast]);

  const addMalpracticeEvent = useCallback((type: ViolationType) => {
    if (!malpracticeChecker || isSubmittedRef.current) return;
    malpracticeChecker.addViolation(type);
    setProctoringReport(malpracticeChecker.getReport());

    if (malpracticeChecker.isOverThreshold()) {
      if (!isSubmittedRef.current) handleSubmit(true);
    } else if (malpracticeChecker.isAtWarningThreshold() && !warning75Issued) {
      toast({
        variant: 'destructive',
        title: '🚨 High Malpractice Warning',
        description: 'Integrity score critical (>75 pts). Further violations will immediately auto-terminate your session.',
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

  // Tab switch & focus loss detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittedRef.current) {
        addMalpracticeEvent('TAB_SWITCH');
        toast({
          variant: 'destructive',
          title: '⚠️ Tab Switch Detected',
          description: 'Navigating away from the exam window is recorded as an integrity violation (+15 pts).',
        });
      }
    };
    const handleBlur = () => {
      if (!isSubmittedRef.current) {
        addMalpracticeEvent('TAB_SWITCH');
        toast({
          variant: 'destructive',
          title: '⚠️ Window Focus Lost',
          description: 'Clicking outside the exam window has been flagged (+15 pts).',
        });
      }
    };
    const handleOnline = () => {
      setIsOffline(false);
      toast({ title: 'Connection Restored', description: 'Exam synchronization resumed.' });
    };
    const handleOffline = () => setIsOffline(true);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addMalpracticeEvent, toast]);

  // Anti-cheat keyboard & context menu hooks
  useEffect(() => {
    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({ variant: 'destructive', title: 'Action Disabled', description: 'Right-click menu is locked during the proctored test.' });
    };
    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({ variant: 'destructive', title: 'Action Disabled', description: 'Copying is prohibited during the exam.' });
    };
    const blockPaste = (e: ClipboardEvent) => e.preventDefault();
    const blockKeyCombo = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.metaKey && e.altKey && e.key === 'i') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        toast({ variant: 'destructive', title: 'Shortcut Blocked', description: 'Developer tools and screenshot shortcuts are disabled.' });
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

  // Fullscreen tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      if (!isNowFullscreen && !isSubmittedRef.current) {
        addMalpracticeEvent('FULLSCREEN_EXIT');
        toast({
          variant: 'destructive',
          title: 'Fullscreen Exited',
          description: 'Leaving fullscreen mode is flagged as an integrity risk (+15 pts).',
        });
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [addMalpracticeEvent, toast]);

  const requestFullscreen = () => {
    document.documentElement.requestFullscreen().catch(() => {
      toast({ title: 'Fullscreen Unavailable', description: 'Browser permissions did not allow fullscreen toggle.' });
    });
  };

  if (isLoadingExam) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">Loading proctored exam session...</p>
        </div>
      </div>
    );
  }

  if (!exam || !student || !proctoringReport) {
    notFound();
  }

  const currentQuestion = exam.questions[currentQuestionIndex] || exam.questions[0];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const timeWarning = timeLeft < 300; // Under 5 minutes

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

  const handleAnswerChange = (value: any) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    setLastSaved(new Date());
  };

  const toggleReviewMark = () => {
    if (!currentQuestion) return;
    const newMarks = new Set(reviewMarks);
    if (newMarks.has(currentQuestion.id)) newMarks.delete(currentQuestion.id);
    else newMarks.add(currentQuestion.id);
    setReviewMarks(newMarks);
  };

  return (
    <div className="flex h-screen bg-muted/20 flex-col select-none overflow-hidden font-sans">
      {/* Network offline alert */}
      {isOffline && (
        <div className="bg-destructive text-destructive-foreground p-2 text-center text-xs font-semibold flex justify-center items-center gap-2 z-50">
          <WifiOff className="w-4 h-4" /> Connection interrupted — attempting auto-reconnect. Responses stored securely in browser.
        </div>
      )}

      {/* Fullscreen reminder bar */}
      {!isFullscreen && (
        <div className="bg-amber-600 text-white px-4 py-1.5 text-center text-xs font-semibold flex justify-between items-center z-40 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldOff className="w-4 h-4" />
            <span>Secure exam mode active. For full academic integrity compliance, stay in fullscreen.</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[11px] border-white text-white hover:bg-white/20 hover:text-white"
            onClick={requestFullscreen}
          >
            <Maximize2 className="w-3 h-3 mr-1" /> Enter Fullscreen
          </Button>
        </div>
      )}

      {/* Urgent High-Visibility Phone Detection Banner */}
      {proctoringStatus.phoneDetected && (
        <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between text-xs md:text-sm font-bold shadow-xl animate-pulse z-50 border-b-2 border-white">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 animate-bounce shrink-0" />
            <span>
              🚨 IMMEDIATE WARNING: Mobile phone or handheld device identified by AI vision (+40 penalty points). Please remove the device immediately.
            </span>
          </div>
          <span className="bg-black/40 text-white text-xs px-2.5 py-1 rounded font-mono shrink-0">
            FLAGGED: PHONE
          </span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Main Exam Area */}
        <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 overflow-y-auto">
          <Card className="flex-1 flex flex-col shadow-md border-border">
            <CardHeader className="bg-card rounded-t-lg border-b sticky top-0 z-10 py-3.5 px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-headline text-lg md:text-xl font-bold">
                    {exam.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-3 mt-1 flex-wrap text-xs">
                    <span className="font-semibold text-foreground">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <span className="text-emerald-600 font-medium">
                      {answeredCount} answered
                    </span>
                    <span className="text-muted-foreground">
                      {totalQuestions - answeredCount} pending
                    </span>
                    {reviewMarks.size > 0 && (
                      <span className="text-amber-600 font-medium">
                        {reviewMarks.size} flagged for review
                      </span>
                    )}
                    {lastSaved && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <CloudUpload className="w-3 h-3" /> Saved {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  {/* Font scale buttons */}
                  <div className="hidden md:flex items-center gap-1 border rounded-md p-0.5 bg-muted/40">
                    <button
                      type="button"
                      onClick={() => setFontSizeLevel('normal')}
                      className={cn("px-2 py-0.5 text-xs rounded font-medium", fontSizeLevel === 'normal' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
                      title="Normal font size"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSizeLevel('large')}
                      className={cn("px-2 py-0.5 text-xs rounded font-bold", fontSizeLevel === 'large' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
                      title="Large font size"
                    >
                      A+
                    </button>
                  </div>

                  {/* Flag question button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleReviewMark}
                    className={cn(
                      "h-9 text-xs transition-colors",
                      currentQuestion && reviewMarks.has(currentQuestion.id)
                        ? "text-amber-600 border-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                        : ""
                    )}
                  >
                    {currentQuestion && reviewMarks.has(currentQuestion.id) ? (
                      <BookmarkCheck className="w-4 h-4 mr-1 text-amber-600" />
                    ) : (
                      <Bookmark className="w-4 h-4 mr-1" />
                    )}
                    {currentQuestion && reviewMarks.has(currentQuestion.id) ? "Flagged" : "Flag for Review"}
                  </Button>

                  {/* Timer display */}
                  <div
                    className={cn(
                      "flex items-center gap-2 text-base md:text-lg font-bold px-3.5 py-1.5 rounded-lg border transition-colors shadow-sm",
                      timeWarning
                        ? "text-red-600 bg-red-500/15 border-red-500 animate-pulse"
                        : "text-foreground bg-muted/50 border-border"
                    )}
                  >
                    <Timer className={cn("w-4 h-4 md:w-5 md:h-5", timeWarning ? "text-red-600" : "text-primary")} />
                    <span>
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar under header */}
              <div className="pt-2">
                <Progress value={progressPercent} className="h-1.5 bg-muted" />
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
              {currentQuestion ? (
                <div className="space-y-6 max-w-3xl">
                  {/* Question Prompt */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {currentQuestionIndex + 1}
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "font-semibold leading-relaxed text-foreground",
                          fontSizeLevel === 'normal' ? 'text-lg' : fontSizeLevel === 'large' ? 'text-xl' : 'text-2xl'
                        )}
                      >
                        {currentQuestion.text}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                        <span className="uppercase font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {currentQuestion.type?.replace('-', ' ')}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          {currentQuestion.marks} mark{currentQuestion.marks !== 1 ? 's' : ''}
                        </span>
                        {currentQuestion.topic && (
                          <span className="text-primary font-medium bg-primary/5 px-2 py-0.5 rounded">
                            {currentQuestion.topic}
                          </span>
                        )}
                        {currentQuestion.type === 'multi-select' && (
                          <span className="text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded font-medium">
                            Select all that apply
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Answers Section */}
                  <div className="pl-0 sm:pl-12 pt-2">
                    {/* 1. Multiple Select (Checkboxes) */}
                    {currentQuestion.type === 'multi-select' && (
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
                                  : "border-border hover:border-primary/40 hover:bg-muted/40"
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
                              <Label htmlFor={`option-${index}`} className="text-base flex-1 cursor-pointer font-normal">
                                {option}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 2. True / False */}
                    {currentQuestion.type === 'true-false' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['True', 'False'].map((choice, idx) => {
                          const isSelected = answers[currentQuestion.id] === choice;
                          return (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => handleAnswerChange(choice)}
                              className={cn(
                                "flex items-center justify-between p-5 rounded-xl border-2 text-left font-semibold text-lg transition-all",
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-sm text-primary"
                                  : "border-border hover:border-primary/40 hover:bg-muted/30 text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {choice === 'True' ? (
                                  <CheckCircle2 className={cn("w-6 h-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                                ) : (
                                  <XCircle className={cn("w-6 h-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                                )}
                                <span>{choice}</span>
                              </div>
                              {isSelected && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">Selected</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* 3. Short Answer */}
                    {currentQuestion.type === 'short-answer' && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Type your response here. Provide key terms and explanation..."
                          rows={6}
                          value={answers[currentQuestion.id] || ''}
                          onChange={e => handleAnswerChange(e.target.value)}
                          className="bg-background text-base resize-y focus-visible:ring-primary"
                        />
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{((answers[currentQuestion.id] || '') as string).trim().split(/\s+/).filter(Boolean).length} words</span>
                          <span>Auto-saved to cloud</span>
                        </div>
                      </div>
                    )}

                    {/* 4. Single Choice (MCQ Default) */}
                    {(currentQuestion.type === 'mcq' || !currentQuestion.type) && (
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
                                  : "border-border hover:border-primary/40 hover:bg-muted/40"
                              )}
                              onClick={() => handleAnswerChange(val)}
                            >
                              <RadioGroupItem value={val} id={`option-${index}`} />
                              <Label htmlFor={`option-${index}`} className="text-base flex-1 cursor-pointer font-normal">
                                <span className="font-bold text-muted-foreground mr-2">
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                {option}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    )}
                  </div>
                </div>
              ) : null}
            </CardContent>

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t bg-muted/10 flex justify-between items-center gap-2 rounded-b-lg">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="w-32 gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button onClick={handleNext} className="w-32 gap-1.5">
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowConfirmation(true)}
                    className="w-36 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    Submit Exam <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar: Proctoring & Question Grid */}
        <aside className="w-80 md:w-88 border-l bg-background p-4 flex flex-col gap-4 overflow-y-auto shadow-xl">
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

          {/* Question Navigator */}
          <div className="border rounded-xl p-4 bg-card shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Question Navigator</h4>
              <span className="text-xs text-muted-foreground">{answeredCount}/{totalQuestions} Done</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '' && (!Array.isArray(answers[q.id]) || answers[q.id].length > 0);
                const isFlagged = reviewMarks.has(q.id);
                const isCurrent = currentQuestionIndex === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    title={`Question ${idx + 1}${isFlagged ? ' (Flagged for review)' : ''}${isAnswered ? ' (Answered)' : ''}`}
                    className={cn(
                      "h-8 w-8 rounded-lg text-xs font-bold flex items-center justify-center border-2 transition-all relative",
                      isCurrent ? 'ring-2 ring-primary ring-offset-1 scale-105' : 'hover:scale-105',
                      isFlagged
                        ? 'bg-amber-500/20 border-amber-400 text-amber-700'
                        : isAnswered
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-700'
                        : 'bg-muted/50 border-border text-muted-foreground'
                    )}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground border-t pt-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-400 inline-block" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-400 inline-block" /> Flagged
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-muted border border-border inline-block" /> Pending
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Submit Proctored Exam?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              {totalQuestions - answeredCount > 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-semibold border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>You have {totalQuestions - answeredCount} unanswered question{totalQuestions - answeredCount !== 1 ? 's' : ''}.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-semibold border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All {totalQuestions} questions have been answered.</span>
                </div>
              )}

              {reviewMarks.size > 0 && (
                <p className="text-amber-600 text-xs font-medium">
                  📌 {reviewMarks.size} question{reviewMarks.size !== 1 ? 's are' : ' is'} flagged for review.
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Once submitted, your responses and AI proctoring report will be archived. You cannot re-enter the session.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirmation(false)}>
              Back to Exam
            </Button>
            <AlertDialogAction asChild>
              <Button onClick={() => handleSubmit(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Confirm & Submit
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
