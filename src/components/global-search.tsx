'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Monitor, BookOpen, Database, BarChart, User, FileText } from 'lucide-react';
import { mockExams, mockUsers } from '@/lib/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    setQuery('');
    router.push(path);
  };

  const lowerQuery = query.toLowerCase();

  const filteredExams = mockExams.filter(e => e.title.toLowerCase().includes(lowerQuery));
  const filteredStudents = mockUsers.filter(u => u.role === 'student' && (u.name.toLowerCase().includes(lowerQuery) || u.email.toLowerCase().includes(lowerQuery)));

  const routes = [
    { name: 'Dashboard', path: '/dashboard', icon: <Monitor className="w-4 h-4 mr-2" /> },
    { name: 'Exams', path: '/exams', icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { name: 'Create Exam', path: '/exams/create', icon: <FileText className="w-4 h-4 mr-2" /> },
    { name: 'Question Bank', path: '/questions', icon: <Database className="w-4 h-4 mr-2" /> },
    { name: 'Reports & Analytics', path: '/reports', icon: <BarChart className="w-4 h-4 mr-2" /> },
  ].filter(r => r.name.toLowerCase().includes(lowerQuery));

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-auto md:top-4 md:right-4 z-50 flex items-center gap-2 bg-background border shadow-sm rounded-full px-4 py-2 text-sm text-muted-foreground hover:border-primary/50 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden shadow-2xl border-primary/20">
          <div className="flex items-center border-b px-4 py-3 bg-muted/30">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input 
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
              placeholder="Search exams, students, or pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <kbd className="hidden sm:inline-flex bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium border text-muted-foreground">
              ESC
            </kbd>
          </div>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="p-2 space-y-4">
              {query && filteredExams.length > 0 && (
                <div>
                  <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Exams</h4>
                  {filteredExams.map(exam => (
                    <button 
                      key={exam.id} 
                      onClick={() => handleSelect(exam.status === 'live' ? `/dashboard/exams/${exam.id}/monitor` : `/dashboard/exams/${exam.id}/take`)}
                      className="w-full flex items-center px-2 py-2 text-sm rounded-md hover:bg-muted text-left"
                    >
                      <BookOpen className="w-4 h-4 mr-2 text-primary" />
                      <span className="flex-1 truncate">{exam.title}</span>
                      <span className="text-xs text-muted-foreground uppercase">{exam.status}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {query && filteredStudents.length > 0 && (
                <div>
                  <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Students</h4>
                  {filteredStudents.map(student => (
                    <button 
                      key={student.id} 
                      onClick={() => handleSelect('/reports')}
                      className="w-full flex items-center px-2 py-2 text-sm rounded-md hover:bg-muted text-left"
                    >
                      <User className="w-4 h-4 mr-2 text-accent" />
                      <div className="flex flex-col">
                        <span className="font-medium">{student.name}</span>
                        <span className="text-xs text-muted-foreground">{student.email}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <div>
                 <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</h4>
                 {routes.map(route => (
                   <button 
                      key={route.path} 
                      onClick={() => handleSelect(route.path)}
                      className="w-full flex items-center px-2 py-2 text-sm rounded-md hover:bg-muted text-left"
                    >
                      {route.icon}
                      <span>{route.name}</span>
                    </button>
                 ))}
                 {routes.length === 0 && !query && (
                    <div className="p-4 text-center text-sm text-muted-foreground">Start typing to search...</div>
                 )}
                 {query && routes.length === 0 && filteredExams.length === 0 && filteredStudents.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">No results found for "{query}".</div>
                 )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
