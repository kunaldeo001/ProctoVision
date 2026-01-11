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
      'A photo of the student taking the exam, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
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
  malpracticeScore: z.number().describe('The malpractice score based on detected behaviors.'),
  riskLevel: z
    .enum(['Low', 'Medium', 'High'])
    .describe('The overall risk level of malpractice.'),
});
export type DetectExamMalpracticeOutput = z.infer<typeof DetectExamMalpracticeOutputSchema>;

export async function detectExamMalpractice(
  input: DetectExamMalpracticeInput
): Promise<DetectExamMalpracticeOutput> {
  return detectExamMalpracticeFlow(input);
}

const evaluateMalpracticeRisk = ai.defineTool({
  name: 'evaluateMalpracticeRisk',
  description: 'Evaluates the risk level of malpractice based on the malpractice score.',
  inputSchema: z.object({
    malpracticeScore: z.number().describe('The malpractice score to evaluate.'),
  }),
  outputSchema: z.enum(['Low', 'Medium', 'High']),
},
async (input) => {
  const {malpracticeScore} = input;
  if (malpracticeScore >= 40) {
    return 'High';
  } else if (malpracticeScore >= 20) {
    return 'Medium';
  } else {
    return 'Low';
  }
});

const detectExamMalpracticePrompt = ai.definePrompt({
  name: 'detectExamMalpracticePrompt',
  input: {schema: DetectExamMalpracticeInputSchema},
  output: {schema: DetectExamMalpracticeOutputSchema},
  tools: [evaluateMalpracticeRisk],
  prompt: `You are an AI proctoring system analyzing a student\'s webcam feed during an exam.

  Analyze the provided webcam feed and determine if any of the following suspicious behaviors are present:
  - Multiple people in the frame
  - Mobile phone detected
  - Student looking away from the screen
  - No face detected

  Based on the detected behaviors, assign a malpractice score as follows:
  - No face detected: +20
  - Multiple faces: +30
  - Looking away: +10
  - Phone detected: +40

  Webcam Feed: {{media url=photoDataUri}}

  Return the multiplePeopleDetected, phoneDetected, gazeAwayFromScreen, and noFaceDetected boolean values.
  Then, calculate the malpracticeScore and use the evaluateMalpracticeRisk tool to determine the riskLevel.
  Return the malpracticeScore and riskLevel in the output.
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

