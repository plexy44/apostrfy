/**
 * @fileOverview Matches user's writing style to inspirational figures.
 *
 * - generateStyleMatch - A function that performs the style matching.
 * - GenerateStyleMatchInput - The input type for the generateStyleMatch function.
 * - GenerateStyleMatchOutput - The return type for the generateStyleMatch function.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { InspirationalPersonas } from '@/lib/types';


const GenerateStyleMatchInputSchema = z.object({
  userContent: z.string().describe("A single block of text containing only the user's lines."),
  personas: z.string().describe("A JSON string of the complete inspirationalPersonas object containing all figures from all game modes."),
});
export type GenerateStyleMatchInput = z.infer<typeof GenerateStyleMatchInputSchema>;

const GenerateStyleMatchOutputSchema = z.object({
  styleMatches: z.array(z.string()).length(2).describe("An array of two strings: ['[WINNER_NAME]', '[RUNNER-UP_NAME]']."),
});
export type GenerateStyleMatchOutput = z.infer<typeof GenerateStyleMatchOutputSchema>;

export async function generateStyleMatch(input: GenerateStyleMatchInput): Promise<GenerateStyleMatchOutput> {
  return generateStyleMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStyleMatchPrompt',
  input: {schema: GenerateStyleMatchInputSchema},
  output: {schema: GenerateStyleMatchOutputSchema},
  prompt: `You are a literary analyst AI. I will provide you with a block of text written by a user and a JSON object of influential figures with their descriptions. Your task is to meticulously compare the user's writing style (considering sentence structure, vocabulary, tone, pacing, and thematic focus) against the styles suggested by the descriptions of every figure in the JSON object. You must identify the two figures whose styles are the closest match to the user's text. Your response must be a JSON object containing a single key, styleMatches, which is an array of two strings: ['[WINNER_NAME]', '[RUNNER-UP_NAME]'].

User Text:
{{{userContent}}}

Influential Figures JSON:
{{{personas}}}`,
});

const generateStyleMatchFlow = ai.defineFlow(
  {
    name: 'generateStyleMatchFlow',
    inputSchema: GenerateStyleMatchInputSchema,
    outputSchema: GenerateStyleMatchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
