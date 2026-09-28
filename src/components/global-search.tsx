'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Monitor, BookOpen, Database, BarChart, Users, FileText,
  ShieldAlert, CalendarDays, Search, ArrowRight, GraduationCap, Settings,
} from 'lucide-react';
import { mockExams, mockUsers } from '@/lib/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ALL_ROUTES = [
  { name: 'Dashboard', path: '/dashboard', icon: <Monitor className="w-4 h-4" />, color: 'text-primary' },
  { name: 'Exam Management', path: '/exams', icon: <BookOpen className="w-4 h-4" />, color: 'text-primary' },
  { name: 'Create Exam', path: '/exams/create', icon: <FileText className="w-4 h-4" />, color: 'text-primary' },
  { name: 'Question Bank', path: '/questions', icon: <Database className="w-4 h-4" />, color: 'text-accent' },
  { name: 'Students', path: '/students', icon: <Users className="w-4 h-4" />, color: 'text-blue-500' },
  { name: 'Reports & Analytics', path: '/reports', icon: <BarChart className="w-4 h-4" />, color: 'text-emerald-500' },
  { name: 'Student Analytics', path: '/analytics', icon: <GraduationCap className="w-4 h-4" />, color: 'text-purple-500' },
  { name: 'Integrity Alerts', path: '/alerts', icon: <ShieldAlert className="w-4 h-4" />, color: 'text-red-500' },
  { name: 'Exam Calendar', path: '/calendar', icon: <CalendarDays className="w-4 h-4" />, color: 'text-orange-500' },
  { name: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" />, color: 'text-muted-foreground' },
];

const STATUS_COLORS: Record<string, string> = {
  live: 'bg-red-500/15 text-red-600 border-red-500/30',
  upcoming: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  completed: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  draft: 'bg-muted text-muted-foreground',
  archived: 'bg-muted text-muted-foreground',
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    setQuery('');
    router.push(path);
  };

  const lowerQuery = query.toLowerCase().trim();

  const filteredExams = mockExams.filter(e =>
    e.title.toLowerCase().includes(lowerQuery) ||
    (e.subject && e.subject.toLowerCase().includes(lowerQuery))
  );
  const filteredStudents = mockUsers.filter(u =>
    u.role === 'student' &&
    (u.name.toLowerCase().includes(lowerQuery) || u.email.toLowerCase().includes(lowerQuery))
  );
  const filteredRoutes = ALL_ROUTES.filter(r =>
    r.name.toLowerCase().includes(lowerQuery)
  );

  const hasResults = filteredExams.length > 0 || filteredStudents.length > 0 || filteredRoutes.length > 0;

  return (
    <>
      {/* Trigger button in sidebar — compact */}
      <button
        onClick={() => setOpen(true)}
        className="flex-1 flex items-center gap-2 bg-sidebar-accent hover:bg-sidebar-accent/80 border border-sidebar-border rounded-lg px-3 py-1.5 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Search...</span>
        <kbd className="hidden sm:flex items-center gap-0.5 bg-sidebar-border/60 px-1 py-0.5 rounded text-[9px] font-bold font-mono">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden shadow-2xl border-primary/20 gap-0">
          {/* Search bar */}
          <div className="flex items-center gap-3 border-b px-4 py-3.5 bg-muted/30">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              placeholder="Search exams, students, or navigate to..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            )}
            <kbd className="hidden sm:flex bg-muted border px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground">ESC</kbd>
          </div>

          <ScrollArea className="max-h-[65vh]">
            <div className="p-2">
              {/* No results */}
              {lowerQuery && !hasResults && (
                <div className="py-10 text-center text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No results for "{query}"</p>
                  <p className="text-xs mt-1">Try searching exams, students or page names</p>
                </div>
              )}

              {/* Empty state */}
              {!lowerQuery && (
                <div className="py-6 px-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Navigation</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_ROUTES.slice(0, 6).map(route => (
                      <button
                        key={route.path}
                        onClick={() => handleSelect(route.path)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors text-left",
                          route.color
                        )}
                      >
                        {route.icon}
                        <span className="text-foreground text-xs font-medium">{route.name}</span>
                        <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam results */}
              {lowerQuery && filteredExams.length > 0 && (
                <div className="mb-2">
                  <p className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Exams</p>
                  {filteredExams.map(exam => (
                    <button
                      key={exam.id}
                      onClick={() => handleSelect(`/exams/${exam.id}`)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors group"
                    >
                      <BookOpen className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{exam.title}</p>
                        {exam.subject && <p className="text-xs text-muted-foreground">{exam.subject}</p>}
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] shrink-0", STATUS_COLORS[exam.status])}>
                        {exam.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Student results */}
              {lowerQuery && filteredStudents.length > 0 && (
                <div className="mb-2">
                  <p className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Students</p>
                  {filteredStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => handleSelect(`/students/${student.id}`)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors"
                    >
                      <Users className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Route results */}
              {lowerQuery && filteredRoutes.length > 0 && (
                <div>
                  <p className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pages</p>
                  {filteredRoutes.map(route => (
                    <button
                      key={route.path}
                      onClick={() => handleSelect(route.path)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors"
                    >
                      <span className={route.color}>{route.icon}</span>
                      <span>{route.name}</span>
                      <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer hint */}
          <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
