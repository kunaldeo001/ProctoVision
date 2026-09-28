import type { User, Exam, ExamReport, Question, Notification } from './types';
import { PlaceHolderImages } from './placeholder-images';

const studentImages = PlaceHolderImages.filter(img => img.id.startsWith('student-'));

export const mockUsers: User[] = [
  { id: 'admin-1', name: 'Kunal Deo', email: 'kunal.deo@srm.edu', avatarUrl: 'https://picsum.photos/seed/a1/100/100', role: 'admin', subject: 'Administration', joinedDate: '2023-01-10' },
  { id: 'student-1', name: 'Priya Sharma', email: 'priya.s@srm.edu', avatarUrl: studentImages[0]?.imageUrl || '', role: 'student', joinedDate: '2023-08-01' },
  { id: 'student-2', name: 'Rohan Gupta', email: 'rohan.g@srm.edu', avatarUrl: studentImages[1]?.imageUrl || '', role: 'student', joinedDate: '2023-08-01' },
  { id: 'student-3', name: 'Anjali Singh', email: 'anjali.s@srm.edu', avatarUrl: studentImages[2]?.imageUrl || '', role: 'student', joinedDate: '2023-08-01' },
  { id: 'student-4', name: 'Vikram Kumar', email: 'vikram.k@srm.edu', avatarUrl: studentImages[3]?.imageUrl || '', role: 'student', joinedDate: '2023-08-01' },
  { id: 'student-5', name: 'Neha Patel', email: 'neha.p@srm.edu', avatarUrl: 'https://picsum.photos/seed/np5/100/100', role: 'student', joinedDate: '2023-08-01' },
  { id: 'student-6', name: 'Arjun Mehta', email: 'arjun.m@srm.edu', avatarUrl: 'https://picsum.photos/seed/am6/100/100', role: 'student', joinedDate: '2023-08-01' },
];

export const mockQuestions: Question[] = [
  { id: 'q1', type: 'mcq', text: 'What is the primary goal of unsupervised learning?', options: ['Classification', 'Regression', 'Clustering', 'Reinforcement'], correctOption: 2, marks: 10, difficulty: 'medium', topic: 'Machine Learning', explanation: 'Unsupervised learning aims to find hidden structures or clusters in unlabeled data.', tags: ['ML', 'Basics'] },
  { id: 'q2', type: 'mcq', text: 'Which of these is not a type of neural network?', options: ['CNN', 'RNN', 'GNN', 'TNN'], correctOption: 3, marks: 10, difficulty: 'medium', topic: 'Deep Learning', explanation: 'TNN (Temporal Neural Network) is not a standard widely recognized type compared to CNNs, RNNs, and GNNs.', tags: ['DL', 'Networks'] },
  { id: 'q3', type: 'mcq', text: 'What does the "Turing Test" evaluate?', options: ['A machine\'s processing speed', 'A machine\'s ability to exhibit intelligent behavior', 'A machine\'s storage capacity', 'A machine\'s battery life'], correctOption: 1, marks: 10, difficulty: 'easy', topic: 'History of AI', explanation: 'The Turing test checks if a machine can imitate human conversation convincingly.', tags: ['History', 'Turing'] },
  { id: 'q4', type: 'mcq', text: 'In Python, which library is most commonly used for machine learning?', options: ['NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib'], correctOption: 2, marks: 10, difficulty: 'easy', topic: 'Tools', explanation: 'Scikit-learn is the standard ML library in Python.', tags: ['Python', 'Libraries'] },
  { id: 'q5', type: 'true-false', text: 'Gradient descent is an optimization algorithm used to minimize the loss function.', options: ['True', 'False'], correctOption: 0, marks: 5, difficulty: 'medium', topic: 'Optimization', explanation: 'Gradient descent iteratively moves towards the minimum of the loss function.', tags: ['Math', 'ML'] },
  { id: 'q6', type: 'multi-select', text: 'Which of the following are activation functions?', options: ['ReLU', 'Sigmoid', 'Linear Regression', 'Tanh'], correctOption: [0, 1, 3], marks: 15, difficulty: 'hard', topic: 'Deep Learning', explanation: 'Linear regression is a model, not an activation function.', tags: ['DL', 'Math'] },
  { id: 'q7', type: 'mcq', text: 'What is overfitting in machine learning?', options: ['Model performs well on training data but poorly on unseen data', 'Model performs poorly on training data', 'Model has too few parameters', 'Model trains too slowly'], correctOption: 0, marks: 10, difficulty: 'medium', topic: 'Machine Learning', explanation: 'Overfitting occurs when a model memorizes training data but cannot generalize.', tags: ['ML', 'Concepts'] },
  { id: 'q8', type: 'mcq', text: 'Which algorithm is used for dimensionality reduction?', options: ['K-Means', 'Decision Tree', 'PCA', 'Naive Bayes'], correctOption: 2, marks: 10, difficulty: 'hard', topic: 'Machine Learning', explanation: 'PCA (Principal Component Analysis) is used for dimensionality reduction.', tags: ['ML', 'Unsupervised'] },
];

