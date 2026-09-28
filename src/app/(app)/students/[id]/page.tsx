'use client';

import { useParams, notFound } from 'next/navigation';
import { mockUsers, mockReports, mockExams, mockNotifications } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import {
  ArrowLeft, Mail, Calendar, BookOpen, Trophy, Shield, TrendingUp, TrendingDown,
  Clock, Target, CheckCircle2, XCircle, AlertTriangle, Minus, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const riskStyle: Record<RiskLevel, string> = {
  Low: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  Medium: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  High: 'text-red-600 bg-red-500/10 border-red-500/30',
};

const riskColors: Record<RiskLevel, string> = {
  Low: 'text-emerald-500',
  Medium: 'text-amber-500',
  High: 'text-red-500',
};

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const student = mockUsers.find(u => u.id === params.id && u.role === 'student');
  if (!student) notFound();

  const reports = mockReports
    .filter(r => r.studentId === student.id)
    .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));

  const enrolledExams = mockExams.filter(e => e.studentIds.includes(student.id));
  const completedExamIds = reports.map(r => r.examId);

  const avgScore = reports.length
    ? Math.round(reports.reduce((a, r) => a + r.percentage, 0) / reports.length)
    : null;
  const bestScore = reports.length ? Math.max(...reports.map(r => r.percentage)) : null;
  const passCount = reports.filter(r => {
    const exam = mockExams.find(e => e.id === r.examId);
    return r.percentage >= (exam?.passingPercentage ?? 50);
  }).length;
  const passRate = reports.length ? Math.round(passCount / reports.length * 100) : null;
  const avgIntegrity = reports.length
    ? Math.round(100 - reports.reduce((a, r) => a + r.malpracticeScore, 0) / reports.length)
    : null;
  const highRiskCount = reports.filter(r => r.riskLevel === 'High').length;
  const overallRisk: RiskLevel = highRiskCount > 0 ? 'High'
    : reports.some(r => r.riskLevel === 'Medium') ? 'Medium' : 'Low';

  // Score trend (chronological)
  const scoreTrend = [...reports]
    .sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0))
    .map((r, i) => {
      const exam = mockExams.find(e => e.id === r.examId);
      return {
        name: exam?.title?.split(' ').slice(0, 2).join(' ') || `Exam ${i + 1}`,
        score: r.percentage,
        integrity: 100 - r.malpracticeScore,
      };
    });

  const trend = scoreTrend.length >= 2
    ? scoreTrend[scoreTrend.length - 1].score - scoreTrend[0].score
    : null;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/students">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Student Profile</p>
          <h1 className="text-2xl font-bold tracking-tight font-headline">{student.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — identity card */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={student.avatarUrl} alt={student.name} />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{student.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />{student.email}
                  </p>
                  {student.joinedDate && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> Joined {format(new Date(student.joinedDate), 'MMM yyyy')}
                    </p>
                  )}
                </div>
                {reports.length > 0 && (
                  <Badge variant="outline" className={cn("text-sm font-semibold px-3 py-1", riskStyle[overallRisk])}>
                    {overallRisk} Integrity Risk
                  </Badge>
                )}
              </div>

              <Separator className="my-5" />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—', color: 'text-primary' },
                  { label: 'Best Score', value: bestScore !== null ? `${bestScore}%` : '—', color: 'text-emerald-500' },
                  { label: 'Pass Rate', value: passRate !== null ? `${passRate}%` : '—', color: 'text-blue-500' },
                  { label: 'Exams Taken', value: `${reports.length}`, color: 'text-muted-foreground' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Integrity score bar */}
              {avgIntegrity !== null && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> Integrity Score
                    </span>
                    <span className={cn("font-bold",
                      avgIntegrity >= 70 ? 'text-emerald-600' :
                      avgIntegrity >= 50 ? 'text-amber-600' : 'text-red-600'
                    )}>{avgIntegrity}/100</span>
                  </div>
                  <Progress value={avgIntegrity} className="h-2.5" />
                  {highRiskCount > 0 && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {highRiskCount} high-risk session{highRiskCount !== 1 ? 's' : ''} flagged
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrolled exams */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" /> Enrolled Exams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {enrolledExams.map(exam => {
                const done = completedExamIds.includes(exam.id);
                return (
                  <Link key={exam.id} href={`/exams/${exam.id}`} className="block">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/40 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{exam.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{exam.status}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        {done
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          : exam.status === 'live' || exam.status === 'upcoming'
                            ? <Clock className="w-4 h-4 text-amber-500" />
                            : <Minus className="w-4 h-4 text-muted-foreground" />}
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                );
              })}
              {enrolledExams.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Not enrolled in any exam.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — performance + history */}
        <div className="lg:col-span-2 space-y-4">
          {/* Score trend chart */}
          {scoreTrend.length >= 2 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Performance Trend</CardTitle>
                  {trend !== null && (
                    <div className={cn("flex items-center gap-1 text-sm font-semibold",
                      trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'
                    )}>
                      {trend > 0 ? <TrendingUp className="w-4 h-4" /> : trend < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                      {trend > 0 ? `+${trend}pp` : trend < 0 ? `${trend}pp` : 'Stable'}
                    </div>
                  )}
                </div>
                <CardDescription>Score and integrity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    score: { label: 'Score %', color: 'hsl(var(--primary))' },
                    integrity: { label: 'Integrity', color: '#10b981' },
                  }}
                  className="h-52 w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreTrend} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="integrity" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Exam history */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Exam History</CardTitle>
              <CardDescription>All submissions with integrity data</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No exams taken yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map(report => {
                    const exam = mockExams.find(e => e.id === report.examId);
                    const passed = report.percentage >= (exam?.passingPercentage ?? 50);
                    return (
                      <Link key={report.id} href={`/exams/${report.examId}`} className="block group">
                        <div className="p-4 rounded-xl border hover:border-primary/30 hover:bg-muted/30 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                                  {exam?.title || 'Unknown Exam'}
                                </p>
                                {passed
                                  ? <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-xs shrink-0 hover:bg-emerald-500/15"><CheckCircle2 className="w-2.5 h-2.5 mr-1" />Pass</Badge>
                                  : <Badge variant="outline" className="text-red-600 border-red-500/30 text-xs shrink-0"><XCircle className="w-2.5 h-2.5 mr-1" />Fail</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {exam?.subject && <span className="mr-2">{exam.subject}</span>}
                                {report.submittedAt && formatDistanceToNow(report.submittedAt, { addSuffix: true })}
                                {report.timeTaken && <span className="ml-2">· {report.timeTaken}m taken</span>}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <p className="text-lg font-bold">{report.percentage}%</p>
                                <p className="text-xs text-muted-foreground">{report.score}/{report.totalQuestions}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className={cn("text-xs font-semibold", riskStyle[report.riskLevel])}>
                                  {report.riskLevel}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-0.5">Integrity: {100 - report.malpracticeScore}</p>
                              </div>
                            </div>
                          </div>
                          {/* Mini integrity bar */}
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all",
                                  report.malpracticeScore > 60 ? 'bg-red-500' :
                                  report.malpracticeScore > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                                )}
                                style={{ width: `${Math.min(report.malpracticeScore, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Risk score: {report.malpracticeScore}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
