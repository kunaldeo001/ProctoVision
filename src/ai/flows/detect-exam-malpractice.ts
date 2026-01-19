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

const DetectExamMalpracticeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the student taking the exam, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectExamMalpracticeInput = z.infer<typeof DetectExamMalpracticeInputSchema>;

const DetectExamMalpracticeOutputSchema = z.object({
  multiplePeopleDetected: z
    .boolean()
    .describe('Whether multiple people are detected in the webcam view.'),
  phoneDetected: z.boolean().describe('Whether a mobile phone is detected in the webcam view.'),
  gazeAwayFromScreen: z
    .boolean()
    .describe('Whether the student is looking away from the screen.'),
  noFaceDetected: z.boolean().describe('Whether a face is detected in the webcam view.'),
});
export type DetectExamMalpracticeOutput = z.infer<typeof DetectExamMalpracticeOutputSchema>;

export async function detectExamMalpractice(
  input: DetectExamMalpracticeInput
): Promise<DetectExamMalpracticeOutput> {
  return detectExamMalpracticeFlow(input);
}

const detectExamMalpracticePrompt = ai.definePrompt({
  name: 'detectExamMalpracticePrompt',
  input: {schema: DetectExamMalpracticeInputSchema},
  output: {schema: DetectExamMalpracticeOutputSchema},
  prompt: `You are an AI proctoring system analyzing a student's webcam feed during an exam.

  Analyze the provided webcam feed and determine if any of the following suspicious behaviors are present:
  - Is there more than one person in the frame?
  - Is a mobile phone visible?
  - Is the student looking away from the screen for an extended period?
  - Is there no face clearly visible in the frame?

  Webcam Feed: {{media url=photoDataUri}}

  Based on your analysis, return a boolean value for each of the following fields: multiplePeopleDetected, phoneDetected, gazeAwayFromScreen, and noFaceDetected.
`,
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
