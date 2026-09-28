import fs from 'fs/promises';
import path from 'path';
import type { Question } from '../types';
import { mockQuestions } from '../mock-data';

// Primary and fallback storage file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const FALLBACK_FILE = path.join('/tmp', 'proctovision-questions.json');

// In-memory cache to ensure speed and resilience across serverless execution
let memoryCache: Question[] | null = null;

async function ensureDataFile(): Promise<string> {
  // Check if primary path is accessible
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(QUESTIONS_FILE);
      return QUESTIONS_FILE;
    } catch {
      // Initialize with mockQuestions
      await fs.writeFile(QUESTIONS_FILE, JSON.stringify(mockQuestions, null, 2), 'utf-8');
      return QUESTIONS_FILE;
    }
  } catch (err) {
    console.warn('Failed to access primary storage path, falling back to /tmp:', err);
    try {
      await fs.access(FALLBACK_FILE);
      return FALLBACK_FILE;
    } catch {
      await fs.writeFile(FALLBACK_FILE, JSON.stringify(mockQuestions, null, 2), 'utf-8');
      return FALLBACK_FILE;
    }
  }
}

export async function getStoredQuestions(): Promise<Question[]> {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  try {
    const filePath = await ensureDataFile();
    const data = await fs.readFile(filePath, 'utf-8');
    memoryCache = JSON.parse(data) as Question[];
    return memoryCache;
  } catch (error) {
    console.error('Error reading questions store:', error);
    memoryCache = [...mockQuestions];
    return memoryCache;
  }
}

async function persistQuestions(questions: Question[]): Promise<void> {
  memoryCache = questions;
  try {
    const filePath = await ensureDataFile();
    await fs.writeFile(filePath, JSON.stringify(questions, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error persisting questions to disk (cached in memory):', error);
  }
}

export async function createStoredQuestion(
  questionData: Omit<Question, 'id'> & { id?: string }
): Promise<Question> {
  const current = await getStoredQuestions();
  const id = questionData.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newQuestion: Question = {
    ...questionData,
    id,
    tags: Array.isArray(questionData.tags) ? questionData.tags : [],
    options: Array.isArray(questionData.options) ? questionData.options : [],
    marks: Number(questionData.marks) || 10,
    difficulty: questionData.difficulty || 'medium',
    topic: questionData.topic || 'General',
    explanation: questionData.explanation || '',
  };

  const updated = [newQuestion, ...current];
  await persistQuestions(updated);
  return newQuestion;
}

export async function bulkCreateStoredQuestions(
  newQuestions: Question[]
): Promise<Question[]> {
  const current = await getStoredQuestions();
  const validated = newQuestions.map(q => ({
    ...q,
    id: q.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  }));

  const updated = [...validated, ...current];
  await persistQuestions(updated);
  return validated;
}

export async function updateStoredQuestion(
  id: string,
  updates: Partial<Question>
): Promise<Question | null> {
  const current = await getStoredQuestions();
  const index = current.findIndex(q => q.id === id);
  if (index === -1) {
    return null;
  }

  const updatedQuestion: Question = {
    ...current[index],
    ...updates,
    id, // protect id from being overwritten
  };

  const updated = [...current];
  updated[index] = updatedQuestion;
  await persistQuestions(updated);
  return updatedQuestion;
}

export async function deleteStoredQuestion(id: string): Promise<boolean> {
  const current = await getStoredQuestions();
  const filtered = current.filter(q => q.id !== id);
  if (filtered.length === current.length) {
    return false;
  }

  await persistQuestions(filtered);
  return true;
}
