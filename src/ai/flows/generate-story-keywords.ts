/**
 * @fileOverview Extracts significant keywords from the user's story contributions.
 *
 * - generateStoryKeywords - A function that extracts keywords.
 * - GenerateStoryKeywordsInput - The input type for the generateStoryKeywords function.
 * - GenerateStoryKeywordsOutput - The return type for the generateStoryKeywords function.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryKeywordsInputSchema = z.object({
  userContent: z.string().describe("A single block of text containing only the user's lines from the session."),
});
export type GenerateStoryKeywordsInput = z.infer<typeof GenerateStoryKeywordsInputSchema>;

const GenerateStoryKeywordsOutputSchema = z.object({
  keywords: z.array(z.string()).min(5).max(7).describe("An array of 5 to 7 single-word keywords (nouns, verbs, adjectives) that represent the story's core subjects and themes."),
});
export type GenerateStoryKeywordsOutput = z.infer<typeof GenerateStoryKeywordsOutputSchema>;

export async function generateStoryKeywords(input: GenerateStoryKeywordsInput): Promise<GenerateStoryKeywordsOutput> {
  return generateStoryKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryKeywordsPrompt',
  input: {schema: GenerateStoryKeywordsInputSchema},
  output: {schema: GenerateStoryKeywordsOutputSchema},
  prompt: `From the following text, extract the 5 to 7 most significant and evocative keywords. These should be single words (nouns, verbs, adjectives) that represent the story's core subjects and themes. Return your response as a JSON object with a single key, keywords, which is an array of strings.

User Text:
{{{userContent}}}`,
});

const generateStoryKeywordsFlow = ai.defineFlow(
  {
    name: 'generateStoryKeywordsFlow',
    inputSchema: GenerateStoryKeywordsInputSchema,
    outputSchema: GenerateStoryKeywordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
