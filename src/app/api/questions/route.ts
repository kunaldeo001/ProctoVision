import { NextResponse } from 'next/server';
import { getStoredQuestions, createStoredQuestion, bulkCreateStoredQuestions } from '@/lib/server/question-store';
import type { Question } from '@/lib/types';

export async function GET() {
  try {
    const questions = await getStoredQuestions();
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('Failed to get questions:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if bulk array was submitted
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ success: false, error: 'Array cannot be empty' }, { status: 400 });
      }
      const questions = await bulkCreateStoredQuestions(body as Question[]);
      return NextResponse.json({ success: true, questions }, { status: 201 });
    }

    const { text, type, options, marks, difficulty, topic, explanation, tags, correctOption, correctTextAnswer } = body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ success: false, error: 'Question text is required.' }, { status: 400 });
    }

    if (!type || !['mcq', 'multi-select', 'true-false', 'short-answer'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Valid question type is required.' }, { status: 400 });
    }

    if ((type === 'mcq' || type === 'multi-select') && (!Array.isArray(options) || options.length < 2)) {
      return NextResponse.json({ success: false, error: 'At least 2 options are required for multiple choice.' }, { status: 400 });
    }

    const newQuestion = await createStoredQuestion({
      text: text.trim(),
      type,
      options: options || [],
      correctOption,
      correctTextAnswer,
      marks: Number(marks) || 10,
      difficulty: difficulty || 'medium',
      topic: (topic && topic.trim()) || 'General',
      explanation: explanation || '',
      tags: Array.isArray(tags) ? tags : [],
    });

    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json({ success: false, error: 'Failed to create question' }, { status: 500 });
  }
}
