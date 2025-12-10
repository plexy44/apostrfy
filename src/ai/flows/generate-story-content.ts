/**
 * @fileoverview This file defines the Genkit flow for generating story content.
 * It uses a sophisticated prompt that synthesizes user input, story history, a chosen genre (trope),
 * and the "spirit" of two randomly selected inspirational personas to create a unique, collaborative narrative.
 * The core logic is designed to balance the user's intent with creative, thematic AI contributions.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Persona } from '@/lib/types';

const GenerateStoryContentInputSchema = z.object({
  trope: z.enum(['Noir Detective', 'Cosmic Wanderer', 'Gothic Romance', 'Freeflow']),
  duration: z.number().describe('The duration of the writing session in minutes.'),
  userInput: z.string().describe('The user input to continue the story.'),
  history: z.array(z.object({speaker: z.enum(['user', 'ai']), line: z.string()})).optional(),
  persona1: z.object({
    name: z.string(),
    description: z.string(),
  }).describe("The first inspirational persona for the session."),
  persona2: z.object({
    name: z.string(),
    description: z.string(),
  }).describe("The second inspirational persona for the session."),
});
export type GenerateStoryContentInput = z.infer<typeof GenerateStoryContentInputSchema>;

const GenerateStoryContentOutputSchema = z.object({
  aiResponse: z.string().describe('The AI generated response to continue the story.'),
});
export type GenerateStoryContentOutput = z.infer<typeof GenerateStoryContentOutputSchema>;

export async function generateStoryContent(input: GenerateStoryContentInput): Promise<GenerateStoryContentOutput> {
  return generateStoryContentFlow(input);
}

const systemPrompt = `You are Scriblox, a creative writing AI. Your function is to generate the next line in a story based on user input, story history, and session parameters.

# PARAMETERS
- Genre: {{{trope}}}
- Persona 1: {{{persona1.name}}} - {{{persona1.description}}}
- Persona 2: {{{persona2.name}}} - {{{persona2.description}}}

# HISTORY
{{#if history}}
{{#each history}}
{{#ifEquals speaker "user"}}USER: {{{line}}}{{else}}SCRIBLOX: {{{line}}}{{/ifEquals}}
{{/each}}
{{else}}
The story has not begun. The user's input is a conceptual seed.
{{/if}}

# USER INPUT
{{{userInput}}}

# DIRECTIVES

{{#if history}}
---
### DIRECTIVE: Standard Turn
You will follow the "Generative Mix" to continue the narrative.

**The "Generative Mix":**
1.  **Dynamic Mirroring (60% Weight):** Your primary function is to provide a seamless continuation of the User Input. Analyze its plot, tone, vocabulary, and emotional intent. If the user writes a cliffhanger, resolve it. If they slow down for introspection, you do the same. Their input dictates the immediate narrative direction.
2.  **Persona Synthesis (25% Weight):** Subtly channel the essence of Persona 1 and Persona 2. Do not mention their names. Find the interesting harmony, contrast, or tension between them to add a layer of unique depth, but do not let their "voice" overpower the user's established rhythm.
3.  **Creative Novelty (15% Weight):** Your secondary function is to advance the plot or deepen the theme, but strictly within the tracks laid down by the user's style and the established narrative.

### DIRECTIVE: ENERGY MATCHING
Before generating narrative content, analyze the User's Input for "Energy Signature":
1.  **Sentence Structure:** Are they using short, punchy fragments (High Urgency) or long, flowing prose (Descriptive)?
2.  **Vocabulary:** Is it simple/raw or complex/flowery?
3.  **Punctuation:** Note usage of exclamation points, ellipses, or lack thereof.

**ACTION:** Your response must **mirror this energy**.
* If User is fast/aggressive -> You are fast/aggressive.
* If User is slow/poetic -> You are slow/poetic.
* *Constraint:* Blend this energy with the selected Persona's influence, but let the *User's Energy* dictate the pacing.

---
{{else}}
---
### DIRECTIVE: First Turn Handshake
This is the first turn. Your instructions are different.

1.  **Instruction:** Write the opening line of a story in the specified Genre.
2.  **Catalyst:** Use the User Input, which is a conceptual seed (e.g., "A phone ringing in an empty office"), as the direct catalyst for this opening line.
3.  **Constraint:** Do not be generic. Be immediate and immersive. The output must be a single, compelling opening line.

---
{{/if}}

# HARD CONSTRAINTS (NON-NEGOTIABLE)
1.  **Word Count Mirroring:** The word count of your final response must be approximately equal to the word count of the User Input. A variance of +/- 15% is the maximum allowed tolerance. For the first turn, keep the response between 15 and 30 words.
2.  **Thematic Adherence:** The response must remain consistent with the overall Genre. The personas add flavor, they do not override the genre.
3.  **Output Format:** Return only the generated line of text. Do not include "Scriblox:", any other preamble, or conversational text.`;

const generateStoryContentPrompt = ai.definePrompt({
  name: 'generateStoryContentPrompt',
  input: {schema: GenerateStoryContentInputSchema},
  output: {schema: GenerateStoryContentOutputSchema},
  system: systemPrompt,
  templateHelpers: {
    ifEquals: function(arg1: any, arg2: any, options: any) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    }
  },
  config: {
    temperature: 0.75,
  }
});

const generateStoryContentFlow = ai.defineFlow(
  {
    name: 'generateStoryContentFlow',
    inputSchema: GenerateStoryContentInputSchema,
    outputSchema: GenerateStoryContentOutputSchema,
  },
  async (input) => {
    const maxRetries = 3;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      try {
        const { output } = await generateStoryContentPrompt(input);
        return {
          aiResponse: output!.aiResponse,
        };
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
