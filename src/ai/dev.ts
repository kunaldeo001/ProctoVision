import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-malpractice-events.ts';
import '@/ai/flows/detect-exam-malpractice.ts';
import '@/ai/flows/generate-questions.ts';