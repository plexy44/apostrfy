/**
 * @fileoverview Generates a story segment for a simulated writing session between two AI personas.
 * This flow is responsible for one turn in the automated narrative, ensuring the generated
 * text continues the story in the voice of the specified persona without engaging in direct conversation.
 *
 * - generateSimulationContent - A function that handles the story generation for one turn.
 * - GenerateSimulationContentInput - The input type for the generateSimulationContent function.
 * - GenerateSimulationContentOutput - The return type for the generateSimulationContent function.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StoryPartSchema = z.object({
  speaker: z.enum(['user', 'ai']),
  line: z.string(),
  personaName: z.string().optional(),
});

const GenerateSimulationContentInputSchema = z.object({
  trope: z.enum(['Noir Detective', 'Cosmic Wanderer', 'Gothic Romance', 'Freeflow']),
  history: z.array(StoryPartSchema).describe("The story so far, line by line."),
  personaToEmbody: z.object({
    name: z.string(),
    description: z.string(),
  }).describe("The persona who is currently writing."),
  otherPersona: z.object({
    name: z.string(),
    description: z.string(),
  }).describe("The other persona in the conversation."),
   initialSeed: z.string().optional().describe("A conceptual seed for the first line of the story."),
});
export type GenerateSimulationContentInput = z.infer<typeof GenerateSimulationContentInputSchema>;

const GenerateSimulationContentOutputSchema = z.object({
  aiResponse: z.string().describe('The AI-generated response to continue the story.'),
});
export type GenerateSimulationContentOutput = z.infer<typeof GenerateSimulationContentOutputSchema>;

export async function generateSimulationContent(input: GenerateSimulationContentInput): Promise<GenerateSimulationContentOutput> {
  return generateSimulationContentFlow(input);
}

const systemPrompt = `You are a creative writing AI. Your task is to embody a specific literary persona and write the next segment of a story. This is a collaborative story, not a conversation.

# Persona to Embody
- Name: {{{personaToEmbody.name}}}
- Style: {{{personaToEmbody.description}}}

# Story Genre
- {{{trope}}}

# Story So Far
{{#if history}}
{{#each history}}
- {{{this.line}}} 
{{/each}}
{{else}}
The story has not yet begun.
{{/if}}

# Instructions

{{#if history}}
---
### Directive: Continue Narrative
1.  **Embody Persona:** Your response MUST be written in the unique literary voice and style of {{{personaToEmbody.name}}}.
2.  **Continue, Don't Converse:** Your response must be a seamless and logical continuation of the "Story So Far". Do not address the previous writer. Do not write in a conversational tone. Your output is a paragraph in a novel.
3.  **Word Count Mirroring:** The word count of your final response should be approximately equal to the word count of the PREVIOUS line in the story.
---
{{else}}
---
### Directive: Start Story
1.  **Instruction:** Write the opening line of the story.
2.  **Catalyst:** Use the conceptual seed '{{{initialSeed}}}' as the direct catalyst for this opening line.
3.  **Constraint:** Be immediate and immersive. Keep the word count between 20 and 40 words.
---
{{/if}}

# Output
Return only the generated line of text. Do not include the persona's name, any headings, or any other conversational text.`;

const generateSimulationContentPrompt = ai.definePrompt({
  name: 'generateSimulationContentPrompt',
  input: {schema: GenerateSimulationContentInputSchema},
  output: {schema: GenerateSimulationContentOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: systemPrompt,
  config: {
    temperature: 0.75,
  }
});

const generateSimulationContentFlow = ai.defineFlow(
  {
    name: 'generateSimulationContentFlow',
    inputSchema: GenerateSimulationContentInputSchema,
    outputSchema: GenerateSimulationContentOutputSchema,
  },
  async (input) => {
    const maxRetries = 3;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      try {
        const { output } = await generateSimulationContentPrompt(input);
        return {
          aiResponse: output!.aiResponse,
        };
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
