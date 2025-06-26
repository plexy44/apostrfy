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
  prompt: `You are a skilled story editor. Your task is to take the following raw story transcript, composed of alternating lines from two authors, and weave it into a single, cohesive narrative.

Your responsibilities are:
1.  **Correct Spelling and Grammar**: Fix any typos and grammatical errors.
2.  **Create Fluid Paragraphs**: Combine the short, alternating lines into well-structured paragraphs. Ensure the flow between sentences is natural and seamless.
3.  **Maintain Narrative Integrity**: Preserve the original story, characters, and plot points. Do not add new ideas or change the intent of the original authors.
4.  **Output**: Return the complete, edited story as a single block of text. Use newlines to separate paragraphs for readability.

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
