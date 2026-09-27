import type { User, Exam, ExamReport } from './types';
import { PlaceHolderImages } from './placeholder-images';

const studentImages = PlaceHolderImages.filter(img => img.id.startsWith('student-'));

export const mockUsers: User[] = [
  { id: 'admin-1', name: 'Kunal Deo', email: 'kunal.deo@srm.edu', avatarUrl: 'https://picsum.photos/seed/a1/100/100', role: 'admin' },
  { id: 'student-1', name: 'Priya Sharma', email: 'priya.s@srm.edu', avatarUrl: studentImages[0]?.imageUrl || '', role: 'student' },
  { id: 'student-2', name: 'Rohan Gupta', email: 'rohan.g@srm.edu', avatarUrl: studentImages[1]?.imageUrl || '', role: 'student' },
  { id: 'student-3', name: 'Anjali Singh', email: 'anjali.s@srm.edu', avatarUrl: studentImages[2]?.imageUrl || '', role: 'student' },
  { id: 'student-4', name: 'Vikram Kumar', email: 'vikram.k@srm.edu', avatarUrl: studentImages[3]?.imageUrl || '', role: 'student' },
];

export const mockQuestions: Question[] = [
  { id: 'q1', type: 'mcq', text: 'What is the primary goal of unsupervised learning?', options: ['Classification', 'Regression', 'Clustering', 'Reinforcement'], correctOption: 2, marks: 10, difficulty: 'medium', topic: 'Machine Learning', explanation: 'Unsupervised learning aims to find hidden structures or clusters in unlabeled data.', tags: ['ML', 'Basics'] },
  { id: 'q2', type: 'mcq', text: 'Which of these is not a type of neural network?', options: ['CNN', 'RNN', 'GNN', 'TNN'], correctOption: 3, marks: 10, difficulty: 'medium', topic: 'Deep Learning', explanation: 'TNN (Temporal Neural Network) is not a standard widely recognized type compared to CNNs, RNNs, and GNNs.', tags: ['DL', 'Networks'] },
  { id: 'q3', type: 'mcq', text: 'What does the "Turing Test" evaluate?', options: ['A machine\'s processing speed', 'A machine\'s ability to exhibit intelligent behavior', 'A machine\'s storage capacity', 'A machine\'s battery life'], correctOption: 1, marks: 10, difficulty: 'easy', topic: 'History of AI', explanation: 'The Turing test checks if a machine can imitate human conversation convincingly.', tags: ['History', 'Turing'] },
  { id: 'q4', type: 'mcq', text: 'In Python, which library is most commonly used for machine learning?', options: ['NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib'], correctOption: 2, marks: 10, difficulty: 'easy', topic: 'Tools', explanation: 'Scikit-learn is the standard ML library in Python.', tags: ['Python', 'Libraries'] },
  { id: 'q5', type: 'true-false', text: 'Gradient descent is an optimization algorithm used to minimize the loss function.', options: ['True', 'False'], correctOption: 0, marks: 5, difficulty: 'medium', topic: 'Optimization', explanation: 'Gradient descent iteratively moves towards the minimum of the loss function.', tags: ['Math', 'ML'] },
  { id: 'q6', type: 'multi-select', text: 'Which of the following are activation functions?', options: ['ReLU', 'Sigmoid', 'Linear Regression', 'Tanh'], correctOption: [0, 1, 3], marks: 15, difficulty: 'hard', topic: 'Deep Learning', explanation: 'Linear regression is a model, not an activation function.', tags: ['DL', 'Math'] },
];

