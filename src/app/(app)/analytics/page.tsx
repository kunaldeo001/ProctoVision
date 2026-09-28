'use client';

import { useMemo } from 'react';
import { mockUsers, mockReports, mockExams } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Target, Clock, ShieldCheck, AlertTriangle, BarChart2, Trophy } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/types';

const riskColors: Record<RiskLevel, string> = {
  Low: 'text-emerald-500',
  Medium: 'text-amber-500',
  High: 'text-red-500',
};

const riskBg: Record<RiskLevel, string> = {
  Low: 'bg-emerald-500/10 border-emerald-500/20',
  Medium: 'bg-amber-500/10 border-amber-500/20',
  High: 'bg-red-500/10 border-red-500/20',
};

export default function AnalyticsPage() {
  const students = mockUsers.filter(u => u.role === 'student');

  const studentAnalytics = useMemo(() => {
    return students.map(student => {
      const reports = mockReports.filter(r => r.studentId === student.id);
      const avgScore = reports.length
        ? Math.round(reports.reduce((a, r) => a + r.percentage, 0) / reports.length)
        : 0;
      const highestScore = reports.length ? Math.max(...reports.map(r => r.percentage)) : 0;
      const lowestScore = reports.length ? Math.min(...reports.map(r => r.percentage)) : 0;
      const avgMalpractice = reports.length
        ? Math.round(reports.reduce((a, r) => a + r.malpracticeScore, 0) / reports.length)
        : 0;
      const avgTime = reports.length
        ? Math.round(reports.reduce((a, r) => a + (r.timeTaken || 0), 0) / reports.length)
        : 0;
      const passCount = reports.filter(r => r.percentage >= 50).length;
      const passRate = reports.length ? Math.round(passCount / reports.length * 100) : 0;
      const highRiskCount = reports.filter(r => r.riskLevel === 'High').length;

      // Score trend
      const trend = reports
        .sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0))
        .map((r, i) => {
          const exam = mockExams.find(e => e.id === r.examId);
          return { exam: exam?.title?.split(' ').slice(0, 2).join(' ') || `Exam ${i + 1}`, score: r.percentage };
        });

      // Topic performance
      const topicMap: Record<string, { total: number; count: number }> = {};
      reports.forEach(r => {
        const exam = mockExams.find(e => e.id === r.examId);
        if (exam?.subject) {
          if (!topicMap[exam.subject]) topicMap[exam.subject] = { total: 0, count: 0 };
          topicMap[exam.subject].total += r.percentage;
          topicMap[exam.subject].count += 1;
        }
      });
      const topicPerformance = Object.entries(topicMap).map(([subject, data]) => ({
        subject,
        score: Math.round(data.total / data.count),
      }));

      return { student, reports, avgScore, highestScore, lowestScore, avgMalpractice, avgTime, passRate, highRiskCount, trend, topicPerformance };
    });
  }, [students]);

  const overallAvg = Math.round(studentAnalytics.reduce((a, s) => a + s.avgScore, 0) / (studentAnalytics.length || 1));
  const topPerformer = studentAnalytics.reduce((best, s) => s.avgScore > best.avgScore ? s : best, studentAnalytics[0]);
  const totalHighRisk = studentAnalytics.reduce((a, s) => a + s.highRiskCount, 0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Student Analytics</h1>
        <p className="text-muted-foreground mt-1">Performance insights and integrity overview for all students.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Platform Avg. Score</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{overallAvg}%</div><p className="text-xs text-muted-foreground mt-1">Across all exams</p></CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{students.length}</div><p className="text-xs text-muted-foreground mt-1">Enrolled and active</p></CardContent>
        </Card>
        <Card className="shadow-sm border-amber-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">High Risk Instances</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-amber-500">{totalHighRisk}</div><p className="text-xs text-muted-foreground mt-1">Flagged for review</p></CardContent>
        </Card>
        {topPerformer && (
          <Card className="shadow-sm border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-500" /> Top Performer</CardTitle></CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{topPerformer.student.name}</div>
              <p className="text-xs text-muted-foreground">{topPerformer.avgScore}% avg score</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Per student cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {studentAnalytics.map(({ student, reports, avgScore, highestScore, lowestScore, avgMalpractice, avgTime, passRate, highRiskCount, trend, topicPerformance }) => {
          const overallRisk: RiskLevel = highRiskCount > 0 ? 'High' : avgMalpractice > 30 ? 'Medium' : 'Low';
          const trend_dir = trend.length >= 2 ? trend[trend.length - 1].score - trend[0].score : 0;

          return (
            <Card key={student.id} className={cn("shadow-sm border", riskBg[overallRisk])}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-background shadow">
                      <AvatarImage src={student.avatarUrl} alt={student.name} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{student.name}</CardTitle>
                      <CardDescription>{student.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={cn("text-xs font-semibold", riskColors[overallRisk])}>
                      {overallRisk} Risk
                    </Badge>
                    <span className="text-xs text-muted-foreground">{reports.length} exam{reports.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score metrics */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg bg-background p-2 shadow-sm">
                    <div className="text-xl font-bold text-primary">{avgScore}%</div>
                    <div className="text-xs text-muted-foreground">Avg</div>
                  </div>
                  <div className="rounded-lg bg-background p-2 shadow-sm">
                    <div className="text-xl font-bold text-emerald-500">{highestScore}%</div>
                    <div className="text-xs text-muted-foreground">Best</div>
                  </div>
                  <div className="rounded-lg bg-background p-2 shadow-sm">
                    <div className="text-xl font-bold text-red-500">{lowestScore}%</div>
                    <div className="text-xs text-muted-foreground">Lowest</div>
                  </div>
                  <div className="rounded-lg bg-background p-2 shadow-sm">
                    <div className="text-xl font-bold">{passRate}%</div>
                    <div className="text-xs text-muted-foreground">Pass Rate</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Overall Performance</span>
                    <span>{avgScore}%</span>
                  </div>
                  <Progress value={avgScore} className="h-2" />
                </div>

                {/* Score trend chart */}
                {trend.length > 1 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-muted-foreground">Score Trend</p>
                      <span className={cn("text-xs font-semibold flex items-center gap-1", trend_dir >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                        {trend_dir >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trend_dir)}pp
                      </span>
                    </div>
                    <ChartContainer config={{ score: { label: 'Score', color: 'hsl(var(--primary))' } }} className="h-20 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trend} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
                          <XAxis dataKey="exam" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Avg {avgTime}min</span>
                  <span className={cn("flex items-center gap-1", avgMalpractice > 50 ? 'text-red-500' : avgMalpractice > 25 ? 'text-amber-500' : 'text-emerald-500')}>
                    <ShieldCheck className="w-3 h-3" /> Integrity {100 - avgMalpractice}/100
                  </span>
                  {highRiskCount > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertTriangle className="w-3 h-3" /> {highRiskCount} high risk
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
