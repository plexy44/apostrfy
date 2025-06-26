/**
 * @fileOverview Polishes a raw story transcript into a final, well-formatted script.
 *
 * - generateFinalScript - A function that handles the script polishing process.
 * - GenerateFinalScriptInput - The input type for the generateFinalScript function.
 * - GenerateFinalScriptOutput - The return type for the generateFinalScript function.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFinalScriptInputSchema = z.object({
  fullStory: z.string().describe("The full raw story transcript, including both user and AI lines, separated by newlines."),
});
export type GenerateFinalScriptInput = z.infer<typeof GenerateFinalScriptInputSchema>;

const GenerateFinalScriptOutputSchema = z.object({
  finalScript: z.string().describe("The polished and formatted final script as a single block of text."),
});
export type GenerateFinalScriptOutput = z.infer<typeof GenerateFinalScriptOutputSchema>;

export async function generateFinalScript(input: GenerateFinalScriptInput): Promise<GenerateFinalScriptOutput> {
  return generateFinalScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinalScriptPrompt',
  input: {schema: GenerateFinalScriptInputSchema},
  output: {schema: GenerateFinalScriptOutputSchema},
  prompt: `You are a professional copy editor. Your task is to take the following raw story transcript and transform it into a polished, final script.

Your responsibilities are:
1.  **Correct Spelling and Grammar**: Fix any typos or grammatical errors throughout the text.
2.  **Improve Formatting**: Ensure proper punctuation, including full stops at the end of sentences. Combine related lines into coherent paragraphs where appropriate, especially for action/description lines.
3.  **Preserve Script Structure**: It is crucial that you maintain the distinction between action lines and dialogue. Dialogue is always prefixed with a character name in all caps followed by a colon (e.g., 'CHARACTER:'). Do not remove these character prefixes.
4.  **Do Not Add Content**: Do not add new story elements, characters, or dialogue. Your role is to edit and format, not to create.

Return the complete, edited script as a single block of text, ready for display.

Raw Story Transcript:
{{{fullStory}}}`,
});

const generateFinalScriptFlow = ai.defineFlow(
  {
    name: 'generateFinalScriptFlow',
    inputSchema: GenerateFinalScriptInputSchema,
    outputSchema: GenerateFinalScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
