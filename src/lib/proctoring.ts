import type { RiskLevel } from './types';

export const MALPRACTICE_WEIGHTS: Record<string, number> = {
  'No Face Detected': 20,
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
