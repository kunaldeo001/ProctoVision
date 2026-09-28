'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Exam } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Trash2, Copy, Archive, Edit, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ExamListProps = {
  exams: Exam[];
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDuplicate?: (id: string) => void;
};

const statusVariant: Record<Exam['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  live: 'destructive', // Using destructive for red/live (or success)
  completed: 'default',
  upcoming: 'secondary',
  draft: 'outline',
  archived: 'outline',
};

export function ExamList({ exams, onDelete, onArchive, onDuplicate }: ExamListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("date-desc");
  
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  const filteredAndSortedExams = useMemo(() => {
    let result = exams;

    // Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(lowerSearch));
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(e => e.status === statusFilter);
    }

    // Sorting
    result = [...result].sort((a, b) => {
      switch (sortOrder) {
        case 'date-desc':
          return (b.startDate?.getTime() || 0) - (a.startDate?.getTime() || 0);
        case 'date-asc':
          return (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0);
        case 'students-desc':
          return b.studentIds.length - a.studentIds.length;
        case 'duration-desc':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

    return result;
  }, [exams, search, statusFilter, sortOrder]);

  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">All Exams</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search exams..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="students-desc">Most Students</SelectItem>
                <SelectItem value="duration-desc">Longest Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No exams found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedExams.map((exam) => (
                  <TableRow key={exam.id} className="group hover:bg-muted/30">
                    <TableCell className="font-medium">
                        <div className="flex flex-col">
                            <Link href={`/exams/${exam.id}`} className="hover:text-primary hover:underline transition-colors">
                              {exam.title}
                            </Link>
                            <span className="text-xs text-muted-foreground line-clamp-1">{exam.description || 'No description'}</span>
                        </div>
                    </TableCell>
                    <TableCell>{exam.duration} min</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={statusVariant[exam.status]} className="capitalize">
                        {exam.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        {exam.studentIds.length}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/exams/${exam.id}`} className="flex items-center"><ExternalLink className="mr-2 h-4 w-4" />View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {exam.status === 'live' && (
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/exams/${exam.id}/monitor`}>Monitor Session</Link>
                            </DropdownMenuItem>
                          )}
                          {(exam.status === 'live' || exam.status === 'upcoming') && (
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/exams/${exam.id}/take`}>Take Exam</Link>
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          {onDuplicate && (
                             <DropdownMenuItem className="cursor-pointer" onClick={() => onDuplicate(exam.id)}>
                                <Copy className="mr-2 h-4 w-4" /> Duplicate
                            </DropdownMenuItem>
                          )}
                          {onArchive && exam.status !== 'archived' && (
                             <DropdownMenuItem className="cursor-pointer" onClick={() => onArchive(exam.id)}>
                                <Archive className="mr-2 h-4 w-4" /> Archive
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {onDelete && (
                            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => setExamToDelete(exam.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Exam
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={!!examToDelete} onOpenChange={() => setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (examToDelete && onDelete) {
                  onDelete(examToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
