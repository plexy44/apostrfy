/**
 * @fileOverview Generates an evocative title for a story.
 *
 * - generateStoryTitle - A function that handles the title generation process.
 * - GenerateStoryTitleInput - The input type for the generateStoryTitle function.
 * - GenerateStoryTitleOutput - The return type for the generateStoryTitle function.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryTitleInputSchema = z.object({
  fullStory: z.string().describe("The full story transcript."),
});
export type GenerateStoryTitleInput = z.infer<typeof GenerateStoryTitleInputSchema>;

const GenerateStoryTitleOutputSchema = z.object({
  title: z.string().describe("A short, evocative, and compelling title for the story, under 8 words."),
});
export type GenerateStoryTitleOutput = z.infer<typeof GenerateStoryTitleOutputSchema>;

export async function generateStoryTitle(input: GenerateStoryTitleInput): Promise<GenerateStoryTitleOutput> {
  return generateStoryTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryTitlePrompt',
  input: {schema: GenerateStoryTitleInputSchema},
  output: {schema: GenerateStoryTitleOutputSchema},
  prompt: `You are a skilled book editor. Your task is to read the following story and create a short, evocative, and compelling title for it. The title should be under 8 words and should capture the essence of the story's theme, mood, or a key event. Do not use quotes in the title.

Story:
{{{fullStory}}}`,
});

const generateStoryTitleFlow = ai.defineFlow(
  {
    name: 'generateStoryTitleFlow',
    inputSchema: GenerateStoryTitleInputSchema,
    outputSchema: GenerateStoryTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
