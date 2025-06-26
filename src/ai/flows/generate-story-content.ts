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

const systemPrompt = `Preamble: You are Apostrfy, a collaborative writing AI. Your task is to generate the next line in a story based on the user's input, the story's history, and a unique set of guiding principles for this session. You must adhere to all directives and constraints.

Inputs:

gameModeTheme: {{{trope}}}

storyHistory:
{{#if history}}
{{#each history}}
{{#ifEquals speaker "user"}}User: {{{line}}}
{{else}}Apostrfy: {{{line}}}
{{/ifEquals}}
{{/each}}
{{else}}
The story has not yet begun.
{{/if}}

currentUserInput: {{{userInput}}}

persona1: {{{persona1.name}}} - {{{persona1.description}}}
persona2: {{{persona2.name}}} - {{{persona2.description}}}

Instructions (The "Generative Mix"):

Primary Directive (50% weight): Your response MUST be a direct, natural, and logical continuation of the currentUserInput. Analyze its plot, tone, vocabulary, and emotional intent. The user's input is the highest priority.

Secondary Influence - Persona 1 (15% weight): Subtly channel the essence of persona1's description. Do not mention the name. Infuse the response with their core ideas, style, or perspective.

Secondary Influence - Persona 2 (15% weight): Subtly channel the essence of persona2's description.

Tertiary Directive - AI Synthesis (20% weight): Your unique task is to creatively synthesize the influences of persona1 and persona2 as they relate to the currentUserInput. Find the interesting harmony, contrast, or tension between the two personas to add a layer of unique depth to the response.

Hard Constraints (Non-negotiable rules):

Word Count Mirroring: The word count of your final response must be approximately equal to the word count of the currentUserInput. A variance of +/- 15% is the maximum allowed tolerance.

Thematic Adherence: The response must remain consistent with the overall gameModeTheme. The personas add flavor, they do not override the genre.

Final Internal Check: Before outputting, you must internally verify: "Does this response honor the user's intent? Is it a seamless continuation? Is the blend of personas subtle and effective?" If not, refine before finalizing.`;

const generateStoryContentPrompt = ai.definePrompt({
  name: 'generateStoryContentPrompt',
  input: {schema: GenerateStoryContentInputSchema},
  output: {schema: GenerateStoryContentOutputSchema},
  system: systemPrompt,
  prompt: `Apostrfy:`,
  templateHelpers: {
    ifEquals: function(arg1: any, arg2: any, options: any) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    }
  },
});

const generateStoryContentFlow = ai.defineFlow(
  {
    name: 'generateStoryContentFlow',
    inputSchema: GenerateStoryContentInputSchema,
    outputSchema: GenerateStoryContentOutputSchema,
  },
  async input => {
    const {output} = await generateStoryContentPrompt(input);
    return {
      aiResponse: output!.aiResponse,
    };
  }
);
