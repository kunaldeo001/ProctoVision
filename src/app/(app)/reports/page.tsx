'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockReports, mockUsers, mockExams } from '@/lib/mock-data';
import type { RiskLevel } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Download, Filter, Search, FileJson, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const riskLevelVariant: Record<RiskLevel, 'default' | 'secondary' | 'destructive'> = {
  Low: 'default', // Changed to default (black/white) or success could be used
  Medium: 'secondary',
  High: 'destructive',
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

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

  const filteredReports = reportsWithDetails.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) || r.examTitle.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'all' || r.riskLevel.toLowerCase() === riskFilter.toLowerCase();
    return matchesSearch && matchesRisk;
  });

  const avgScore = Math.round(filteredReports.reduce((acc, curr) => acc + curr.percentage, 0) / (filteredReports.length || 1));
  const highRiskCount = filteredReports.filter(r => r.riskLevel === 'High').length;
  const passRate = Math.round(filteredReports.filter(r => r.percentage >= 50).length / (filteredReports.length || 1) * 100);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredReports, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "proctovision_reports.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({ title: "Exported", description: "Reports exported as JSON successfully." });
  };

  const exportCSV = () => {
    const headers = ["Student", "Exam", "Score", "Percentage", "Malpractice Score", "Risk Level"];
    const csvRows = [headers.join(',')];
    filteredReports.forEach(r => {
      csvRows.push(`${r.studentName},${r.examTitle},${r.score}/${r.totalQuestions},${r.percentage}%,${r.malpracticeScore},${r.riskLevel}`);
    });
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join('\n'));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "proctovision_reports.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({ title: "Exported", description: "Reports exported as CSV successfully." });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight font-headline">Exam Analytics & Reports</h1>
           <p className="text-muted-foreground mt-1">Review student performance and proctoring integrity.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={exportJSON}>
             <FileJson className="w-4 h-4 mr-2 text-primary" /> JSON
           </Button>
           <Button variant="outline" onClick={exportCSV}>
             <FileSpreadsheet className="w-4 h-4 mr-2 text-success" /> CSV
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{avgScore}%</div></CardContent>
         </Card>
         <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Overall Pass Rate</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-success">{passRate}%</div></CardContent>
         </Card>
         <Card className="shadow-sm border-destructive/20">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">High Risk Sessions</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-destructive">{highRiskCount}</div></CardContent>
         </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
          <div>
            <CardTitle>Detailed Reports</CardTitle>
          </div>
          <div className="flex items-center gap-2">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input placeholder="Search student or exam..." value={search} onChange={e => setSearch(e.target.value)} className="w-64 pl-9 bg-background" />
             </div>
             <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[150px] bg-background">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Risk Filter" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Risks</SelectItem>
                   <SelectItem value="low">Low Risk</SelectItem>
                   <SelectItem value="medium">Medium Risk</SelectItem>
                   <SelectItem value="high">High Risk</SelectItem>
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
                <TableHead className="text-center">Integrity Risk</TableHead>
                <TableHead className="text-center">Malpractice Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <TableCell className="font-medium pl-6">
                     <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                            <AvatarImage src={report.studentAvatar} alt={report.studentName} />
                            <AvatarFallback>{report.studentName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{report.studentName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{report.examTitle}</TableCell>
                  <TableCell className="text-center">
                     <div className="flex flex-col items-center">
                        <span className="font-bold">{report.percentage}%</span>
                        <span className="text-xs text-muted-foreground">{report.score}/{report.totalQuestions}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={riskLevelVariant[report.riskLevel]} className="capitalize">
                      {report.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono">
                      {report.malpracticeScore}
                  </TableCell>
                </TableRow>
              ))}
              {filteredReports.length === 0 && (
                <TableRow>
                   <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No reports match your filters.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
