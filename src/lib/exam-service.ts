import type { Exam } from './types';
import { mockExams } from './mock-data';

const EXAMS_STORAGE_KEY = 'proctovision_exams_cache';

export async function fetchExams(): Promise<Exam[]> {
  try {
    const res = await fetch('/api/exams', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.exams)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(data.exams));
      }
      return data.exams;
    }
  } catch (err) {
    console.warn('API fetch exams failed, reading from local cache:', err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(EXAMS_STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return mockExams;
}

export async function createExamApi(exam: Partial<Exam>): Promise<Exam> {
  try {
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create exam');
    }
    return data.exam;
  } catch (err) {
    console.error('Failed to create exam via API:', err);
    throw err;
  }
}

export async function deleteExamApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/exams/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete exam');
    }
    return true;
  } catch (err) {
    console.error('Failed to delete exam via API:', err);
    throw err;
  }
}
