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
  system: `You are a strict AI proctor for an online exam. Your only job is to analyze the student's webcam feed for specific signs of academic dishonesty based on the image provided.
You MUST return a JSON object with boolean flags for each violation. Do not add any extra explanations or text.
Your analysis must be rigorous. Pay very close attention to objects in the student's hands or on their desk.`,
  input: {schema: DetectExamMalpracticeInputSchema},
  output: {schema: DetectExamMalpracticeOutputSchema},
  prompt: `Analyze the following image from a student's webcam during an exam.

Webcam Feed: {{media url=photoDataUri}}

Based *only* on the image, determine if the following violations occurred. Your answer must be a JSON object with only the required boolean fields.

1.  **phoneDetected**: Is there a mobile phone or any other handheld electronic device visible?
2.  **multiplePeopleDetected**: Is there more than one person in the image?
3.  **gazeAwayFromScreen**: Is the student clearly looking away from the screen?
4.  **noFaceDetected**: Is there no face clearly visible, or is the student absent from the frame?
`,
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
      }
    ]
  }
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
