
export type ViolationType =
  | 'MULTIPLE_PEOPLE'
  | 'NO_FACE_DETECTED'
  | 'GAZE_AWAY'
  | 'PHONE_DETECTED'
  | 'TAB_SWITCH';

export const VIOLATION_DISPLAY_NAMES: Record<ViolationType, string> = {
  MULTIPLE_PEOPLE: 'Multiple People',
  NO_FACE_DETECTED: 'No Face Detected',
  GAZE_AWAY: 'Gaze Away',
  PHONE_DETECTED: 'Phone Detected',
  TAB_SWITCH: 'Tab Switch',
};

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'admin' | 'student';
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
}

export interface Exam {
  id: string;
  title: string;
  duration: number; // in minutes
  status: 'upcoming' | 'live' | 'completed';
  questions: Question[];
  studentIds: string[];
}

export interface MalpracticeEvent {
  id: string;
  studentId: string;
  examId: string;
  type: ViolationType;
  score: number;
  timestamp: number; // as Date.now()
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
}
