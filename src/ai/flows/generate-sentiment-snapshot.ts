'use server';

/**
 * @fileOverview Generates a sentiment snapshot based on the user's story contributions.
 *
 * - generateSentimentSnapshot - A function that generates a sentiment snapshot.
 * - GenerateSentimentSnapshotInput - The input type for the generateSentimentSnapshot function.
 * - GenerateSentimentSnapshotOutput - The return type for the generateSentimentSnapshot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSentimentSnapshotInputSchema = z.object({
  userContent: z.string().describe("A collection of the user's contributions to a story, separated by newlines."),
});
export type GenerateSentimentSnapshotInput = z.infer<typeof GenerateSentimentSnapshotInputSchema>;

const GenerateSentimentSnapshotOutputSchema = z.object({
  sentimentSnapshot: z.string().describe('A single, metaphorical sentence reflecting the emotional tone of the user\'s writing.'),
  emotionalKeywords: z.array(z.string()).describe('An array of exactly 6 single-word keywords that capture the primary emotions or themes in the text.'),
});
export type GenerateSentimentSnapshotOutput = z.infer<typeof GenerateSentimentSnapshotOutputSchema>;

export async function generateSentimentSnapshot(input: GenerateSentimentSnapshotInput): Promise<GenerateSentimentSnapshotOutput> {
  return generateSentimentSnapshotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSentimentSnapshotPrompt',
  input: {schema: GenerateSentimentSnapshotInputSchema},
  output: {schema: GenerateSentimentSnapshotOutputSchema},
  prompt: `You are a reflective journaling assistant. A user has been co-writing a story and you have been given ONLY their contributions. Read all the user's lines provided below. Do not summarize the plot.
Your task is to analyze the emotional content, themes, and underlying feelings present in their writing. Based on this analysis, you will produce two outputs:
1. A single, metaphorical, and artful sentence that captures the essence of their state of mind. This sentence should act as a gentle, insightful reflection.
2. A list of exactly 6 single-word keywords that represent the primary emotions or themes you detected.

Present your output in the requested JSON format, with no preamble.

User's contributions: {{{userContent}}}`,
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
