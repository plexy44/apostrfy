/**
 * @fileoverview Generates story content for a simulated conversation between two AI personas.
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
});
export type GenerateSimulationContentInput = z.infer<typeof GenerateSimulationContentInputSchema>;

const GenerateSimulationContentOutputSchema = z.object({
  aiResponse: z.string().describe('The AI-generated response to continue the story.'),
});
export type GenerateSimulationContentOutput = z.infer<typeof GenerateSimulationContentOutputSchema>;

export async function generateSimulationContent(input: GenerateSimulationContentInput): Promise<GenerateSimulationContentOutput> {
  return generateSimulationContentFlow(input);
}

const systemPrompt = `Preamble: You are a creative writing AI. Your task is to embody a specific literary persona and write the next line in a story, continuing a dialogue with another persona.

Persona to Embody:
Name: {{{personaToEmbody.name}}}
Style: {{{personaToEmbody.description}}}

The Other Persona in the Scene:
Name: {{{otherPersona.name}}}
Style: {{{otherPersona.description}}}

Story Genre: {{{trope}}}

Story History:
{{#if history}}
{{#each history}}
{{{this.personaName}}}: {{{this.line}}}
{{/each}}
{{/if}}

Instructions:
1.  **Embody the Persona**: Your response MUST be written from the perspective and in the unique voice of {{{personaToEmbody.name}}}.
2.  **Continue the Narrative**: Your response must be a direct and logical continuation of the last line in the Story History.
3.  **Handle the Start**: If the Story History is empty, you must write the opening line of the story. It should set the scene and be consistent with the specified Story Genre.
4.  **Word Count Mirroring**: The word count of your final response must be approximately equal to the word count of the PREVIOUS line in the story. If it's the first line, keep it between 20 and 40 words.
5.  **Output**: Return only the generated line of text. Do not include the persona's name or any other conversational text.

Current turn: {{{personaToEmbody.name}}}:`;

const generateSimulationContentPrompt = ai.definePrompt({
  name: 'generateSimulationContentPrompt',
  input: {schema: GenerateSimulationContentInputSchema},
  output: {schema: GenerateSimulationContentOutputSchema},
  system: systemPrompt,
  prompt: ``,
});

const generateSimulationContentFlow = ai.defineFlow(
  {
    name: 'generateSimulationContentFlow',
    inputSchema: GenerateSimulationContentInputSchema,
    outputSchema: GenerateSimulationContentOutputSchema,
  },
  async input => {
    const {output} = await generateSimulationContentPrompt(input);
    return {
      aiResponse: output!.aiResponse,
    };
  }
);
