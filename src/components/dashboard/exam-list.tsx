'use client';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exam } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type ExamListProps = {
  exams: Exam[];
};

const statusVariant: { [key in Exam['status']]: 'default' | 'secondary' | 'destructive' } = {
  live: 'destructive',
  completed: 'default',
  upcoming: 'secondary',
};

export function ExamList({ exams }: ExamListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Students</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.title}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={statusVariant[exam.status]} className="capitalize">
                    {exam.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{exam.studentIds.length}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {exam.status === 'live' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/exams/${exam.id}/monitor`}>Monitor Session</Link>
                        </DropdownMenuItem>
                      )}
                      {exam.status === 'completed' && (
                        <DropdownMenuItem>View Report</DropdownMenuItem>
                      )}
                      {exam.status === 'upcoming' && (
                        <DropdownMenuItem>Start Exam</DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
