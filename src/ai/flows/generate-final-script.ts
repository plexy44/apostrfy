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
  prompt: `You are a professional screenplay editor. Your task is to take the following raw story transcript, which includes speaker tags like 'USER:' and 'APOSTRFY:', and transform it into a polished, final script.

Your responsibilities are:
1.  **Correct Spelling and Grammar**: Fix typos and grammatical errors.
2.  **Enhance Formatting**:
    *   Ensure proper punctuation.
    *   Combine short, choppy action lines into fluid, descriptive paragraphs. Use line breaks to create natural spacing and rhythm.
    *   Action/description lines should NOT have a speaker prefix. If a line tagged with a speaker is clearly an action (e.g., 'USER: I walk to the door.'), remove the tag and treat it as an action line.
3.  **Handle Dialogue**:
    *   For lines prefixed with a character name (e.g., 'USER:', 'APOSTRFY:', or others provided in the text), format them as dialogue.
    *   You can keep 'USER' and 'APOSTRFY' or, if the context suggests a more fitting character name, you may replace them (e.g., 'DETECTIVE' for 'USER').
    *   The format must be the character name in all caps, followed by a colon.
4.  **Preserve Intent**: Do not add new story elements. Your role is to edit and format the existing content into a readable screenplay format.
5.  **Output**: Return the complete, edited script as a single block of text. Use newlines to separate paragraphs and dialogue blocks appropriately.

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
