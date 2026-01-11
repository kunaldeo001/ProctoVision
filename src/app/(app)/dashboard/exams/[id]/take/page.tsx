'use client';
import { mockExams, mockUsers } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Timer } from 'lucide-react';
import { ProctoringHandler } from '@/components/exam/proctoring-handler';
import { WebcamFeed } from "@/components/exam/webcam-feed";
import { useState, useRef } from "react";

export default function ExamTakePage({ params }: { params: { id: string } }) {
  const exam = mockExams.find((e) => e.id === params.id);
  const student = mockUsers.find(u => u.role === 'student');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  if (!exam || !student) {
    notFound();
  }

  const currentQuestion = exam.questions[0];

  return (
    <div className="flex h-screen bg-muted">
      <div className="flex-1 p-6 flex flex-col gap-6">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline text-2xl">{exam.title}</CardTitle>
                <CardDescription>Question 1 of {exam.questions.length}</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
                  <Timer className="w-5 h-5" />
                  <span>{exam.duration}:00</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              <p className="text-lg">{currentQuestion.text}</p>
              <RadioGroup defaultValue={`option-${currentQuestion.correctOption}`}>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={`option-${index}`} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-base">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
          <div className="p-6 border-t flex justify-end gap-2">
            <Button variant="outline">Previous</Button>
            <Button>Next</Button>
          </div>
        </Card>
      </div>

      <aside className="w-80 border-l bg-background p-6 flex flex-col gap-6">
        <WebcamFeed videoRef={videoRef} onReady={setIsCameraReady} />
        
        <ProctoringHandler 
          studentId={student.id} 
          examId={exam.id}
          videoRef={videoRef}
          enabled={isCameraReady}
        />
        
      </aside>
    </div>
  );
}
