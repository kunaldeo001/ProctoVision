'use client';

import { useState, useMemo } from 'react';
import { mockReports, mockUsers, mockExams } from '@/lib/mock-data';
import { VIOLATION_DESCRIPTIONS } from '@/lib/proctoring';
import { VIOLATION_DISPLAY_NAMES } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ShieldAlert, Search, AlertTriangle, Info, Eye, Phone, UserX, Users, Monitor, Maximize, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { ViolationType, RiskLevel } from '@/lib/types';
import Link from 'next/link';

// Synthetic violation events derived from mock reports
type AlertEvent = {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  examId: string;
  examTitle: string;
  violationType: ViolationType;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  riskLevel: RiskLevel;
};

const VIOLATION_ICONS: Record<ViolationType, typeof ShieldAlert> = {
  MULTIPLE_PEOPLE: Users,
  NO_FACE_DETECTED: UserX,
  GAZE_AWAY: Eye,
  PHONE_DETECTED: Phone,
  TAB_SWITCH: Monitor,
  FULLSCREEN_EXIT: Maximize,
  INACTIVITY: Activity,
};

const SEVERITY_CONFIG = {
  high: { label: 'Critical', className: 'text-red-600 bg-red-500/10 border-red-500/30' },
  medium: { label: 'Warning', className: 'text-amber-600 bg-amber-500/10 border-amber-500/30' },
  low: { label: 'Info', className: 'text-blue-600 bg-blue-500/10 border-blue-500/30' },
};

const VIOLATION_SEVERITY: Record<ViolationType, 'low' | 'medium' | 'high'> = {
  MULTIPLE_PEOPLE: 'high',
  PHONE_DETECTED: 'high',
  NO_FACE_DETECTED: 'medium',
  FULLSCREEN_EXIT: 'medium',
  TAB_SWITCH: 'medium',
  GAZE_AWAY: 'low',
  INACTIVITY: 'low',
};

// Synthesize realistic alert events from report data
function generateAlerts(): AlertEvent[] {
  const alerts: AlertEvent[] = [];
  mockReports.forEach(report => {
    const student = mockUsers.find(u => u.id === report.studentId);
    const exam = mockExams.find(e => e.id === report.examId);
    if (!student || !exam) return;

    const violationTypes: ViolationType[] = [];
    if (report.riskLevel === 'High') violationTypes.push('MULTIPLE_PEOPLE', 'PHONE_DETECTED', 'TAB_SWITCH');
    else if (report.riskLevel === 'Medium') violationTypes.push('GAZE_AWAY', 'TAB_SWITCH', 'NO_FACE_DETECTED');
    else violationTypes.push('GAZE_AWAY');

    violationTypes.forEach((type, i) => {
      alerts.push({
        id: `${report.id}-${i}`,
        studentId: student.id,
        studentName: student.name,
        studentAvatar: student.avatarUrl,
        examId: exam.id,
        examTitle: exam.title,
        violationType: type,
        severity: VIOLATION_SEVERITY[type],
        timestamp: (report.submittedAt || Date.now()) - (violationTypes.length - i) * 1000 * 60 * (5 + i * 3),
        riskLevel: report.riskLevel,
      });
    });
  });
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
}

export default function AlertsPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const allAlerts = useMemo(() => generateAlerts(), []);

  const filtered = useMemo(() => {
    return allAlerts.filter(a => {
      const matchSearch = search === '' ||
        a.studentName.toLowerCase().includes(search.toLowerCase()) ||
        a.examTitle.toLowerCase().includes(search.toLowerCase());
      const matchSeverity = severityFilter === 'all' || a.severity === severityFilter;
      const matchType = typeFilter === 'all' || a.violationType === typeFilter;
      return matchSearch && matchSeverity && matchType;
    });
  }, [allAlerts, search, severityFilter, typeFilter]);

  const criticalCount = allAlerts.filter(a => a.severity === 'high').length;
  const warningCount = allAlerts.filter(a => a.severity === 'medium').length;
  const infoCount = allAlerts.filter(a => a.severity === 'low').length;

  const violationTypes = Array.from(new Set(allAlerts.map(a => a.violationType))) as ViolationType[];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Integrity Alerts</h1>
          <p className="text-muted-foreground mt-1">Chronological feed of all proctoring signals and integrity events.</p>
        </div>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-sm border-red-500/20">
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-500/20">
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">{warningCount}</p>
              <p className="text-xs text-muted-foreground">Warning</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-blue-500/20">
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{infoCount}</p>
              <p className="text-xs text-muted-foreground">Info</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search student or exam..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background h-9" />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px] bg-background h-9">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="high">Critical</SelectItem>
            <SelectItem value="medium">Warning</SelectItem>
            <SelectItem value="low">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] bg-background h-9">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {violationTypes.map(t => (
              <SelectItem key={t} value={t}>{VIOLATION_DISPLAY_NAMES[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground self-center ml-auto">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Alert feed */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map((alert, i) => {
              const Icon = VIOLATION_ICONS[alert.violationType] || ShieldAlert;
              const sev = SEVERITY_CONFIG[alert.severity];
              const isFirst = i === 0;
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors",
                    isFirst && "bg-red-500/3"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 border",
                    sev.className
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{VIOLATION_DISPLAY_NAMES[alert.violationType]}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={cn("text-xs", sev.className)}>{sev.label}</Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{VIOLATION_DESCRIPTIONS[alert.violationType]}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Link href={`/students/${alert.studentId}`} className="flex items-center gap-1.5 hover:text-primary transition-colors group">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={alert.studentAvatar} alt={alert.studentName} />
                          <AvatarFallback className="text-[9px]">{alert.studentName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium group-hover:underline">{alert.studentName}</span>
                      </Link>
                      <span className="text-muted-foreground text-xs">·</span>
                      <Link href={`/exams/${alert.examId}`} className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors truncate max-w-[200px]">
                        {alert.examTitle}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No alerts found</p>
                <p className="text-sm mt-1">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground italic text-center">
        ⚠️ All integrity signals are automated indicators and must be reviewed by a human proctor before any action is taken.
      </p>
    </div>
  );
}
