'use client';

import { mockExams } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  getDay, addMonths, subMonths, isToday, isSameMonth,
} from 'date-fns';
import type { Exam } from '@/lib/types';

const statusColors: Record<Exam['status'], string> = {
  live: 'bg-red-500',
  upcoming: 'bg-amber-500',
  completed: 'bg-emerald-500',
  draft: 'bg-muted-foreground',
  archived: 'bg-muted-foreground/50',
};

const statusBadge: Record<Exam['status'], string> = {
  live: 'bg-red-500/10 text-red-600 border-red-500/30',
  upcoming: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  draft: 'bg-muted text-muted-foreground border-border',
  archived: 'bg-muted text-muted-foreground/60 border-border',
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart); // 0 = Sunday

  // Map exams to their start dates
  const examsWithDates = mockExams.filter(e => e.startDate);

  const getExamsForDay = (day: Date) =>
    examsWithDates.filter(e => e.startDate && isSameDay(new Date(e.startDate), day));

  const selectedDayExams = selectedDay ? getExamsForDay(selectedDay) : [];

  // All exams this month for list view
  const monthExams = examsWithDates
    .filter(e => e.startDate && isSameMonth(new Date(e.startDate), currentMonth))
    .sort((a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0));

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/10 min-h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Exam Calendar</h1>
        <p className="text-muted-foreground mt-1">Visual overview of exam schedule.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setCurrentMonth(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {dayNames.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Padding for first week */}
                {Array.from({ length: startPad }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-16 rounded-lg" />
                ))}
                {days.map(day => {
                  const dayExams = getExamsForDay(day);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);
                  const isCurrentDay = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={cn(
                        "h-16 rounded-lg p-1.5 text-left border-2 transition-all hover:border-primary/40 hover:bg-muted/40 relative flex flex-col",
                        isSelected ? "border-primary bg-primary/5" : "border-transparent",
                        isCurrentDay && !isSelected ? "border-primary/30 bg-primary/3" : ""
                      )}
                    >
                      <span className={cn(
                        "text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center",
                        isCurrentDay ? "bg-primary text-primary-foreground" : "text-foreground"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {/* Exam dots */}
                      <div className="flex gap-0.5 flex-wrap mt-0.5">
                        {dayExams.slice(0, 3).map(exam => (
                          <div
                            key={exam.id}
                            className={cn("w-1.5 h-1.5 rounded-full", statusColors[exam.status])}
                            title={exam.title}
                          />
                        ))}
                        {dayExams.length > 3 && (
                          <span className="text-[9px] text-muted-foreground">+{dayExams.length - 3}</span>
                        )}
                      </div>
                      {dayExams.length > 0 && (
                        <div className="mt-auto text-[10px] text-muted-foreground leading-tight line-clamp-1">
                          {dayExams[0].title.split(' ').slice(0, 2).join(' ')}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t flex-wrap">
                {[
                  { label: 'Live', color: 'bg-red-500' },
                  { label: 'Upcoming', color: 'bg-amber-500' },
                  { label: 'Completed', color: 'bg-emerald-500' },
                  { label: 'Draft', color: 'bg-muted-foreground' },
                ].map(item => (
                  <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
                    {item.label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Selected day exams */}
          {selectedDay && (
            <Card className="shadow-sm border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{format(selectedDay, 'EEEE, MMMM d')}</CardTitle>
                <CardDescription>{selectedDayExams.length} exam{selectedDayExams.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedDayExams.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No exams on this day.</p>
                ) : (
                  selectedDayExams.map(exam => (
                    <Link key={exam.id} href={`/exams/${exam.id}`} className="block group">
                      <div className="p-3 rounded-lg border hover:border-primary/30 hover:bg-muted/30 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">{exam.title}</p>
                          <Badge variant="outline" className={cn("text-xs shrink-0", statusBadge[exam.status])}>
                            {exam.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.duration}m</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{exam.studentIds.length}</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{exam.questions.length}q</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* This month list */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">This Month</CardTitle>
              <CardDescription>{monthExams.length} exam{monthExams.length !== 1 ? 's' : ''} in {format(currentMonth, 'MMMM')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {monthExams.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No exams this month.</p>
              ) : (
                monthExams.map(exam => (
                  <Link key={exam.id} href={`/exams/${exam.id}`} className="block group">
                    <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors">
                      <div className={cn("w-1 self-stretch rounded-full shrink-0 mt-0.5", statusColors[exam.status])} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{exam.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {exam.startDate ? format(new Date(exam.startDate), 'MMM d') : 'TBD'} · {exam.duration}m
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] shrink-0", statusBadge[exam.status])}>
                        {exam.status}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
