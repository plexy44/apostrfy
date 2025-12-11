/**
 * @fileOverview Analyzes user text to determine a primary emotion and confidence score.
 *
 * - generateMoodAnalysis - A function that generates a mood analysis.
 * - GenerateMoodAnalysisInput - The input type for the generateMoodAnalysis function.
 * - GenerateMoodAnalysisOutput - The return type for the generateMoodAnalysis function.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const emotions = z.enum(['Joy', 'Hope', 'Awe', 'Serenity', 'Melancholy', 'Tension', 'Fear', 'Sadness', 'Morose']);
export type Emotion = z.infer<typeof emotions>;

const GenerateMoodAnalysisInputSchema = z.object({
  userContent: z.string().describe("A single block of text containing only the user's lines from the session."),
});
export type GenerateMoodAnalysisInput = z.infer<typeof GenerateMoodAnalysisInputSchema>;

const GenerateMoodAnalysisOutputSchema = z.object({
  primaryEmotion: emotions.describe('The primary emotion identified from the list.'),
  confidenceScore: z.number().min(0).max(1).describe('A confidence score for this primary emotion as a decimal value between 0.0 and 1.0.'),
});
export type GenerateMoodAnalysisOutput = z.infer<typeof GenerateMoodAnalysisOutputSchema>;

export async function generateMoodAnalysis(input: GenerateMoodAnalysisInput): Promise<GenerateMoodAnalysisOutput> {
  return generateMoodAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMoodAnalysisPrompt',
  input: {schema: GenerateMoodAnalysisInputSchema},
  output: {schema: GenerateMoodAnalysisOutputSchema},
  config: {
    model: 'gemini-1.5-flash',
  },
  prompt: `Analyse the emotional sentiment of the following text. You must identify a primary emotion from the following list: [Joy, Hope, Awe, Serenity, Melancholy, Tension, Fear, Sadness, Morose]. Then, provide a confidence score for this primary emotion as a decimal value between 0.0 and 1.0. Your response must be a JSON object with two keys: primaryEmotion (string) and confidenceScore (float).

User Text:
{{{userContent}}}`,
});

const generateMoodAnalysisFlow = ai.defineFlow(
  {
    name: 'generateMoodAnalysisFlow',
    inputSchema: GenerateMoodAnalysisInputSchema,
    outputSchema: GenerateMoodAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
