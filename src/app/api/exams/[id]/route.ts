import { NextResponse } from 'next/server';
import { getStoredExams, deleteStoredExam } from '@/lib/server/exam-store';

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const exams = await getStoredExams();
    const exam = exams.find(e => e.id === id);

    if (!exam) {
      return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error('Failed to get exam:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve exam' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const deleted = await deleteStoredExam(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to delete exam:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete exam' }, { status: 500 });
  }
}
