
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, ServerCrash } from 'lucide-react';
import { summarizeMalpracticeEvents } from '@/ai/flows/summarize-malpractice-events';
import type { SummarizeMalpracticeEventsOutput, Exam, StudentSession } from '@/lib/types';
import { VIOLATION_DISPLAY_NAMES } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockUsers } from '@/lib/mock-data';

type ReportGeneratorProps = {
  exam: Exam;
  sessions: Record<string, StudentSession>;
};

export function ReportGenerator({ exam, sessions }: ReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<SummarizeMalpracticeEventsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const students = exam.studentIds
    .map(id => mockUsers.find(u => u.id === id))
    .filter(Boolean);

  const handleGenerateReport = async () => {
    if (!selectedStudentId) return;

    const studentSession = sessions[selectedStudentId];
    if (!studentSession || studentSession.events.length === 0) {
      setError("No malpractice events recorded for this student.");
      setReport(null);
      return;
    }

    const student = mockUsers.find(u => u.id === selectedStudentId);
    if (!student) return;

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const malpracticeEvents = studentSession.events.map(
        (e) => `${VIOLATION_DISPLAY_NAMES[e.type] || e.type} (Score: +${e.score}) at ${new Date(e.timestamp).toLocaleTimeString()}`
      );
      
      const result = await summarizeMalpracticeEvents({
        examTitle: exam.title,
        studentName: student.name,
        malpracticeEvents,
      });
      setReport(result);
    } catch (e) {
      console.error(e);
      setError("Failed to generate the report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = () => {
    setIsOpen(true);
    // Reset state when opening
    setReport(null);
    setError(null);
    setSelectedStudentId(null);
  };

  return (
    <>
      <Button variant="outline" onClick={openDialog}>
        <FileText className="mr-2 h-4 w-4" /> Generate Report
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Exam Report</DialogTitle>
            <DialogDescription>
              Select a student to generate an AI-powered summary of malpractice events.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
             <Select onValueChange={setSelectedStudentId} value={selectedStudentId || undefined}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent>
                    {students.map(student => (
                        <SelectItem key={student!.id} value={student!.id}>{student!.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {report && (
              <div className="space-y-4 rounded-md border p-4">
                 <h3 className="font-semibold">
                    Report for {mockUsers.find(u => u.id === selectedStudentId)?.name}
                </h3>
                <div>
                  <h4 className="font-medium">AI Summary</h4>
                  <p className="text-sm text-muted-foreground">{report.summary}</p>
                </div>
                <div>
                  <h4 className="font-medium">Risk Assessment</h4>
                  <p className="text-sm font-bold text-primary">{report.riskAssessment}</p>
                </div>
              </div>
            )}

          </div>

          <DialogFooter>
            <Button onClick={handleGenerateReport} disabled={isLoading || !selectedStudentId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
