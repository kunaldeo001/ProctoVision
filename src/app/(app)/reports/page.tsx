'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockReports, mockUsers, mockExams } from '@/lib/mock-data';
import type { RiskLevel } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Filter, Search, FileJson, FileSpreadsheet, TrendingUp, ShieldAlert, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const riskVariant: Record<RiskLevel, 'default' | 'secondary' | 'destructive'> = {
  Low: 'default',
  Medium: 'secondary',
  High: 'destructive',
};

const riskStyle: Record<RiskLevel, string> = {
  Low: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  Medium: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  High: 'text-red-600 bg-red-500/10 border-red-500/30',
};

const PIE_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

export default function ReportsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [examFilter, setExamFilter] = useState('all');

  const reportsWithDetails = useMemo(() => mockReports.map(report => {
    const student = mockUsers.find(u => u.id === report.studentId);
    const exam = mockExams.find(e => e.id === report.examId);
    return {
      ...report,
      studentName: student?.name || 'Unknown Student',
      studentAvatar: student?.avatarUrl,
      examTitle: exam?.title || 'Unknown Exam',
      examId: report.examId,
      passed: report.percentage >= (exam?.passingPercentage ?? 50),
    };
  }), []);

  const filteredReports = useMemo(() => reportsWithDetails.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(search.toLowerCase())
      || r.examTitle.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'all' || r.riskLevel.toLowerCase() === riskFilter;
    const matchesExam = examFilter === 'all' || r.examId === examFilter;
    return matchesSearch && matchesRisk && matchesExam;
  }), [reportsWithDetails, search, riskFilter, examFilter]);

  // Analytics calcs
  const avgScore = Math.round(filteredReports.reduce((a, r) => a + r.percentage, 0) / (filteredReports.length || 1));
  const medianScore = useMemo(() => {
    const sorted = [...filteredReports].sort((a, b) => a.percentage - b.percentage);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length ? (sorted.length % 2 === 0 ? Math.round((sorted[mid - 1].percentage + sorted[mid].percentage) / 2) : sorted[mid].percentage) : 0;
  }, [filteredReports]);
  const passRate = Math.round(filteredReports.filter(r => r.passed).length / (filteredReports.length || 1) * 100);
  const highRiskCount = filteredReports.filter(r => r.riskLevel === 'High').length;
  const medRiskCount = filteredReports.filter(r => r.riskLevel === 'Medium').length;
  const lowRiskCount = filteredReports.filter(r => r.riskLevel === 'Low').length;
  const avgTime = Math.round(filteredReports.reduce((a, r) => a + (r.timeTaken || 0), 0) / (filteredReports.filter(r => r.timeTaken).length || 1));

  // Chart data
  const scoreBarData = [
    { range: '0-20%', count: filteredReports.filter(r => r.percentage <= 20).length },
    { range: '21-40%', count: filteredReports.filter(r => r.percentage > 20 && r.percentage <= 40).length },
    { range: '41-60%', count: filteredReports.filter(r => r.percentage > 40 && r.percentage <= 60).length },
    { range: '61-80%', count: filteredReports.filter(r => r.percentage > 60 && r.percentage <= 80).length },
    { range: '81-100%', count: filteredReports.filter(r => r.percentage > 80).length },
  ];

  const riskPieData = [
    { name: 'Low Risk', value: lowRiskCount },
    { name: 'Medium Risk', value: medRiskCount },
    { name: 'High Risk', value: highRiskCount },
  ].filter(d => d.value > 0);

  const completedExams = mockExams.filter(e => e.status === 'completed');

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredReports, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "proctovision_reports.json");
    document.body.appendChild(a); a.click(); a.remove();
    toast({ title: "Exported", description: "Reports exported as JSON." });
  };

  const exportCSV = () => {
    const headers = ["Student", "Exam", "Score%", "Score", "Malpractice", "Risk", "Time(min)"];
    const rows = [headers.join(',')];
    filteredReports.forEach(r => {
      rows.push(`"${r.studentName}","${r.examTitle}",${r.percentage},${r.score}/${r.totalQuestions},${r.malpracticeScore},${r.riskLevel},${r.timeTaken || ''}`);
    });
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.join('\n'));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "proctovision_reports.csv");
    document.body.appendChild(a); a.click(); a.remove();
    toast({ title: "Exported", description: "Reports exported as CSV." });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Exam Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">Review performance and proctoring integrity across all exams.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportJSON}>
            <FileJson className="w-4 h-4 mr-1.5 text-primary" /> JSON
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-500" /> CSV
          </Button>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Avg Score', value: `${avgScore}%`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-primary' },
          { label: 'Median Score', value: `${medianScore}%`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-blue-500' },
          { label: 'Pass Rate', value: `${passRate}%`, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-500' },
          { label: 'High Risk', value: `${highRiskCount}`, icon: <ShieldAlert className="w-4 h-4" />, color: 'text-red-500' },
          { label: 'Avg Time', value: `${avgTime}m`, icon: <Clock className="w-4 h-4" />, color: 'text-muted-foreground' },
          { label: 'Total Reports', value: `${filteredReports.length}`, icon: <FileJson className="w-4 h-4" />, color: 'text-muted-foreground' },
        ].map(s => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="pt-4 pb-3 px-3 text-center">
              <div className={cn("flex justify-center mb-1", s.color)}>{s.icon}</div>
              <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="table">
        <TabsList className="mb-4">
          <TabsTrigger value="table">Detailed Reports</TabsTrigger>
          <TabsTrigger value="charts">Charts & Insights</TabsTrigger>
        </TabsList>

        {/* Detailed table tab */}
        <TabsContent value="table">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
              <CardTitle className="text-base">All Reports</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-48 pl-9 bg-background h-9" />
                </div>
                <Select value={examFilter} onValueChange={setExamFilter}>
                  <SelectTrigger className="w-[160px] bg-background h-9">
                    <SelectValue placeholder="All Exams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    {completedExams.map(e => <SelectItem key={e.id} value={e.id}>{e.title.split(' ').slice(0, 3).join(' ')}…</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[130px] bg-background h-9">
                    <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risks</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6">Student</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Result</TableHead>
                    <TableHead className="text-center">Time</TableHead>
                    <TableHead className="text-center">Integrity Risk</TableHead>
                    <TableHead className="text-center">Risk Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border">
                            <AvatarImage src={report.studentAvatar} alt={report.studentName} />
                            <AvatarFallback>{report.studentName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">{report.examTitle}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold">{report.percentage}%</span>
                          <span className="text-xs text-muted-foreground">{report.score}/{report.totalQuestions}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {report.passed
                          ? <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/15 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Pass</Badge>
                          : <Badge variant="outline" className="text-red-600 border-red-500/30 text-xs"><XCircle className="w-3 h-3 mr-1" />Fail</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {report.timeTaken ? `${report.timeTaken}m` : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("text-xs font-semibold", riskStyle[report.riskLevel])}>
                          {report.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn(
                            "text-sm font-mono font-bold",
                            report.malpracticeScore > 60 ? 'text-red-600' :
                            report.malpracticeScore > 25 ? 'text-amber-600' : 'text-emerald-600'
                          )}>{report.malpracticeScore}</span>
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn("h-full rounded-full",
                                report.malpracticeScore > 60 ? 'bg-red-500' :
                                report.malpracticeScore > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                              )}
                              style={{ width: `${Math.min(report.malpracticeScore, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredReports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No reports match your filters.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts tab */}
        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score distribution bar chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Score Distribution</CardTitle>
                <CardDescription>How student scores are spread across ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ count: { label: 'Students', color: 'hsl(var(--primary))' } }} className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreBarData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Risk pie chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Integrity Risk Breakdown</CardTitle>
                <CardDescription>Distribution of risk levels across all attempts</CardDescription>
              </CardHeader>
              <CardContent>
                {riskPieData.length > 0 ? (
                  <ChartContainer config={{}} className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                          {riskPieData.map((entry) => (
                            <Cell key={entry.name} fill={PIE_COLORS[entry.name.split(' ')[0] as keyof typeof PIE_COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} students`]} />
                        <Legend iconType="circle" iconSize={8} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-52 flex items-center justify-center text-muted-foreground">No data available</div>
                )}
                <p className="text-xs text-muted-foreground italic mt-2 text-center">
                  Risk score is an automated signal and requires human review.
                </p>
              </CardContent>
            </Card>

            {/* Per-exam pass rate */}
            <Card className="shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Pass Rate by Exam</CardTitle>
                <CardDescription>Percentage of students who passed each completed exam</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedExams.map(exam => {
                    const examReps = mockReports.filter(r => r.examId === exam.id);
                    const rate = examReps.length
                      ? Math.round(examReps.filter(r => r.percentage >= exam.passingPercentage).length / examReps.length * 100)
                      : null;
                    return (
                      <div key={exam.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate max-w-xs">{exam.title}</span>
                          <span className={cn(
                            "font-bold shrink-0 ml-2",
                            rate === null ? 'text-muted-foreground' :
                            rate >= 70 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {rate !== null ? `${rate}% pass` : 'No data'}
                          </span>
                        </div>
                        <Progress value={rate ?? 0} className="h-2" />
                        <p className="text-xs text-muted-foreground">{examReps.length} submission{examReps.length !== 1 ? 's' : ''} · {exam.passingPercentage}% to pass</p>
                      </div>
                    );
                  })}
                  {completedExams.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-8">No completed exams yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
