
'use server';

/**
 * @fileOverview Detects malpractice during an exam by analyzing webcam footage.
 *
 * - detectExamMalpractice - A function that analyzes webcam footage for suspicious behavior.
 * - DetectExamMalpracticeInput - The input type for the detectExamMalpractice function.
 * - DetectExamMalpracticeOutput - The return type for the detectExamMalpractice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VIOLATION_TYPES = [
  'MULTIPLE_PEOPLE',
  'NO_FACE_DETECTED',
  'GAZE_AWAY',
  'PHONE_DETECTED',
] as const;


const DetectExamMalpracticeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the student taking the exam, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectExamMalpracticeInput = z.infer<typeof DetectExamMalpracticeInputSchema>;

const DetectExamMalpracticeOutputSchema = z.object({
  violations: z
    .array(z.enum(VIOLATION_TYPES))
    .describe(
      'A list of detected violations.'
    ),
});
export type DetectExamMalpracticeOutput = z.infer<typeof DetectExamMalpracticeOutputSchema>;

export async function detectExamMalpractice(
  input: DetectExamMalpracticeInput
): Promise<DetectExamMalpracticeOutput> {
  return detectExamMalpracticeFlow(input);
}

const detectExamMalpracticePrompt = ai.definePrompt({
  name: 'detectExamMalpracticePrompt',
  prompt: `Analyze the image provided: {{media url=photoDataUri}}.
You are a strict AI proctor. Your task is to analyze the image and identify violations.
Your output MUST be a JSON object with a "violations" field containing an array of strings.
The strings MUST be from this exact list: ${JSON.stringify(VIOLATION_TYPES)}.
- If more than one person is visible, you MUST include "MULTIPLE_PEOPLE".
- If no human face is clearly visible, you MUST include "NO_FACE_DETECTED".
- If the student is looking away from the screen, you MUST include "GAZE_AWAY".
- If a smartphone or other mobile device is visible, you MUST include "PHONE_DETECTED".
If no violations are found, return an empty "violations" array.
Do not explain. Only return the JSON object.`,
  input: {schema: DetectExamMalpracticeInputSchema},
  output: {schema: DetectExamMalpracticeOutputSchema},
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const detectExamMalpracticeFlow = ai.defineFlow(
  {
    name: 'detectExamMalpracticeFlow',
    inputSchema: DetectExamMalpracticeInputSchema,
    outputSchema: DetectExamMalpracticeOutputSchema,
  },
  async input => {
    const {output} = await detectExamMalpracticePrompt(input);
    return output!;
  }
);
