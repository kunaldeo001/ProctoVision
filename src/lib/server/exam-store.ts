import fs from 'fs/promises';
import path from 'path';
import type { Exam } from '../types';
import { mockExams } from '../mock-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const EXAMS_FILE = path.join(DATA_DIR, 'exams.json');
const FALLBACK_FILE = path.join('/tmp', 'proctovision-exams.json');

let memoryCache: Exam[] | null = null;

async function ensureDataFile(): Promise<string> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(EXAMS_FILE);
      return EXAMS_FILE;
    } catch {
      await fs.writeFile(EXAMS_FILE, JSON.stringify(mockExams, null, 2), 'utf-8');
      return EXAMS_FILE;
    }
  } catch (err) {
    console.warn('Failed to access primary exams storage path, falling back to /tmp:', err);
    try {
      await fs.access(FALLBACK_FILE);
      return FALLBACK_FILE;
    } catch {
      await fs.writeFile(FALLBACK_FILE, JSON.stringify(mockExams, null, 2), 'utf-8');
      return FALLBACK_FILE;
    }
  }
}

export async function getStoredExams(): Promise<Exam[]> {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  try {
    const filePath = await ensureDataFile();
    const data = await fs.readFile(filePath, 'utf-8');
    memoryCache = JSON.parse(data) as Exam[];
    return memoryCache;
  } catch (error) {
    console.error('Error reading exams store:', error);
    memoryCache = [...mockExams];
    return memoryCache;
  }
}

async function persistExams(exams: Exam[]): Promise<void> {
  memoryCache = exams;
  try {
    const filePath = await ensureDataFile();
    await fs.writeFile(filePath, JSON.stringify(exams, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error persisting exams to disk (cached in memory):', error);
  }
}

export async function createStoredExam(examData: Omit<Exam, 'id'> & { id?: string }): Promise<Exam> {
  const current = await getStoredExams();
  const id = examData.id || `exam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newExam: Exam = {
    ...examData,
    id,
    startDate: examData.startDate ? new Date(examData.startDate) : new Date(),
    endDate: examData.endDate ? new Date(examData.endDate) : new Date(Date.now() + 86400000),
    questions: Array.isArray(examData.questions) ? examData.questions : [],
    studentIds: Array.isArray(examData.studentIds) ? examData.studentIds : [],
  };

  const updated = [newExam, ...current];
  await persistExams(updated);
  return newExam;
}

export async function deleteStoredExam(id: string): Promise<boolean> {
  const current = await getStoredExams();
  const filtered = current.filter(e => e.id !== id);
  if (filtered.length === current.length) {
    return false;
  }
  await persistExams(filtered);
  return true;
}
