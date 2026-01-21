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
    .describe('True if more than one person is visible in the frame. Only the student should be present.'),
  phoneDetected: z
    .boolean()
    .describe('True if any evidence of a mobile phone or other handheld electronic device is found. The student should not be using a phone.'),
  gazeAwayFromScreen: z
    .boolean()
    .describe('True if the student is looking away from the screen, as if at notes or another person.'),
  noFaceDetected: z
    .boolean()
    .describe("True if the student's face is not clearly visible in the frame. The student must be in front of the camera."),
});
export type DetectExamMalpracticeOutput = z.infer<typeof DetectExamMalpracticeOutputSchema>;

export async function detectExamMalpractice(
  input: DetectExamMalpracticeInput
): Promise<DetectExamMalpracticeOutput> {
  return detectExamMalpracticeFlow(input);
}

const detectExamMalpracticePrompt = ai.definePrompt({
  name: 'detectExamMalpracticePrompt',
  system: `You are an AI proctor. Your only job is to analyze an image and determine if any of the following violations are present: 'phoneDetected', 'multiplePeopleDetected', 'gazeAwayFromScreen', 'noFaceDetected'. You MUST return a JSON object with boolean values for each violation.`,
  input: {schema: DetectExamMalpracticeInputSchema},
  output: {schema: DetectExamMalpracticeOutputSchema},
  prompt: `Analyze the image provided.
Image: {{media url=photoDataUri}}
Strictly evaluate the following conditions and return the corresponding boolean values in a JSON object:
- \`phoneDetected\`: Is there a mobile phone or handheld electronic device clearly visible?
- \`multiplePeopleDetected\`: Are there two or more distinct people in the image?
- \`gazeAwayFromScreen\`: Is the person's gaze directed significantly away from the camera/screen?
- \`noFaceDetected\`: Is there no human face clearly visible in the image?`,
  model: 'googleai/gemini-2.5-pro',
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
