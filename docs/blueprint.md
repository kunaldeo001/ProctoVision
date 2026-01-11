# **App Name**: ProctoVision

## Core Features:

- User Authentication: Secure user authentication using Firebase Authentication (email/password + Google) with Admin (Teacher) and Student roles.
- Exam Management: Admin (Teacher) interface to create exams (title, duration, questions), start/stop exams, and view malpractice reports.
- Online Exam Interface: Student interface with full-screen exam mode and compulsory webcam access. Disables copy-paste, detects tab switching and window minimization.
- Face Detection: Real-time face detection using computer vision. Awards malpractice points when no face is detected or face is missing.
- Multi-person & Device Detection: Detects multiple people and mobile phones in the webcam view. Awards malpractice points.
- Gaze Tracking: Tracks the student's gaze to determine if they are looking away from the screen.  Awards malpractice points.
- Malpractice Scoring and Logging: Assigns weighted scores for each violation. Stores timestamped violation events in Firestore. Tool decides the level of risk the malpractice exhibited.
- Admin Dashboard: Real-time monitoring dashboard for admins. Display charts of violations and generates/download exam malpractice reports.

## Style Guidelines:

- Primary color: Dark blue (#224292), evoking trust, authority, and knowledge.  It creates a professional and secure atmosphere.
- Background color: Very light blue (#E0E8F9).  It provides a clean, neutral backdrop that contrasts well with the primary dark blue.
- Accent color: Purple (#6F42C1), it is analogous to dark blue but different enough in brightness and saturation to draw attention to key elements, indicating progress, AI status, etc.
- Font pairing: 'Space Grotesk' (sans-serif) for headings and 'Inter' (sans-serif) for body text.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use clear, professional icons to represent actions and statuses (e.g., start, stop, recording, violation).
- Clean and structured layout with clear sections for exam questions, monitoring feeds, and malpractice reports.
- Subtle animations to indicate real-time updates and status changes (e.g., recording indicator, violation alerts).