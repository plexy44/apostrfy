'use server';

/**
 * @fileOverview Generates a sentiment snapshot for a given story transcript.
 *
 * - generateSentimentSnapshot - A function that generates a sentiment snapshot.
 * - GenerateSentimentSnapshotInput - The input type for the generateSentimentSnapshot function.
 * - GenerateSentimentSnapshotOutput - The return type for the generateSentimentSnapshot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSentimentSnapshotInputSchema = z.object({
  transcript: z.string().describe('The full story transcript.'),
});
export type GenerateSentimentSnapshotInput = z.infer<typeof GenerateSentimentSnapshotInputSchema>;

const GenerateSentimentSnapshotOutputSchema = z.object({
  sentimentSnapshot: z.string().describe('A single, metaphorical sentence reflecting the story\'s emotional tone.'),
});
export type GenerateSentimentSnapshotOutput = z.infer<typeof GenerateSentimentSnapshotOutputSchema>;

export async function generateSentimentSnapshot(input: GenerateSentimentSnapshotInput): Promise<GenerateSentimentSnapshotOutput> {
  return generateSentimentSnapshotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSentimentSnapshotPrompt',
  input: {schema: GenerateSentimentSnapshotInputSchema},
  output: {schema: GenerateSentimentSnapshotOutputSchema},
  prompt: `The story is complete. Read the entire transcript provided below. Do not summarise the plot. Instead, capture the core emotional journey in a single, metaphorical, and artful sentence. Present this sentence directly, with no preamble. Transcript: {{{transcript}}}`,
});

const generateSentimentSnapshotFlow = ai.defineFlow(
  {
    name: 'generateSentimentSnapshotFlow',
    inputSchema: GenerateSentimentSnapshotInputSchema,
    outputSchema: GenerateSentimentSnapshotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
