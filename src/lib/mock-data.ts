import type { User, Exam, ExamReport } from './types';
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

const javaExam1: Exam = {
    id: 'java-1',
    title: 'Java Fundamentals',
    duration: 45,
    status: 'upcoming',
    studentIds: ['student-1', 'student-3'],
    questions: [
        { id: 'j1q1', text: 'Which keyword is used for inheritance in Java?', options: ['extends', 'implements', 'inherits', 'super'], correctOption: 0 },
        { id: 'j1q2', text: 'What is the size of an int in Java?', options: ['2 bytes', '4 bytes', '8 bytes', 'Depends on platform'], correctOption: 1 },
        { id: 'j1q3', text: 'Which of these is not a Java feature?', options: ['Object-oriented', 'Use of pointers', 'Platform independent', 'Dynamic'], correctOption: 1 },
        { id: 'j1q4', text: 'What is the default value of a boolean in Java?', options: ['true', 'false', '0', 'null'], correctOption: 1 },
        { id: 'j1q5', text: 'Which class is the superclass of all classes in Java?', options: ['System', 'Object', 'String', 'Class'], correctOption: 1 },
        { id: 'j1q6', text: 'Which method must be implemented by a thread class?', options: ['start()', 'stop()', 'run()', 'main()'], correctOption: 2 },
        { id: 'j1q7', text: 'What does the "final" keyword mean for a variable?', options: ['It cannot be changed', 'It is the last variable', 'It has a default value', 'It is private'], correctOption: 0 },
        { id: 'j1q8', text: 'Which collection class allows unique elements only?', options: ['ArrayList', 'LinkedList', 'HashSet', 'HashMap'], correctOption: 2 },
        { id: 'j1q9', text: 'What is an interface in Java?', options: ['A class', 'An object', 'A collection of abstract methods', 'A variable'], correctOption: 2 },
        { id: 'j1q10', text: 'Which of the following is a checked exception?', options: ['ArithmeticException', 'NullPointerException', 'IOException', 'ArrayIndexOutOfBoundsException'], correctOption: 2 }
    ]
};

const javaExam2: Exam = {
    id: 'java-2',
    title: 'Java Object-Oriented Programming',
    duration: 60,
    status: 'completed',
    studentIds: ['student-2', 'student-4'],
    questions: [
        { id: 'j2q1', text: 'Which concept allows methods to have the same name but different parameters?', options: ['Inheritance', 'Polymorphism', 'Overloading', 'Overriding'], correctOption: 2 },
        { id: 'j2q2', text: 'What is encapsulation?', options: ['Hiding implementation details', 'Inheriting from another class', 'Creating multiple forms of a method', 'Executing code at runtime'], correctOption: 0 },
        { id: 'j2q3', text: 'The "this" keyword refers to?', options: ['The superclass', 'A static variable', 'The current object instance', 'The main method'], correctOption: 2 },
        { id: 'j2q4', text: 'An abstract class can be instantiated.', options: ['True', 'False'], correctOption: 1 },
        { id: 'j2q5', text: 'Which access modifier provides the widest accessibility?', options: ['private', 'default', 'protected', 'public'], correctOption: 3 },
        { id: 'j2q6', text: 'What is the purpose of a constructor?', options: ['To destroy an object', 'To initialize an object', 'To run garbage collection', 'To define a method'], correctOption: 1 },
        { id: 'j2q7', text: 'Can a class implement multiple interfaces?', options: ['Yes', 'No'], correctOption: 0 },
        { id: 'j2q8', text: 'Can a class extend multiple classes?', options: ['Yes', 'No'], correctOption: 1 },
        { id: 'j2q9', text: 'What is the "super" keyword used for?', options: ['To call a method in the same class', 'To refer to the superclass members', 'To create a super-powered object', 'To define a static method'], correctOption: 1 },
        { id: 'j2q10', text: 'Which of these is NOT a principle of OOP?', options: ['Abstraction', 'Compilation', 'Inheritance', 'Polymorphism'], correctOption: 1 }
    ]
};

const javaExam3: Exam = {
    id: 'java-3',
    title: 'Java Collections Framework',
    duration: 30,
    status: 'live',
    studentIds: ['student-1', 'student-2', 'student-4'],
    questions: [
        { id: 'j3q1', text: 'Which interface is at the top of the collections hierarchy?', options: ['List', 'Set', 'Collection', 'Map'], correctOption: 2 },
        { id: 'j3q2', text: 'Which class provides a dynamic array?', options: ['LinkedList', 'ArrayList', 'HashSet', 'Vector'], correctOption: 1 },
        { id: 'j3q3', text: 'A Map stores key-value pairs.', options: ['True', 'False'], correctOption: 0 },
        { id: 'j3q4', text: 'Which is faster for insertion and deletion at arbitrary positions?', options: ['ArrayList', 'LinkedList'], correctOption: 1 },
        { id: 'j3q5', text: 'Which of these does not allow duplicate elements?', options: ['List', 'Set', 'Queue', 'Map'], correctOption: 1 },
        { id: 'j3q6', text: 'Which of these stores elements in a sorted order?', options: ['HashSet', 'LinkedHashSet', 'TreeSet', 'ArrayList'], correctOption: 2 },
        { id: 'j3q7', text: 'HashMap allows null keys and null values.', options: ['True', 'False'], correctOption: 0 },
        { id: 'j3q8', text: 'What does the "generics" feature in collections provide?', options: ['Type-safety', 'Faster performance', 'Automatic sorting', 'Bigger capacity'], correctOption: 0 },
        { id: 'j3q9', text: 'Which data structure does a Queue typically follow?', options: ['LIFO', 'FIFO', 'Random', 'Sorted'], correctOption: 1 },
        { id: 'j3q10', text: 'What is the main difference between Vector and ArrayList?', options: ['Vector is synchronized', 'ArrayList is synchronized', 'Vector is faster', 'ArrayList allows nulls'], correctOption: 0 }
    ]
};

mockExams.push(javaExam1, javaExam2, javaExam3);


export const mockReports: ExamReport[] = [
    { id: 'rep-1', studentId: 'student-1', examId: '2', score: 1, totalQuestions: 1, percentage: 100, malpracticeScore: 10, riskLevel: 'Low' },
    { id: 'rep-2', studentId: 'student-2', examId: '2', score: 0, totalQuestions: 1, percentage: 0, malpracticeScore: 75, riskLevel: 'High' },
    { id: 'rep-3', studentId: 'student-2', examId: 'java-2', score: 8, totalQuestions: 10, percentage: 80, malpracticeScore: 25, riskLevel: 'Medium' },
    { id: 'rep-4', studentId: 'student-4', examId: 'java-2', score: 6, totalQuestions: 10, percentage: 60, malpracticeScore: 5, riskLevel: 'Low' },
    { id: 'rep-5', studentId: 'student-1', examId: '1', score: 3, totalQuestions: 4, percentage: 75, malpracticeScore: 40, riskLevel: 'Medium' },
];
