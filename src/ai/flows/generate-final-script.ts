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
  fullStory: z.string().describe("The full raw story transcript, with each line prefixed by its speaker (e.g., 'USER:' or 'APOSTRFY:')."),
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
  prompt: `You are a proofreader and text formatter. Your task is to take the following raw story transcript, which consists of alternating lines from two authors, and perform the following actions:

1.  **Correct Spelling and Grammar**: Fix any spelling mistakes and grammatical errors in the text.
2.  **Combine into Paragraphs**: Merge the alternating lines into a single, cohesive narrative. Form logical paragraphs where appropriate. Do not add any new content, ideas, or descriptions. Your role is only to format and correct.
3.  **Preserve Original Intent**: The original voice and style of the authors should be preserved. Do not rephrase sentences unless it's for grammatical correctness.
4.  **Output**: The final output should be a single block of text with standard paragraph breaks.

Do not interpret the story, add scene headings, or change the meaning. Simply combine, correct, and format.

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
