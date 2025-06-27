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
  prompt: `You are an expert screenplay editor. Your task is to take the following raw story transcript and transform it into a professionally formatted screenplay excerpt.

Follow these rules meticulously:
1.  **Analyze the Content**: Read the entire transcript to understand the flow, setting, and actions.
2.  **Format as Action Lines**: Convert the entire narrative into action lines (standard paragraphs). Do NOT invent scene headings (like INT. DINER - NIGHT) unless the location is explicitly and clearly stated. Do NOT invent character names or format any text as dialogue. The entire output should be descriptive action.
3.  **Merge and Refine**: Weave the alternating lines from the two authors into a single, cohesive narrative. Create fluid, well-structured paragraphs.
4.  **Correct and Polish**: Correct all spelling and grammar errors. Ensure professional, clean prose.
5.  **Output**: The final output should be a single block of text representing the action lines of a script. Use standard paragraph breaks.

This is NOT a chat log. It is a creative story. Your job is to make it read like a piece of a movie script.

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