export const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Introduction to Artificial Intelligence - Midterm',
    description: 'A comprehensive midterm covering basic AI concepts, search algorithms, and machine learning fundamentals.',
    subject: 'Artificial Intelligence',
    duration: 60,
    status: 'live',
    startDate: new Date(Date.now() - 3600000),
    endDate: new Date(Date.now() + 86400000),
    totalMarks: 40,
    passingPercentage: 50,
    proctoringLevel: 'strict',
    instructions: 'This is a closed-book exam. No external resources are allowed. Ensure your webcam is enabled throughout the session.',
    studentIds: ['student-1', 'student-2', 'student-3', 'student-4'],
    questions: [
      { id: 'q1', type: 'mcq', text: 'What is the primary goal of unsupervised learning?', options: ['Classification', 'Regression', 'Clustering', 'Reinforcement'], correctOption: 2, marks: 10, difficulty: 'medium', topic: 'Machine Learning', explanation: 'Unsupervised learning aims to find hidden structures or clusters in unlabeled data.', tags: ['ML', 'Basics'] },
      { id: 'q2', type: 'mcq', text: 'Which of these is not a type of neural network?', options: ['CNN', 'RNN', 'GNN', 'TNN'], correctOption: 3, marks: 10, difficulty: 'medium', topic: 'Deep Learning', explanation: 'TNN (Temporal Neural Network) is not a standard widely recognized type.', tags: ['DL', 'Networks'] },
      { id: 'q3', type: 'mcq', text: 'What does the "Turing Test" evaluate?', options: ['A machine\'s processing speed', 'A machine\'s ability to exhibit intelligent behavior', 'A machine\'s storage capacity', 'A machine\'s battery life'], correctOption: 1, marks: 10, difficulty: 'easy', topic: 'History of AI', explanation: 'The Turing test checks if a machine can imitate human conversation convincingly.', tags: ['History'] },
      { id: 'q4', type: 'mcq', text: 'In Python, which library is most commonly used for machine learning?', options: ['NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib'], correctOption: 2, marks: 10, difficulty: 'easy', topic: 'Tools', explanation: 'Scikit-learn is the standard ML library in Python.', tags: ['Python'] },
    ],
  },
  {
    id: '2',
    title: 'Calculus II - Final Exam',
    description: 'Final examination for Calculus II covering integration techniques and series.',
    subject: 'Mathematics',
    duration: 120,
    status: 'completed',
    startDate: new Date(Date.now() - 86400000 * 2),
    endDate: new Date(Date.now() - 86400000 * 1),
    totalMarks: 100,
    passingPercentage: 60,
    proctoringLevel: 'standard',
    instructions: 'You may use a calculator. Show all your work clearly.',
    studentIds: ['student-1', 'student-2', 'student-5'],
    questions: [
       { id: 'q1', type: 'mcq', text: 'What is the integral of 2x?', options: ['2', 'x^2', 'x^2 + C', '2x^2'], correctOption: 2, marks: 100, difficulty: 'easy', topic: 'Integration', explanation: 'The power rule for integration gives x^2 + C.', tags: ['Math'] },
    ],
  },
  {
    id: '3',
    title: 'Modern Physics - Quiz 3',
    description: 'Short quiz on Relativity and Quantum Mechanics.',
    subject: 'Physics',
    duration: 30,
    status: 'upcoming',
    startDate: new Date(Date.now() + 86400000 * 3),
    endDate: new Date(Date.now() + 86400000 * 4),
    totalMarks: 20,
    passingPercentage: 50,
    proctoringLevel: 'none',
    instructions: 'Closed book quiz. No notes permitted.',
    studentIds: ['student-3', 'student-4', 'student-6'],
    questions: [
       { id: 'q1', type: 'mcq', text: 'Who proposed the theory of general relativity?', options: ['Isaac Newton', 'Galileo Galilei', 'Albert Einstein', 'Stephen Hawking'], correctOption: 2, marks: 20, difficulty: 'easy', topic: 'Relativity', explanation: 'Albert Einstein formulated General Relativity in 1915.', tags: ['Physics', 'History'] },
    ],
  },
  {
    id: 'java-1',
    title: 'Java Fundamentals',
    description: 'Basic Java syntax, variables, control flow, and OOP principles.',
    subject: 'Computer Science',
    duration: 45,
    status: 'draft',
    startDate: null,
    endDate: null,
    totalMarks: 50,
    passingPercentage: 50,
    proctoringLevel: 'standard',
    instructions: '',
    studentIds: ['student-1', 'student-2', 'student-3'],
    questions: [
        { id: 'j1q1', type: 'mcq', text: 'Which keyword is used for inheritance in Java?', options: ['extends', 'implements', 'inherits', 'super'], correctOption: 0, marks: 5, difficulty: 'easy', topic: 'OOP', explanation: 'The extends keyword is used for class inheritance.', tags: ['Java'] },
        { id: 'j1q2', type: 'mcq', text: 'What is the size of an int in Java?', options: ['2 bytes', '4 bytes', '8 bytes', 'Depends on platform'], correctOption: 1, marks: 5, difficulty: 'easy', topic: 'Basics', explanation: 'An int is always 4 bytes in Java, regardless of platform.', tags: ['Java'] },
        { id: 'j1q3', type: 'true-false', text: 'Java is a purely object-oriented language.', options: ['True', 'False'], correctOption: 1, marks: 5, difficulty: 'medium', topic: 'Basics', explanation: 'Java has primitive types (int, char, etc.) which are not objects.', tags: ['Java'] },
        { id: 'j1q4', type: 'mcq', text: 'Which collection class allows unique elements only?', options: ['ArrayList', 'LinkedList', 'HashSet', 'HashMap'], correctOption: 2, marks: 5, difficulty: 'medium', topic: 'Collections', explanation: 'HashSet implements Set which does not allow duplicates.', tags: ['Java', 'Collections'] },
    ]
  },
  {
    id: 'ds-1',
    title: 'Data Structures & Algorithms - Quiz 1',
    description: 'Arrays, linked lists, stacks, queues, and sorting algorithms.',
    subject: 'Computer Science',
    duration: 40,
    status: 'completed',
    startDate: new Date(Date.now() - 86400000 * 5),
    endDate: new Date(Date.now() - 86400000 * 4),
    totalMarks: 50,
    passingPercentage: 60,
    proctoringLevel: 'strict',
    instructions: 'No external resources. Think algorithmically.',
    studentIds: ['student-1', 'student-2', 'student-3', 'student-4', 'student-5', 'student-6'],
    questions: [
        { id: 'dq1', type: 'mcq', text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'], correctOption: 2, marks: 10, difficulty: 'easy', topic: 'Algorithms', explanation: 'Binary search divides the search space in half each step.', tags: ['Algorithms'] },
        { id: 'dq2', type: 'mcq', text: 'Which data structure follows LIFO order?', options: ['Queue', 'Stack', 'Heap', 'Tree'], correctOption: 1, marks: 10, difficulty: 'easy', topic: 'Data Structures', explanation: 'A stack follows Last-In First-Out (LIFO).', tags: ['DS'] },
        { id: 'dq3', type: 'mcq', text: 'What is the worst-case time complexity of QuickSort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctOption: 2, marks: 10, difficulty: 'medium', topic: 'Algorithms', explanation: 'QuickSort degrades to O(n²) when the pivot is always the smallest or largest element.', tags: ['Sorting'] },
        { id: 'dq4', type: 'true-false', text: 'A linked list allows O(1) random access to elements.', options: ['True', 'False'], correctOption: 1, marks: 10, difficulty: 'medium', topic: 'Data Structures', explanation: 'Linked lists require O(n) traversal. Arrays provide O(1) random access.', tags: ['DS'] },
        { id: 'dq5', type: 'mcq', text: 'Which sorting algorithm has O(n log n) in all cases?', options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'QuickSort'], correctOption: 2, marks: 10, difficulty: 'hard', topic: 'Algorithms', explanation: 'Merge Sort always divides and merges in O(n log n) regardless of input.', tags: ['Sorting'] },
    ]
  }
];

