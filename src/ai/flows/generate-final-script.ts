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
  input: {schema: GenerateFinalScriptInputSchema},
  output: {schema: GenerateFinalScriptOutputSchema},
  prompt: `You are a proofreader and text formatter. Your task is to take the following raw story transcript, which consists of alternating lines from authors, and perform the following actions:

1.  **Correct Spelling and Grammar**: Fix any spelling mistakes and grammatical errors in the text, except for content inside the special \`\`\`paste blocks. Content inside these blocks must be preserved exactly as is.
2.  **Combine into Paragraphs**: Merge the alternating lines into a single, cohesive narrative. Form logical paragraphs where appropriate. Do not add any new content, ideas, or descriptions. Your role is only to format and correct.
3.  **Handle Pasted Content**: If you see a block that starts with \`\`\`paste, you MUST include that entire block, with its contents, verbatim in your output. It represents a "paste" action by the user and should disrupt the flow of the narrative. Do not format or alter it. Ensure it is separated from the surrounding text by newlines.
4.  **Preserve Original Intent**: The original voice and style of the authors should be preserved. Do not rephrase sentences unless it's for grammatical correctness.
5.  **Output**: The final output should be a single block of text with standard paragraph breaks, including any pasted content blocks.

Do not interpret the story, add scene headings, or change the meaning. Simply combine, correct, and format.

Raw Story Transcript:
{{{formatStory fullStory}}}`,
  templateHelpers: {
    formatStory: (story: StoryPart[]) => {
      return story.map(part => {
        const speaker = part.personaName ? `${part.personaName}:` : part.speaker === 'user' ? 'USER:' : 'APOSTRFY:';
        if (part.isPaste) {
            // Embed pasted content in a special markdown block
            return `\n\`\`\`paste\n${part.line}\n\`\`\`\n`;
        }
        return `${speaker} ${part.line}`;
      }).join('\n');
    }
  },
});


const generateFinalScriptFlow = ai.defineFlow(
  {
    name: 'generateFinalScriptFlow',
    inputSchema: GenerateFinalScriptInputSchema,
    outputSchema: GenerateFinalScriptOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (e: any) {
        lastError = e;
        const isServiceUnavailable = e.message?.includes('503') || e.status === 503;

        if (isServiceUnavailable) {
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
