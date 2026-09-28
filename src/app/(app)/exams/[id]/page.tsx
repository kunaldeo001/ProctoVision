'use client';

import { useParams, notFound } from 'next/navigation';
import { mockExams, mockReports, mockUsers, mockNotifications } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import {
  BookOpen, Users, Clock, Target, ShieldAlert, CheckCircle2, XCircle,
  BarChart2, ArrowLeft, Play, Eye, Calendar, AlertTriangle, Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/types';
import { format } from 'date-fns';

const statusConfig = {
  live: { label: 'Live', className: 'bg-red-500 text-white animate-pulse' },
  upcoming: { label: 'Upcoming', className: 'bg-amber-500 text-white' },
  completed: { label: 'Completed', className: 'bg-emerald-500 text-white' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground' },
};

const riskColors: Record<RiskLevel, string> = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

export default function ExamDetailsPage() {
  const params = useParams<{ id: string }>();
  const exam = mockExams.find(e => e.id === params.id);

  if (!exam) notFound();

  const examReports = mockReports.filter(r => r.examId === exam.id);
  const students = exam.studentIds.map(id => mockUsers.find(u => u.id === id)).filter(Boolean);

  const avgScore = examReports.length
    ? Math.round(examReports.reduce((a, r) => a + r.percentage, 0) / examReports.length)
    : 0;
  const passRate = examReports.length
    ? Math.round(examReports.filter(r => r.percentage >= exam.passingPercentage).length / examReports.length * 100)
    : 0;
  const highRisk = examReports.filter(r => r.riskLevel === 'High').length;
  const mediumRisk = examReports.filter(r => r.riskLevel === 'Medium').length;
  const lowRisk = examReports.filter(r => r.riskLevel === 'Low').length;
  const avgTime = examReports.length
    ? Math.round(examReports.reduce((a, r) => a + (r.timeTaken || 0), 0) / examReports.length)
    : 0;
  const completionRate = exam.studentIds.length
    ? Math.round(examReports.length / exam.studentIds.length * 100)
    : 0;

  // Question difficulty chart
  const difficultyData = [
    { name: 'Easy', count: exam.questions.filter(q => q.difficulty === 'easy').length },
    { name: 'Medium', count: exam.questions.filter(q => q.difficulty === 'medium').length },
    { name: 'Hard', count: exam.questions.filter(q => q.difficulty === 'hard').length },
  ].filter(d => d.count > 0);

  const difficultyColors = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

  // Score distribution
  const scoreRanges = [
    { range: '0-20', count: examReports.filter(r => r.percentage <= 20).length },
    { range: '21-40', count: examReports.filter(r => r.percentage > 20 && r.percentage <= 40).length },
    { range: '41-60', count: examReports.filter(r => r.percentage > 40 && r.percentage <= 60).length },
    { range: '61-80', count: examReports.filter(r => r.percentage > 60 && r.percentage <= 80).length },
    { range: '81-100', count: examReports.filter(r => r.percentage > 80).length },
  ];

  const status = statusConfig[exam.status] || statusConfig.draft;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/exams">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", status.className)}>{status.label}</span>
              {exam.subject && <span className="text-xs text-muted-foreground">{exam.subject}</span>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">{exam.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{exam.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-12 sm:ml-0">
          {(exam.status === 'live' || exam.status === 'upcoming') && (
            <Link href={`/dashboard/exams/${exam.id}/monitor`}>
              <Button variant="outline" size="sm"><Eye className="mr-2 h-3 w-3" />Monitor</Button>
            </Link>
          )}
          {(exam.status === 'live' || exam.status === 'upcoming') && (
            <Link href={`/dashboard/exams/${exam.id}/take`}>
              <Button size="sm"><Play className="mr-2 h-3 w-3" />Take Exam</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Info strip */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{exam.duration} min</span>
        <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{exam.questions.length} questions</span>
        <span className="flex items-center gap-1.5"><Target className="w-4 h-4" />{exam.totalMarks} marks · {exam.passingPercentage}% to pass</span>
        <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{exam.studentIds.length} students</span>
        <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" />
          Proctoring: <span className="capitalize font-medium text-foreground ml-0.5">{exam.proctoringLevel}</span>
        </span>
        {exam.startDate && (
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{format(exam.startDate, 'PPP')}</span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Avg Score', value: `${avgScore}%`, icon: <BarChart2 className="w-4 h-4" />, color: 'text-primary' },
          { label: 'Pass Rate', value: `${passRate}%`, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500' },
          { label: 'Completion', value: `${completionRate}%`, icon: <Award className="w-4 h-4" />, color: 'text-blue-500' },
          { label: 'Avg Time', value: `${avgTime}m`, icon: <Clock className="w-4 h-4" />, color: 'text-muted-foreground' },
          { label: 'High Risk', value: `${highRisk}`, icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500' },
          { label: 'Submissions', value: `${examReports.length}/${exam.studentIds.length}`, icon: <Users className="w-4 h-4" />, color: 'text-muted-foreground' },
        ].map(stat => (
          <Card key={stat.label} className="shadow-sm text-center">
            <CardContent className="pt-4 pb-3 px-3">
              <div className={cn("flex justify-center mb-1 text-muted-foreground", stat.color)}>{stat.icon}</div>
              <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score distribution */}
        {examReports.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Score Distribution</CardTitle>
              <CardDescription>How scores are spread across students</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ count: { label: 'Students', color: 'hsl(var(--primary))' } }} className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreRanges} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Question difficulty */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Question Difficulty</CardTitle>
            <CardDescription>Breakdown by difficulty level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: 'Questions', color: 'hsl(var(--primary))' } }} className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={4}>
                    {difficultyData.map((entry) => (
                      <Cell key={entry.name} fill={difficultyColors[entry.name as keyof typeof difficultyColors]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Integrity risk breakdown */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Integrity Overview</CardTitle>
            <CardDescription>AI proctoring risk assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground italic">Risk score is an automated signal and requires human review.</p>
            {[
              { label: 'Low Risk', count: lowRisk, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
              { label: 'Medium Risk', count: mediumRisk, color: 'bg-amber-500', textColor: 'text-amber-600' },
              { label: 'High Risk', count: highRisk, color: 'bg-red-500', textColor: 'text-red-600' },
            ].map(({ label, count, color, textColor }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={cn("font-medium", textColor)}>{label}</span>
                  <span className="text-muted-foreground">{count} student{count !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", color)}
                    style={{ width: examReports.length ? `${count / examReports.length * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
            {examReports.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No reports yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student results table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
          <CardDescription>Individual performance and integrity scores</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left font-medium text-muted-foreground px-6 py-3">Student</th>
                  <th className="text-center font-medium text-muted-foreground px-4 py-3">Score</th>
                  <th className="text-center font-medium text-muted-foreground px-4 py-3">Result</th>
                  <th className="text-center font-medium text-muted-foreground px-4 py-3">Time Taken</th>
                  <th className="text-center font-medium text-muted-foreground px-4 py-3">Integrity</th>
                  <th className="text-center font-medium text-muted-foreground px-4 py-3">Risk</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  if (!student) return null;
                  const report = examReports.find(r => r.studentId === student.id);
                  const passed = report && report.percentage >= exam.passingPercentage;
                  return (
                    <tr key={student.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatarUrl} alt={student.name} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center px-4 py-3">
                        {report ? (
                          <div className="flex flex-col items-center">
                            <span className="font-bold">{report.percentage}%</span>
                            <span className="text-xs text-muted-foreground">{report.score}/{report.totalQuestions}</span>
                          </div>
                        ) : <span className="text-muted-foreground text-xs">Not submitted</span>}
                      </td>
                      <td className="text-center px-4 py-3">
                        {report ? (
                          passed
                            ? <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" />Pass</Badge>
                            : <Badge variant="destructive" className="bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" />Fail</Badge>
                        ) : <Badge variant="secondary">Pending</Badge>}
                      </td>
                      <td className="text-center px-4 py-3 text-muted-foreground">
                        {report?.timeTaken ? `${report.timeTaken}m` : '—'}
                      </td>
                      <td className="text-center px-4 py-3">
                        {report ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-mono text-xs">{report.malpracticeScore}/100</span>
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", report.malpracticeScore > 60 ? 'bg-red-500' : report.malpracticeScore > 25 ? 'bg-amber-500' : 'bg-emerald-500')}
                                style={{ width: `${report.malpracticeScore}%` }}
                              />
                            </div>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="text-center px-4 py-3">
                        {report ? (
                          <Badge variant="outline" className={cn(
                            "font-semibold",
                            report.riskLevel === 'High' ? 'text-red-500 border-red-500/30' :
                            report.riskLevel === 'Medium' ? 'text-amber-500 border-amber-500/30' :
                            'text-emerald-500 border-emerald-500/30'
                          )}>{report.riskLevel}</Badge>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No students assigned.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Questions list */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Question Bank ({exam.questions.length})</CardTitle>
          <CardDescription>Questions included in this exam</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exam.questions.map((q, i) => (
              <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{q.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground uppercase">{q.type.replace('-', ' ')}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{q.topic}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs font-medium">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-xs shrink-0",
                    q.difficulty === 'hard' ? 'text-red-500 border-red-500/30' :
                    q.difficulty === 'medium' ? 'text-amber-500 border-amber-500/30' :
                    'text-emerald-500 border-emerald-500/30'
                  )}
                >
                  {q.difficulty}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
