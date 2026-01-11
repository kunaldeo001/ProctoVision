import type { User, Exam } from './types';
import { PlaceHolderImages } from './placeholder-images';

const studentImages = PlaceHolderImages.filter(img => img.id.startsWith('student-'));

export const mockUsers: User[] = [
  { id: 'admin-1', name: 'Dr. Evelyn Reed', email: 'e.reed@university.edu', avatarUrl: 'https://picsum.photos/seed/a1/100/100', role: 'admin' },
  { id: 'student-1', name: 'Alice Johnson', email: 'alice.j@university.edu', avatarUrl: studentImages[0]?.imageUrl || '', role: 'student' },
  { id: 'student-2', name: 'Bob Williams', email: 'bob.w@university.edu', avatarUrl: studentImages[1]?.imageUrl || '', role: 'student' },
  { id: 'student-3', name: 'Charlie Brown', email: 'charlie.b@university.edu', avatarUrl: studentImages[2]?.imageUrl || '', role: 'student' },
  { id: 'student-4', name: 'Diana Miller', email: 'diana.m@university.edu', avatarUrl: studentImages[3]?.imageUrl || '', role: 'student' },
];

export const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Introduction to Artificial Intelligence - Midterm',
    duration: 60,
    status: 'live',
    studentIds: ['student-1', 'student-2', 'student-3', 'student-4'],
    questions: [
      { id: 'q1', text: 'What is the primary goal of unsupervised learning?', options: ['Classification', 'Regression', 'Clustering', 'Reinforcement'], correctOption: 2 },
      { id: 'q2', text: 'Which of these is not a type of neural network?', options: ['CNN', 'RNN', 'GNN', 'TNN'], correctOption: 3 },
      { id: 'q3', text: 'What does the "Turing Test" evaluate?', options: ['A machine\'s processing speed', 'A machine\'s ability to exhibit intelligent behavior', 'A machine\'s storage capacity', 'A machine\'s battery life'], correctOption: 1 },
      { id: 'q4', text: 'In Python, which library is most commonly used for machine learning?', options: ['NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib'], correctOption: 2 },
    ],
  },
  {
    id: '2',
    title: 'Calculus II - Final Exam',
    duration: 120,
    status: 'completed',
    studentIds: ['student-1', 'student-2'],
    questions: [
       { id: 'q1', text: 'What is the integral of 2x?', options: ['2', 'x^2', 'x^2 + C', '2x^2'], correctOption: 2 },
    ],
  },
  {
    id: '3',
    title: 'Modern Physics - Quiz 3',
    duration: 30,
    status: 'upcoming',
    studentIds: ['student-3', 'student-4'],
    questions: [
       { id: 'q1', text: 'Who proposed the theory of general relativity?', options: ['Isaac Newton', 'Galileo Galilei', 'Albert Einstein', 'Stephen Hawking'], correctOption: 2 },
    ],
  },
];
