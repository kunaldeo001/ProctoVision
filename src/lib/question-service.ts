import type { Question } from './types';
import { mockQuestions } from './mock-data';

const STORAGE_KEY = 'proctovision_questions_cache';

export async function fetchQuestions(): Promise<Question[]> {
  try {
    const res = await fetch('/api/questions', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.questions)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.questions));
      }
      return data.questions;
    }
  } catch (err) {
    console.warn('API fetch failed, reading from local cache:', err);
  }

  // Fallback to localStorage or mock data
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return mockQuestions;
}

export async function createQuestionApi(question: Partial<Question>): Promise<Question> {
  try {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create question');
    }
    return data.question;
  } catch (err) {
    console.error('Failed to create question via API:', err);
    throw err;
  }
}

export async function bulkCreateQuestionsApi(questions: Question[]): Promise<Question[]> {
  try {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questions),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save questions');
    }
    return data.questions;
  } catch (err) {
    console.error('Failed to bulk save questions via API:', err);
    throw err;
  }
}

export async function updateQuestionApi(id: string, updates: Partial<Question>): Promise<Question> {
  try {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update question');
    }
    return data.question;
  } catch (err) {
    console.error('Failed to update question via API:', err);
    throw err;
  }
}

export async function deleteQuestionApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete question');
    }
    return true;
  } catch (err) {
    console.error('Failed to delete question via API:', err);
    throw err;
  }
}
