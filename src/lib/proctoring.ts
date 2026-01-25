import type { MalpracticeEvent, RiskLevel } from './types';

export type ViolationType = MalpracticeEvent['type'];

export const MALPRACTICE_WEIGHTS: Record<ViolationType, number> = {
  'No Face Detected': 25,
  'Multiple People': 30,
  'Gaze Away': 10,
  'Phone Detected': 40,
  'Tab Switch': 15,
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
    })
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
}