export const mockReports: ExamReport[] = [
    { id: 'rep-1', studentId: 'student-1', examId: '2', score: 1, totalQuestions: 1, percentage: 100, malpracticeScore: 10, riskLevel: 'Low', submittedAt: Date.now() - 86400000, timeTaken: 95 },
    { id: 'rep-2', studentId: 'student-2', examId: '2', score: 0, totalQuestions: 1, percentage: 0, malpracticeScore: 75, riskLevel: 'High', submittedAt: Date.now() - 86400000, timeTaken: 110 },
    { id: 'rep-5', studentId: 'student-1', examId: '1', score: 3, totalQuestions: 4, percentage: 75, malpracticeScore: 40, riskLevel: 'Medium', submittedAt: Date.now() - 3600000, timeTaken: 48 },
    // DS Exam reports
    { id: 'rep-6', studentId: 'student-1', examId: 'ds-1', score: 4, totalQuestions: 5, percentage: 80, malpracticeScore: 5, riskLevel: 'Low', submittedAt: Date.now() - 86400000 * 4, timeTaken: 35 },
    { id: 'rep-7', studentId: 'student-2', examId: 'ds-1', score: 3, totalQuestions: 5, percentage: 60, malpracticeScore: 30, riskLevel: 'Medium', submittedAt: Date.now() - 86400000 * 4, timeTaken: 39 },
    { id: 'rep-8', studentId: 'student-3', examId: 'ds-1', score: 5, totalQuestions: 5, percentage: 100, malpracticeScore: 0, riskLevel: 'Low', submittedAt: Date.now() - 86400000 * 4, timeTaken: 28 },
    { id: 'rep-9', studentId: 'student-4', examId: 'ds-1', score: 2, totalQuestions: 5, percentage: 40, malpracticeScore: 65, riskLevel: 'High', submittedAt: Date.now() - 86400000 * 4, timeTaken: 40 },
    { id: 'rep-10', studentId: 'student-5', examId: 'ds-1', score: 4, totalQuestions: 5, percentage: 80, malpracticeScore: 10, riskLevel: 'Low', submittedAt: Date.now() - 86400000 * 4, timeTaken: 33 },
    { id: 'rep-11', studentId: 'student-6', examId: 'ds-1', score: 3, totalQuestions: 5, percentage: 60, malpracticeScore: 20, riskLevel: 'Low', submittedAt: Date.now() - 86400000 * 4, timeTaken: 36 },
    { id: 'rep-12', studentId: 'student-5', examId: '2', score: 1, totalQuestions: 1, percentage: 100, malpracticeScore: 0, riskLevel: 'Low', submittedAt: Date.now() - 86400000, timeTaken: 80 },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'danger', title: 'High Risk Alert', message: 'Rohan Gupta flagged as High Risk during Calculus II Final.', timestamp: Date.now() - 1000 * 60 * 5, read: false, link: '/reports' },
  { id: 'n2', type: 'warning', title: 'Exam Starting Soon', message: 'Modern Physics - Quiz 3 starts in 3 days.', timestamp: Date.now() - 1000 * 60 * 30, read: false, link: '/exams' },
  { id: 'n3', type: 'success', title: 'Exam Completed', message: 'Data Structures & Algorithms - Quiz 1 has been completed by 6 students.', timestamp: Date.now() - 86400000 * 4, read: true, link: '/reports' },
  { id: 'n4', type: 'info', title: 'AI Report Ready', message: 'Integrity report for Priya Sharma is ready for review.', timestamp: Date.now() - 86400000 * 1, read: true, link: '/reports' },
  { id: 'n5', type: 'danger', title: 'Multiple Faces Detected', message: 'Vikram Kumar - Multiple people detected during DS exam.', timestamp: Date.now() - 86400000 * 4 + 1000 * 60 * 15, read: true, link: '/reports' },
  { id: 'n6', type: 'success', title: 'Exam Published', message: 'Introduction to AI - Midterm is now live.', timestamp: Date.now() - 3600000 * 2, read: true, link: '/exams' },
];
