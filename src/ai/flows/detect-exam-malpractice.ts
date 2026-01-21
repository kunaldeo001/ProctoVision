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
  forbiddenObjects: z
    .array(z.string())
    .describe('A list of keywords for any forbidden objects detected in the frame, such as "phone", "book", "notes".'),
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
  system: `You are a strict, emotionless AI proctoring service. Your function is to analyze an image and return a JSON object. Do not deviate from this format. Your analysis must be factual and based only on the visual evidence. Your primary goal is to identify forbidden items. A phone is a major violation.`,
  input: {schema: DetectExamMalpracticeInputSchema},
  output: {schema: DetectExamMalpracticeOutputSchema},
  prompt: `Analyze the image: {{media url=photoDataUri}}.
  Return a JSON object with the following fields, based on your analysis:
  - "forbiddenObjects": An array of strings listing any forbidden items visible (e.g., "phone", "book", "notes"). If a phone is visible, you MUST include "phone" in the array. If no forbidden items are found, return an empty array.
  - "multiplePeopleDetected": true if more than one person is visible, otherwise false.
  - "gazeAwayFromScreen": true if the primary subject's eyes are not looking towards the camera, otherwise false.
  - "noFaceDetected": true if no human face is clearly visible, otherwise false.`,
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
