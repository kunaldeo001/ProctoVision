'use client';
import { mockExams, mockUsers } from "@/lib/mock-data";
import { notFound, useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Timer, Bookmark, BookmarkCheck, WifiOff, CloudUpload } from 'lucide-react';
import { ProctoringHandler } from '@/components/exam/proctoring-handler';
import { WebcamFeed } from "@/components/exam/webcam-feed";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { ViolationType } from "@/lib/types";
import { MalpracticeChecker } from "@/lib/proctoring";
import { useToast } from "@/hooks/use-toast";

export default function ExamTakePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const exam = mockExams.find((e) => e.id === params.id);
  const student = mockUsers.find(u => u.role === 'student');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // States for Phase 7
  const [answers, setAnswers] = useState<Record<string, string | number[]>>({});
  const [reviewMarks, setReviewMarks] = useState<Set<string>>(new Set());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState((exam?.duration || 0) * 60);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
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
    console.log("Exam submitted", answers, proctoringReport?.events);

    if (autoSubmit) {
      toast({
        variant: "destructive",
        title: "Exam Terminated",
        description: "Your exam has been automatically submitted due to excessive malpractice violations or time expiry.",
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
        if (!isSubmittedRef.current) {
            handleSubmit(true);
        }
    } else if (malpracticeChecker.isAtWarningThreshold() && !warning75Issued) {
      toast({
        variant: 'destructive',
        title: 'High Malpractice Warning',
        description: 'Your malpractice score is high. Further violations may lead to automatic submission.',
      });
      setWarning75Issued(true);
    }
  }, [malpracticeChecker, warning75Issued, toast, handleSubmit]);

  useEffect(() => {
    if (!exam || isSubmittedRef.current) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if(!isSubmittedRef.current) handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam, handleSubmit]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) addMalpracticeEvent('TAB_SWITCH');
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addMalpracticeEvent]);

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

  return (
    <div className="flex h-screen bg-muted flex-col">
      {isOffline && (
        <div className="bg-destructive text-destructive-foreground p-2 text-center text-sm font-semibold flex justify-center items-center gap-2">
          <WifiOff className="w-4 h-4" /> Connection interrupted — attempting to reconnect. Answers are saved locally.
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          <Card className="flex-1 flex flex-col shadow-lg border-primary/10">
            <CardHeader className="bg-background rounded-t-lg border-b sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="font-headline text-2xl">{exam.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                    <span className="text-primary font-medium">{answeredCount} Answered / {totalQuestions - answeredCount} Unanswered</span>
                    {lastSaved && (
                       <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                         <CloudUpload className="w-3 h-3" /> Last saved: {lastSaved.toLocaleTimeString()}
                       </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={toggleReviewMark} className={reviewMarks.has(currentQuestion.id) ? "text-warning border-warning bg-warning/10" : ""}>
                    {reviewMarks.has(currentQuestion.id) ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                    {reviewMarks.has(currentQuestion.id) ? "Marked for Review" : "Mark for Review"}
                  </Button>
                  <div className="flex items-center gap-2 text-lg font-bold text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
                    <Timer className="w-5 h-5" />
                     <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-8">
              <div className="space-y-8 max-w-3xl">
                <div className="flex items-start gap-4">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                     {currentQuestionIndex + 1}
                   </div>
                   <p className="text-xl font-medium pt-1">{currentQuestion.text}</p>
                </div>
                
                <div className="pl-12">
                  {currentQuestion.type === 'multi-select' ? (
                     <div className="space-y-4">
                       {currentQuestion.options.map((option, index) => {
                         const currentAns = (answers[currentQuestion.id] as number[]) || [];
                         return (
                           <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                             <Checkbox 
                               id={`option-${index}`} 
                               checked={currentAns.includes(index)}
                               onCheckedChange={(checked) => {
                                 const newAns = checked ? [...currentAns, index] : currentAns.filter(a => a !== index);
                                 handleAnswerChange(newAns);
                               }}
                             />
                             <Label htmlFor={`option-${index}`} className="text-base flex-1 cursor-pointer">{option}</Label>
                           </div>
                         )
                       })}
                     </div>
                  ) : (
                    <RadioGroup value={answers[currentQuestion.id] as string} onValueChange={handleAnswerChange} className="space-y-4">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value={`option-${index}`} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="text-base flex-1 cursor-pointer">{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t bg-muted/30 flex justify-between gap-2 rounded-b-lg">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="w-32">Previous</Button>
              <Button onClick={handleNext} className="w-32" variant={currentQuestionIndex === exam.questions.length - 1 ? 'default' : 'secondary'}>
                {currentQuestionIndex === exam.questions.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </div>
          </Card>
        </div>

        <aside className="w-80 border-l bg-background p-6 flex flex-col gap-6 overflow-y-auto shadow-2xl">
          <WebcamFeed 
            videoRef={videoRef} 
            onReady={setIsCameraReady}
            proctoringStatus={proctoringStatus}
          />
          
          <ProctoringHandler 
            videoRef={videoRef}
            enabled={isCameraReady}
            onDetectionUpdate={setProctoringStatus}
            addMalpracticeEvent={addMalpracticeEvent}
            events={proctoringReport.events}
            totalScore={proctoringReport.totalScore}
            riskLevel={proctoringReport.riskLevel}
          />
          
          <div className="border rounded-lg p-4 bg-card mt-auto">
             <h4 className="text-sm font-semibold mb-3">Question Navigator</h4>
             <div className="grid grid-cols-5 gap-2">
               {exam.questions.map((q, idx) => (
                  <button 
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-8 w-8 rounded text-xs font-semibold flex items-center justify-center border transition-colors ${
                      currentQuestionIndex === idx ? 'ring-2 ring-primary ring-offset-2' : ''
                    } ${
                      reviewMarks.has(q.id) ? 'bg-warning/20 border-warning text-warning-foreground' :
                      answers[q.id] !== undefined ? 'bg-success/20 border-success text-success-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {idx + 1}
                  </button>
               ))}
             </div>
          </div>
        </aside>
      </div>
      
       <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
            <AlertDialogDescription>
              {Object.keys(answers).length < exam.questions.length && (
                 <p className="text-destructive font-semibold mb-2">
                   Warning: You have {exam.questions.length - Object.keys(answers).length} unanswered questions.
                 </p>
              )}
              You cannot change your answers after submitting. Please review your answers before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirmation(false)}>Cancel</Button>
            <AlertDialogAction asChild>
                <Button onClick={() => handleSubmit(false)}>Submit Exam</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
