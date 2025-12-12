/**
 * @fileOverview Cleans and formats a raw story transcript. This flow focuses
 * strictly on correcting spelling and grammar and combining the dialogue into
 * a cohesive narrative with paragraphs. It does not interpret or add content.
 *
 * - generateFinalScript - A function that handles the script polishing process.
 * - GenerateFinalScriptInput - The input type for the generateFinalScript function.
 * - GenerateFinalScriptOutput - The return type for the generateFinalScript function.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { StoryPart } from '@/lib/types';

const StoryPartSchema = z.object({
  speaker: z.enum(['user', 'ai']),
  line: z.string(),
  personaName: z.string().optional(),
  isPaste: z.boolean().optional(),
});

const GenerateFinalScriptInputSchema = z.object({
  fullStory: z.array(StoryPartSchema).describe("The full raw story transcript, as an array of objects."),
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
  input: {schema: z.object({ storyText: z.string() })},
  output: {schema: GenerateFinalScriptOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a "story finisher" AI. Your task is to take the following raw, back-and-forth story transcript and transform it into a cohesive and compelling piece of micro-fiction.

**Your instructions are:**

1.  **Synthesize, Don't Just Combine**: Weave the lines of dialogue and action into a unified narrative. Create smooth transitions between speakers.
2.  **Embellish and Enhance**: Add descriptive details, sensory information, and internal thoughts where appropriate to enrich the scene. Your goal is to elevate the raw text into a more literary format, like an excerpt from a novel.
3.  **Correct and Polish**: Fix any spelling mistakes and grammatical errors. Ensure the final text flows naturally.
4.  **Preserve the Core**: Maintain the original tone, plot, and character voices established in the transcript. The embellishments should support the existing story, not change it.
5.  **Format as Prose**: The final output should be a single block of text formatted into standard paragraphs. Do not use dialogue tags like "USER:" or "SCRIBLOX:".

**Raw Story Transcript:**
\`\`\`
{{{storyText}}}
\`\`\`

Turn this raw material into a short, interesting piece of literature.`,
});


const generateFinalScriptFlow = ai.defineFlow(
  {
    name: 'generateFinalScriptFlow',
    inputSchema: GenerateFinalScriptInputSchema,
    outputSchema: GenerateFinalScriptOutputSchema,
  },
  async ({ fullStory }) => {
    // Convert the story array to a simple string for the AI.
    const storyText = fullStory
        .map(part => {
            let speaker;
            if (part.personaName) {
                speaker = `${part.personaName}:`;
            } else if (part.isPaste) {
                speaker = 'USER (Pasted):';
            } else {
                speaker = part.speaker === 'user' ? 'USER:' : 'SCRIBLOX:';
            }
            return `${speaker} ${part.line}`;
        }).join('\n');

    const maxRetries = 3;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      try {
        const {output} = await prompt({ storyText });
        return output!;
      } catch (e: any) {
        lastError = e;
        const isRateLimitError = e.message?.includes('429');
        const isServiceUnavailable = e.message?.includes('503') || e.status === 503;

        if (isRateLimitError) {
          attempt++;
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds for rate limit
          }
        } else if (isServiceUnavailable) {
          attempt++;
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt))); // Exponential backoff
          }
        } else {
          // It's not a retriable error, so throw immediately
          throw e;
        }
      }
    }
    // If we've exhausted all retries, throw the last error
    throw lastError;
  }
);
