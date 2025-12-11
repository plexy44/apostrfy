/**
 * @fileOverview Generates an artful quote from a full story transcript.
 *
 * - generateQuoteBanner - A function that generates a quote.
 * - GenerateQuoteBannerInput - The input type for the generateQuoteBanner function.
 * - GenerateQuoteBannerOutput - The return type for the generateQuoteBanner function.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuoteBannerInputSchema = z.object({
  fullStory: z.string().describe("The full story transcript, including both user and AI lines."),
});
export type GenerateQuoteBannerInput = z.infer<typeof GenerateQuoteBannerInputSchema>;

const GenerateQuoteBannerOutputSchema = z.object({
  quote: z.string().describe("A single, insightful, and memorable quote of 10-20 words that captures the story's core theme, a pivotal moment, or its emotional essence."),
});
export type GenerateQuoteBannerOutput = z.infer<typeof GenerateQuoteBannerOutputSchema>;

export async function generateQuoteBanner(input: GenerateQuoteBannerInput): Promise<GenerateQuoteBannerOutput> {
  return generateQuoteBannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuoteBannerPrompt',
  input: {schema: GenerateQuoteBannerInputSchema},
  output: {schema: GenerateQuoteBannerOutputSchema},
  model: 'gemini-pro',
  prompt: `You are a literary editor. Read the following collaborative story. Your task is to generate a single, insightful, and memorable quote of 10-20 words that captures the story's core theme, a pivotal moment, or its emotional essence. The quote should be artful, poignant, and sound like a line from a novel. Do not explain the quote. Return only the quote itself as a string.

Story:
{{{fullStory}}}`,
});

const generateQuoteBannerFlow = ai.defineFlow(
  {
    name: 'generateQuoteBannerFlow',
    inputSchema: GenerateQuoteBannerInputSchema,
    outputSchema: GenerateQuoteBannerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
