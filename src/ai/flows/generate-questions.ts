'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQuestionsInputSchema = z.object({
  subject: z.string().describe('The overall subject of the exam (e.g. Computer Science).'),
  topic: z.string().describe('The specific topic to generate questions for.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level.'),
  count: z.number().min(1).max(10).describe('Number of questions to generate.'),
  type: z.enum(['mcq', 'true-false', 'multi-select']).describe('The type of questions.'),
  marks: z.number().describe('The marks allocated per question.'),
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

const GeneratedQuestionSchema = z.object({
  text: z.string().describe('The question text.'),
  options: z.array(z.string()).describe('Array of possible options. Minimum 2, maximum 5.'),
  correctOption: z.union([z.number(), z.array(z.number())]).describe('The index (or array of indices) of the correct option(s) in the options array. 0-indexed.'),
  explanation: z.string().describe('Explanation of why the correct option is correct.'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(GeneratedQuestionSchema),
});

export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

export async function generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: { schema: GenerateQuestionsInputSchema },
  output: { schema: GenerateQuestionsOutputSchema },
  prompt: `You are an expert educator and exam creator.
Generate a list of questions based on the following criteria:

Subject: {{{subject}}}
Topic: {{{topic}}}
Difficulty: {{{difficulty}}}
Number of Questions: {{{count}}}
Type: {{{type}}}
Marks per Question: {{{marks}}}

Rules:
1. If type is "mcq", provide 4 options and a single correctOption (number).
2. If type is "true-false", provide exactly 2 options ("True", "False") and a single correctOption (number).
3. If type is "multi-select", provide 4-5 options and correctOption MUST be an array of numbers.
4. Ensure the explanation is clear and pedagogical.
5. All generated questions MUST be directly related to the specified topic and subject.
`,
});

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await generateQuestionsPrompt(input);
    return output!;
  }
);
