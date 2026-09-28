'use client';

import { useState, useMemo } from 'react';
import { mockUsers, mockReports, mockExams } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Search, Users, TrendingUp, ShieldCheck, BookOpen, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/types';

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  Low: { label: 'Low Risk', className: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  Medium: { label: 'Medium Risk', className: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
  High: { label: 'High Risk', className: 'text-red-600 bg-red-500/10 border-red-500/20' },
};

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const students = mockUsers.filter(u => u.role === 'student');

  const studentData = useMemo(() => {
    return students.map(student => {
      const reports = mockReports.filter(r => r.studentId === student.id);
      const enrolledExams = mockExams.filter(e => e.studentIds.includes(student.id));
      const completedExams = enrolledExams.filter(e => e.status === 'completed' && reports.some(r => r.examId === e.id));
      const avgScore = reports.length
        ? Math.round(reports.reduce((a, r) => a + r.percentage, 0) / reports.length)
        : null;
      const avgIntegrity = reports.length
        ? Math.round(100 - reports.reduce((a, r) => a + r.malpracticeScore, 0) / reports.length)
        : null;
      const overallRisk: RiskLevel = reports.some(r => r.riskLevel === 'High') ? 'High'
        : reports.some(r => r.riskLevel === 'Medium') ? 'Medium' : 'Low';
      return { student, reports, enrolledExams, completedExams, avgScore, avgIntegrity, overallRisk };
    });
  }, [students]);

  const filtered = useMemo(() => {
    if (!search) return studentData;
    const q = search.toLowerCase();
    return studentData.filter(s =>
      s.student.name.toLowerCase().includes(q) ||
      s.student.email.toLowerCase().includes(q)
    );
  }, [studentData, search]);

  const totalReports = mockReports.length;
  const avgPlatformScore = Math.round(studentData.reduce((a, s) => a + (s.avgScore || 0), 0) / (studentData.filter(s => s.avgScore !== null).length || 1));
  const atRiskCount = studentData.filter(s => s.overallRisk === 'High').length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Students</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all enrolled students.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Total Students</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{students.length}</div></CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Platform Avg Score</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{avgPlatformScore}%</div></CardContent>
        </Card>
        <Card className="shadow-sm border-red-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-red-500" />High Risk Students</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-red-500">{atRiskCount}</div></CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>

      {/* Student cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(({ student, reports, enrolledExams, completedExams, avgScore, avgIntegrity, overallRisk }) => {
          const risk = riskConfig[overallRisk];
          return (
            <Link key={student.id} href={`/students/${student.id}`} className="block group">
            <Card key={student.id} className="shadow-sm hover:shadow-md transition-all hover:border-primary/30">
              <CardContent className="p-5">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarImage src={student.avatarUrl} alt={student.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold leading-tight">{student.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-2.5 h-2.5" />{student.email}
                      </p>
                    </div>
                  </div>
                  {reports.length > 0 && (
                    <Badge variant="outline" className={cn("text-xs", risk.className)}>
                      {risk.label}
                    </Badge>
                  )}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="text-lg font-bold">{enrolledExams.length}</p>
                    <p className="text-xs text-muted-foreground">Enrolled</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="text-lg font-bold">{completedExams.length}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className={cn("text-lg font-bold", avgScore === null ? 'text-muted-foreground' : avgScore >= 60 ? 'text-emerald-500' : 'text-red-500')}>
                      {avgScore !== null ? `${avgScore}%` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </div>

                {/* Integrity score */}
                {avgIntegrity !== null && (
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Integrity Score</span>
                      <span className={cn("font-semibold", avgIntegrity >= 70 ? 'text-emerald-600' : avgIntegrity >= 50 ? 'text-amber-600' : 'text-red-600')}>{avgIntegrity}/100</span>
                    </div>
                    <Progress value={avgIntegrity} className="h-1.5" />
                  </div>
                )}

                {/* Exams enrolled */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Enrolled Exams</p>
                  <div className="flex flex-wrap gap-1">
                    {enrolledExams.slice(0, 3).map(exam => (
                      <Badge key={exam.id} variant="secondary" className="text-xs font-normal">
                        {exam.title.split(' ').slice(0, 3).join(' ')}…
                      </Badge>
                    ))}
                    {enrolledExams.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{enrolledExams.length - 3} more</Badge>
                    )}
                    {enrolledExams.length === 0 && (
                      <span className="text-xs text-muted-foreground">Not enrolled in any exam</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No students found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
