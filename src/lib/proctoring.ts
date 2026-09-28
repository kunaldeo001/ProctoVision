
import type { MalpracticeEvent, RiskLevel, ViolationType } from './types';

export const MALPRACTICE_WEIGHTS: Record<ViolationType, number> = {
  NO_FACE_DETECTED: 25,
  MULTIPLE_PEOPLE: 30,
  GAZE_AWAY: 10,
  PHONE_DETECTED: 40,
  TAB_SWITCH: 15,
  FULLSCREEN_EXIT: 20,
  INACTIVITY: 8,
};

export const VIOLATION_SEVERITY: Record<ViolationType, 'low' | 'medium' | 'high'> = {
  GAZE_AWAY: 'low',
  TAB_SWITCH: 'medium',
  INACTIVITY: 'low',
  NO_FACE_DETECTED: 'medium',
  FULLSCREEN_EXIT: 'medium',
  MULTIPLE_PEOPLE: 'high',
  PHONE_DETECTED: 'high',
};

export const VIOLATION_DESCRIPTIONS: Record<ViolationType, string> = {
  GAZE_AWAY: 'Student appears to be looking away from the screen.',
  TAB_SWITCH: 'Student navigated away from the exam tab.',
  INACTIVITY: 'Unusual inactivity detected during the session.',
  NO_FACE_DETECTED: 'No face detected in the camera frame.',
  FULLSCREEN_EXIT: 'Student exited fullscreen exam mode.',
  MULTIPLE_PEOPLE: 'More than one person detected in camera view.',
  PHONE_DETECTED: 'Mobile phone or device detected in frame.',
};

export const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 60) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
};

const MAX_SCORE = 100;

export class MalpracticeChecker {
  private score = 0;
  private violations: Record<string, number> = {};
  public events: MalpracticeEvent[] = [];
  private studentId: string;
  private examId: string;

  constructor(studentId: string, examId: string) {
    this.studentId = studentId;
    this.examId = examId;
    Object.keys(MALPRACTICE_WEIGHTS).forEach(key => {
      this.violations[key] = 0;
    });
  }

  addViolation(type: ViolationType): MalpracticeEvent {
    this.violations[type] = (this.violations[type] || 0) + 1;
    this.score += MALPRACTICE_WEIGHTS[type];

    if (this.score > MAX_SCORE) {
      this.score = MAX_SCORE;
    }

    const newEvent: MalpracticeEvent = {
      id: `evt-${Date.now()}-${Math.random()}`,
      studentId: this.studentId,
      examId: this.examId,
      type,
      score: MALPRACTICE_WEIGHTS[type],
      severity: VIOLATION_SEVERITY[type],
      description: VIOLATION_DESCRIPTIONS[type],
      timestamp: Date.now(),
    };
    this.events.unshift(newEvent);
    return newEvent;
  }

  get totalScore(): number {
    return this.score;
  }

  get riskLevel(): RiskLevel {
    return getRiskLevel(this.score);
  }

  getReport() {
    return {
      studentId: this.studentId,
      totalScore: this.score,
      riskLevel: this.riskLevel,
      events: this.events,
    };
  }

  isOverThreshold(): boolean {
    return this.score >= MAX_SCORE;
  }

  isAtWarningThreshold(): boolean {
    return this.score >= 75;
  }

  getViolationCount(type: ViolationType): number {
    return this.violations[type] || 0;
  }
}
