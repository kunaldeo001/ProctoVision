import { NextResponse } from 'next/server';
import { getStoredExams, createStoredExam } from '@/lib/server/exam-store';

export async function GET() {
  try {
    const exams = await getStoredExams();
    return NextResponse.json({ success: true, exams });
  } catch (error) {
    console.error('Failed to get exams:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, duration, questions, studentIds, passingPercentage, proctoringLevel, instructions, subject } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ success: false, error: 'Exam title is required.' }, { status: 400 });
    }

    const newExam = await createStoredExam({
      title: title.trim(),
      description: description || '',
      subject: subject || 'General',
      duration: Number(duration) || 60,
      status: 'upcoming',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      totalMarks: Array.isArray(questions) ? questions.reduce((sum: number, q: any) => sum + (q.marks || 10), 0) : 100,
      passingPercentage: Number(passingPercentage) || 50,
      proctoringLevel: proctoringLevel || 'standard',
      instructions: instructions || 'Follow all proctoring guidelines during the test.',
      questions: Array.isArray(questions) ? questions : [],
      studentIds: Array.isArray(studentIds) ? studentIds : [],
    });

    return NextResponse.json({ success: true, exam: newExam }, { status: 201 });
  } catch (error) {
    console.error('Failed to create exam:', error);
    return NextResponse.json({ success: false, error: 'Failed to create exam' }, { status: 500 });
  }
}
