'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockReports, mockUsers, mockExams } from '@/lib/mock-data';
import type { RiskLevel } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const riskLevelVariant: Record<RiskLevel, 'default' | 'secondary' | 'destructive'> = {
  Low: 'default',
  Medium: 'secondary',
  High: 'destructive',
};

export default function ReportsPage() {
  const reportsWithDetails = mockReports.map(report => {
    const student = mockUsers.find(u => u.id === report.studentId);
    const exam = mockExams.find(e => e.id === report.examId);
    return {
      ...report,
      studentName: student?.name || 'Unknown Student',
      studentAvatar: student?.avatarUrl,
      examTitle: exam?.title || 'Unknown Exam',
    };
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-background">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Exam Reports
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Completed Exam Analysis</CardTitle>
          <CardDescription>An overview of student performance and proctoring results.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Malpractice Score</TableHead>
                <TableHead className="text-center">Overall Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportsWithDetails.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={report.studentAvatar} alt={report.studentName} />
                            <AvatarFallback>{report.studentName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{report.studentName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{report.examTitle}</TableCell>
                  <TableCell className="text-center">{`${report.score}/${report.totalQuestions} (${report.percentage}%)`}</TableCell>
                  <TableCell className="text-center font-semibold">{report.malpracticeScore}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={riskLevelVariant[report.riskLevel]} className="capitalize">
                      {report.riskLevel}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
