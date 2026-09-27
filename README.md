# ProctoVision 👁️ — AI-Powered Proctoring & Examination Platform

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Google Genkit](https://img.shields.io/badge/Google_Genkit-AI-orange?style=for-the-badge&logo=google)

ProctoVision is an advanced, production-ready AI examination platform. It transforms standard online tests into secure, integrity-driven assessments using computer vision, device telemetry, and LLMs.

**Live Demo:** [https://procto-vision-38of.vercel.app/](https://procto-vision-38of.vercel.app/)

## 🚀 Key Features

### 🧠 AI Question Generator & Bank
- AI automatically generates MCQs, True/False, and Multi-Select questions via **Gemini 2.5 Flash**.
- Full question bank with difficulty tags, search, and topic filtering.

### 🛡️ Smart Exam Builder
- Multi-step wizard to create exams, set passing grades, duration, and assign students.
- Configurable proctoring levels (None, Standard, Strict).

### 👁️ AI Proctoring Engine
- **Computer Vision:** Analyzes webcam feed every 5 seconds to detect missing faces, multiple people, and suspicious objects (e.g., phones).
- **Telemetry:** Tracks browser visibility (tab switching) and connection stability.
- **Risk Scoring:** Deterministic algorithm weights infractions and assigns a real-time risk score (Low, Medium, High).

### 📊 Integrity Timeline & Analytics
- **Live Command Center:** Proctors can monitor all active students in real-time.
- **AI Explanations:** Genkit AI summarizes malpractice event logs into human-readable insights.
- **Post-Exam Reports:** Export detailed CSV/JSON reports containing scores and integrity metrics.

## 🏗️ Architecture

```mermaid
graph TD
    User([Teacher / Student]) --> Frontend[Next.js App Router]
    
    subgraph Frontend Layer
        Frontend --> TakeExam[Take Exam UI]
        Frontend --> Dashboard[Command Center]
        Frontend --> ExamBuilder[Smart Exam Builder]
    end
    
    subgraph Exam Engine
        TakeExam --> Telemetry[Visibility / Network API]
        TakeExam --> VideoFeed[Webcam Feed]
    end
    
    subgraph AI Proctoring Engine (Genkit)
        VideoFeed -->|Base64 Frame| GeminiVision[Gemini 2.5 Vision]
        GeminiVision -->|Violations| Scoring[Deterministic Scoring]
    end
    
    subgraph Analytics
        Scoring --> EventLog[Integrity Timeline]
        EventLog --> AIInsight[Gemini Event Summarization]
        AIInsight --> Reports[CSV/JSON Exports]
    end
```

> **Note on Data Privacy:** All AI processing is performed securely. The platform uses a deterministic risk engine for scoring, while AI is utilized *only* for generation and explanation—never for definitive punitive decision-making. 

## 🛠️ Technology Stack
- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4 + Framer Motion
- **Components:** shadcn/ui (Radix Primitives)
- **AI Integration:** Google Genkit + Gemini 2.5 Flash
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Deployment:** Vercel

## 💻 Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ProctoVision.git
   cd ProctoVision
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 🧪 Testing & Production

Run TypeScript checks and ESLint before building:
```bash
npm run typecheck
npm run lint
```

Test the production build locally:
```bash
npm run build
npm run start
```

## ⚠️ Limitations (Demo Mode)
This repository is currently configured as a **Portfolio Demo**. 
- It uses in-memory mocked data instead of a live database (PostgreSQL/MongoDB).
- Authentication is bypassed to allow immediate access to the dashboard.
- Real-time signaling (WebRTC) is simulated for the live monitoring grid.
