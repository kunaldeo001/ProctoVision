
export type ViolationType =
  | 'MULTIPLE_PEOPLE'
  | 'NO_FACE_DETECTED'
  | 'GAZE_AWAY'
  | 'PHONE_DETECTED'
  | 'TAB_SWITCH'
  | 'FULLSCREEN_EXIT'
  | 'INACTIVITY';

export const VIOLATION_DISPLAY_NAMES: Record<ViolationType, string> = {
  MULTIPLE_PEOPLE: 'Multiple People',
  NO_FACE_DETECTED: 'No Face Detected',
  GAZE_AWAY: 'Gaze Away',
  PHONE_DETECTED: 'Phone Detected',
  TAB_SWITCH: 'Tab Switch',
  FULLSCREEN_EXIT: 'Fullscreen Exit',
  INACTIVITY: 'Unusual Inactivity',
};

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'admin' | 'student';
  subject?: string;
  joinedDate?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'multi-select' | 'true-false' | 'short-answer';
  options: string[];
  correctOption?: number | number[]; // Can be array for multi-select
  correctTextAnswer?: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  explanation: string;
  tags: string[];
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject?: string;
  duration: number; // in minutes
  status: 'draft' | 'upcoming' | 'live' | 'completed' | 'archived';
  startDate: Date | null;
  endDate: Date | null;
  totalMarks: number;
  passingPercentage: number;
  proctoringLevel: 'none' | 'standard' | 'strict';
  instructions?: string;
  questions: Question[];
  studentIds: string[];
}

export interface MalpracticeEvent {
  id: string;
  studentId: string;
  examId: string;
  type: ViolationType;
  score: number;
  severity: 'low' | 'medium' | 'high';
  timestamp: number; // as Date.now()
  description?: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface StudentSession {
  studentId: string;
  totalScore: number;
  riskLevel: RiskLevel;
  events: MalpracticeEvent[];
}

export type SummarizeMalpracticeEventsOutput = {
    summary: string;
    riskAssessment: 'Low' | 'Medium' | 'High';
}

export interface ExamReport {
  id: string;
  studentId: string;
  examId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  malpracticeScore: number;
  riskLevel: RiskLevel;
  submittedAt?: number;
  timeTaken?: number; // in minutes
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
}
