'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Question } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Trash2, Edit, Eye } from "lucide-react";
import { QuestionPreviewModal } from './question-preview-modal';

type QuestionListProps = {
  questions: Question[];
  onDelete: (id: string) => void;
  onEdit?: (question: Question) => void;
};

const difficultyVariant: Record<Question['difficulty'], 'default' | 'secondary' | 'destructive'> = {
  easy: 'secondary',
  medium: 'default',
  hard: 'destructive',
};

export function QuestionList({ questions, onDelete, onEdit }: QuestionListProps) {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const topics = useMemo(() => Array.from(new Set(questions.map(q => q.topic))), [questions]);

  const filteredQuestions = useMemo(() => {
    let result = questions;

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(q => q.text.toLowerCase().includes(lowerSearch) || q.topic.toLowerCase().includes(lowerSearch));
    }

    if (topicFilter !== "all") {
      result = result.filter(q => q.topic === topicFilter);
    }

    if (difficultyFilter !== "all") {
      result = result.filter(q => q.difficulty === difficultyFilter);
    }

    return result;
  }, [questions, search, topicFilter, difficultyFilter]);

  return (
    <>
    <Card className="shadow-sm border-muted">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Questions</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search questions or topics..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
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
                <TableHead className="w-[400px]">Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead className="text-center">Difficulty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No questions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map((question) => (
                  <TableRow key={question.id} className="group hover:bg-muted/30 cursor-pointer" onClick={() => setPreviewQuestion(question)}>
                    <TableCell className="font-medium">
                      <div className="line-clamp-2" title={question.text}>{question.text}</div>
                    </TableCell>
                    <TableCell className="uppercase text-xs font-semibold text-muted-foreground">{question.type}</TableCell>
                    <TableCell>{question.topic}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={difficultyVariant[question.difficulty]} className="capitalize">
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-50 group-hover:opacity-100" onClick={e => { e.stopPropagation(); setPreviewQuestion(question); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer" onClick={e => { e.stopPropagation(); setPreviewQuestion(question); }}>
                              <Eye className="mr-2 h-4 w-4" /> Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={e => { e.stopPropagation(); onEdit?.(question); }}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={e => { e.stopPropagation(); onDelete(question.id); }}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                      </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    <QuestionPreviewModal
      question={previewQuestion}
      open={!!previewQuestion}
      onOpenChange={open => { if (!open) setPreviewQuestion(null); }}
    />
  </>
  );
}
