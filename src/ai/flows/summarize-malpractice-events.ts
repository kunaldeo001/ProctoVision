'use server';

/**
 * @fileOverview Summarizes malpractice events and provides a risk assessment.
 *
 * - summarizeMalpracticeEvents - A function that summarizes malpractice events and provides a risk assessment.
 * - SummarizeMalpracticeEventsInput - The input type for the summarizeMalpracticeEvents function.
 * - SummarizeMalpracticeEventsOutput - The return type for the summarizeMalpracticeEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMalpracticeEventsInputSchema = z.object({
  examTitle: z.string().describe('The title of the exam.'),
  studentName: z.string().describe('The name of the student.'),
  malpracticeEvents: z
    .array(z.string())
    .describe('An array of malpractice events detected during the exam.'),
});
export type SummarizeMalpracticeEventsInput = z.infer<
  typeof SummarizeMalpracticeEventsInputSchema
>;

const SummarizeMalpracticeEventsOutputSchema = z.object({
  summary: z.string().describe('A summary of the malpractice events.'),
  riskAssessment: z
    .enum(['Low', 'Medium', 'High'])
    .describe('An assessment of the risk of academic dishonesty.'),
});
export type SummarizeMalpracticeEventsOutput = z.infer<
  typeof SummarizeMalpracticeEventsOutputSchema
>;

export async function summarizeMalpracticeEvents(
  input: SummarizeMalpracticeEventsInput
): Promise<SummarizeMalpracticeEventsOutput> {
  return summarizeMalpracticeEventsFlow(input);
}

const summarizeMalpracticeEventsPrompt = ai.definePrompt({
  name: 'summarizeMalpracticeEventsPrompt',
  input: {schema: SummarizeMalpracticeEventsInputSchema},
  output: {schema: SummarizeMalpracticeEventsOutputSchema},
  prompt: `You are an AI assistant that summarizes malpractice events detected during an exam and provides a risk assessment.

  Exam Title: {{{examTitle}}}
  Student Name: {{{studentName}}}
  Malpractice Events:
  {{#each malpracticeEvents}}
  - {{{this}}}
  {{/each}}

  Based on the malpractice events, provide a concise summary and assess the risk of academic dishonesty as Low, Medium, or High.

  Summary:
  Risk Assessment:`, // Ensure the prompt requests summary and risk assessment
});

const summarizeMalpracticeEventsFlow = ai.defineFlow(
  {
    name: 'summarizeMalpracticeEventsFlow',
    inputSchema: SummarizeMalpracticeEventsInputSchema,
    outputSchema: SummarizeMalpracticeEventsOutputSchema,
  },
  async input => {
    const {output} = await summarizeMalpracticeEventsPrompt(input);
    return output!;
  }
);
