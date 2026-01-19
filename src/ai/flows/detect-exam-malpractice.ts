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
  prompt: `You are an AI proctoring system for online exams. Your primary task is to analyze a student's webcam feed for signs of academic dishonesty.

  Carefully examine the provided image from the student's webcam. Your analysis should focus on detecting the following specific violations:
  - **Phone Detection**: Is there any evidence of a mobile phone or any other handheld electronic device in the student's hands, on the desk, or anywhere else in the camera's view? The student should not be using a phone.
  - **Multiple People**: Is there more than one person visible in the frame? Only the student should be present.
  - **Gaze Detection**: Is the student looking away from the computer screen for a suspicious amount of time, as if looking at notes or another person?
  - **Face Presence**: Is the student's face clearly visible in the frame? The student must be in front of the camera.

  Webcam Feed: {{media url=photoDataUri}}

  Return a boolean value for each of the following fields based on your analysis: phoneDetected, multiplePeopleDetected, gazeAwayFromScreen, noFaceDetected.
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
