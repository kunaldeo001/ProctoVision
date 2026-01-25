
import type { MalpracticeEvent, RiskLevel, ViolationType } from './types';

export const MALPRACTICE_WEIGHTS: Record<ViolationType, number> = {
  NO_FACE_DETECTED: 25,
  MULTIPLE_PEOPLE: 30,
  GAZE_AWAY: 10,
  PHONE_DETECTED: 40,
  TAB_SWITCH: 15,
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