export const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Introduction to Artificial Intelligence - Midterm',
    description: 'A comprehensive midterm covering basic AI concepts, search algorithms, and machine learning fundamentals.',
    duration: 60,
    status: 'live',
    startDate: new Date(Date.now() - 3600000), // 1 hour ago
    endDate: new Date(Date.now() + 86400000), // tomorrow
    totalMarks: 40,
    passingPercentage: 50,
    proctoringLevel: 'strict',
    studentIds: ['student-1', 'student-2', 'student-3', 'student-4'],
    questions: [
      { id: 'q1', type: 'mcq', text: 'What is the primary goal of unsupervised learning?', options: ['Classification', 'Regression', 'Clustering', 'Reinforcement'], correctOption: 2, marks: 10, difficulty: 'medium', topic: 'Machine Learning', explanation: 'Unsupervised learning aims to find hidden structures or clusters in unlabeled data.', tags: ['ML', 'Basics'] },
      { id: 'q2', type: 'mcq', text: 'Which of these is not a type of neural network?', options: ['CNN', 'RNN', 'GNN', 'TNN'], correctOption: 3, marks: 10, difficulty: 'medium', topic: 'Deep Learning', explanation: 'TNN (Temporal Neural Network) is not a standard widely recognized type compared to CNNs, RNNs, and GNNs.', tags: ['DL', 'Networks'] },
      { id: 'q3', type: 'mcq', text: 'What does the "Turing Test" evaluate?', options: ['A machine\'s processing speed', 'A machine\'s ability to exhibit intelligent behavior', 'A machine\'s storage capacity', 'A machine\'s battery life'], correctOption: 1, marks: 10, difficulty: 'easy', topic: 'History of AI', explanation: 'The Turing test checks if a machine can imitate human conversation convincingly.', tags: ['History', 'Turing'] },
      { id: 'q4', type: 'mcq', text: 'In Python, which library is most commonly used for machine learning?', options: ['NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib'], correctOption: 2, marks: 10, difficulty: 'easy', topic: 'Tools', explanation: 'Scikit-learn is the standard ML library in Python.', tags: ['Python', 'Libraries'] },
    ],
  },
  {
    id: '2',
    title: 'Calculus II - Final Exam',
    description: 'Final examination for Calculus II covering integration techniques and series.',
    duration: 120,
    status: 'completed',
    startDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
    endDate: new Date(Date.now() - 86400000 * 1), // 1 day ago
    totalMarks: 100,
    passingPercentage: 60,
    proctoringLevel: 'standard',
    studentIds: ['student-1', 'student-2'],
    questions: [
       { id: 'q1', type: 'mcq', text: 'What is the integral of 2x?', options: ['2', 'x^2', 'x^2 + C', '2x^2'], correctOption: 2, marks: 100, difficulty: 'easy', topic: 'Integration', explanation: 'The power rule for integration gives x^2 + C.', tags: ['Math'] },
    ],
  },
  {
    id: '3',
    title: 'Modern Physics - Quiz 3',
    description: 'Short quiz on Relativity and Quantum Mechanics.',
    duration: 30,
    status: 'upcoming',
    startDate: new Date(Date.now() + 86400000 * 3), // in 3 days
    endDate: new Date(Date.now() + 86400000 * 4),
    totalMarks: 20,
    passingPercentage: 50,
    proctoringLevel: 'none',
    studentIds: ['student-3', 'student-4'],
    questions: [
       { id: 'q1', type: 'mcq', text: 'Who proposed the theory of general relativity?', options: ['Isaac Newton', 'Galileo Galilei', 'Albert Einstein', 'Stephen Hawking'], correctOption: 2, marks: 20, difficulty: 'easy', topic: 'Relativity', explanation: 'Albert Einstein formulated General Relativity in 1915.', tags: ['Physics', 'History'] },
    ],
  },
];

const javaExam1: Exam = {
    id: 'java-1',
    title: 'Java Fundamentals',
    description: 'Basic Java syntax, variables, and control flow.',
    duration: 45,
    status: 'draft',
    startDate: null,
    endDate: null,
    totalMarks: 50,
    passingPercentage: 50,
    proctoringLevel: 'standard',
    studentIds: [],
    questions: [
        { id: 'j1q1', type: 'mcq', text: 'Which keyword is used for inheritance in Java?', options: ['extends', 'implements', 'inherits', 'super'], correctOption: 0, marks: 5, difficulty: 'easy', topic: 'OOP', explanation: '', tags: [] },
        { id: 'j1q2', type: 'mcq', text: 'What is the size of an int in Java?', options: ['2 bytes', '4 bytes', '8 bytes', 'Depends on platform'], correctOption: 1, marks: 5, difficulty: 'easy', topic: 'Basics', explanation: '', tags: [] },
    ]
};

mockExams.push(javaExam1);

export const mockReports: ExamReport[] = [
    { id: 'rep-1', studentId: 'student-1', examId: '2', score: 1, totalQuestions: 1, percentage: 100, malpracticeScore: 10, riskLevel: 'Low' },
    { id: 'rep-2', studentId: 'student-2', examId: '2', score: 0, totalQuestions: 1, percentage: 0, malpracticeScore: 75, riskLevel: 'High' },
    { id: 'rep-5', studentId: 'student-1', examId: '1', score: 3, totalQuestions: 4, percentage: 75, malpracticeScore: 40, riskLevel: 'Medium' },
];
