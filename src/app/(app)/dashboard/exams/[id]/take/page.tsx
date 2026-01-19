'use client';
import { mockExams, mockUsers } from "@/lib/mock-data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Timer } from 'lucide-react';
import { ProctoringHandler } from '@/components/exam/proctoring-handler';
import { WebcamFeed } from "@/components/exam/webcam-feed";
import { useState, useRef, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ExamTakePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const exam = mockExams.find((e) => e.id === params.id);
  const student = mockUsers.find(u => u.role === 'student');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState((exam?.duration || 0) * 60);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [proctoringStatus, setProctoringStatus] = useState({
    noFaceDetected: false,
    multiplePeopleDetected: false,
  });


  useEffect(() => {
    if (!exam) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit logic can be added here
          setShowConfirmation(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam]);


  if (!exam || !student) {
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
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleSubmit = () => {
    setShowConfirmation(false);
    // Here you would typically save the answers
    console.log("Exam submitted", answers);
    router.push('/dashboard');
  };

  const currentQuestion = exam.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex h-screen bg-muted">
      <div className="flex-1 p-6 flex flex-col gap-6">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline text-2xl">{exam.title}</CardTitle>
                <CardDescription>Question {currentQuestionIndex + 1} of {exam.questions.length}</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
                  <Timer className="w-5 h-5" />
                   <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              <p className="text-lg">{currentQuestion.text}</p>
              <RadioGroup value={answers[currentQuestion.id]} onValueChange={handleAnswerChange}>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={`option-${index}`} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-base">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
          <div className="p-6 border-t flex justify-between gap-2">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Previous</Button>
            <Button onClick={handleNext}>
              {currentQuestionIndex === exam.questions.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </div>
        </Card>
      </div>

      <aside className="w-80 border-l bg-background p-6 flex flex-col gap-6">
        <WebcamFeed 
          videoRef={videoRef} 
          onReady={setIsCameraReady}
          proctoringStatus={proctoringStatus}
        />
        
        <ProctoringHandler 
          studentId={student.id} 
          examId={exam.id}
          videoRef={videoRef}
          enabled={isCameraReady}
          onDetectionUpdate={setProctoringStatus}
        />
        
      </aside>
       <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
            <AlertDialogDescription>
              You cannot change your answers after submitting. Please review your answers before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirmation(false)}>Cancel</Button>
            <AlertDialogAction asChild>
                <Button onClick={handleSubmit}>Submit Exam</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
