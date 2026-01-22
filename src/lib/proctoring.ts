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
  private violations: Record<ViolationType, number> = {
    'Multiple People': 0,
    'No Face Detected': 0,
    'Phone Detected': 0,
    'Gaze Away': 0,
    'Tab Switch': 0,
  };

  addViolation(type: ViolationType) {
    this.violations[type] += 1;
    this.score += MALPRACTICE_WEIGHTS[type];

    // Clamp score
    if (this.score > MAX_SCORE) {
      this.score = MAX_SCORE;
    }
  }

  getRiskLevel(): RiskLevel {
    if (this.score >= 60) return 'High';
    if (this.score >= 25) return 'Medium';
    return 'Low';
  }

  getReport() {
    return {
      totalScore: this.score,
      riskLevel: this.getRiskLevel(),
      violations: this.violations,
    };
  }
}
