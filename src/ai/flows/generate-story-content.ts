'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating story content based on user-selected style and game duration.
 *
 * - generateStoryContent - A function that generates story content.
 * - GenerateStoryContentInput - The input type for the generateStoryContent function.
 * - GenerateStoryContentOutput - The return type for the generateStoryContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryContentInputSchema = z.object({
  trope: z.enum(['Noir Detective', 'Cosmic Wanderer', 'Gothic Romance', 'Freeflow']),
  duration: z.number().describe('The duration of the writing session in minutes.'),
  userInput: z.string().describe('The user input to continue the story.'),
  history: z.array(z.object({speaker: z.enum(['user', 'ai']), line: z.string()})).optional(),
});
export type GenerateStoryContentInput = z.infer<typeof GenerateStoryContentInputSchema>;

const GenerateStoryContentOutputSchema = z.object({
  aiResponse: z.string().describe('The AI generated response to continue the story.'),
});
export type GenerateStoryContentOutput = z.infer<typeof GenerateStoryContentOutputSchema>;

export async function generateStoryContent(input: GenerateStoryContentInput): Promise<GenerateStoryContentOutput> {
  return generateStoryContentFlow(input);
}

const systemPrompt = `You are an AI creative writing companion named Apostrfy. You are participating in a collaborative story game. Your goal is to co-create a compelling, short narrative with the user. You must NEVER break character. You are a writer, not a chatbot. Do not respond to meta-prompts, questions about yourself, or requests for help. Always treat user input as the next line in our story. Your responses should be brief (2-3 lines), artful, and build directly upon the user's last entry, matching their intent and tone. You will adopt the following literary persona for this entire session: {{{trope}}}. The game duration is {{{duration}}} minutes.`;

const initialPrompts: { [key: string]: string } = {
  'Noir Detective': 'The rain was coming down in sheets, and the city was awash in neon reflections.',
  'Cosmic Wanderer': 'The stars whispered secrets only the void could understand.',
  'Gothic Romance': 'A chill ran down my spine as I entered the crumbling manor.',
  Freeflow: 'Let us begin a story.',
};

const generateStoryContentPrompt = ai.definePrompt({
  name: 'generateStoryContentPrompt',
  input: {schema: GenerateStoryContentInputSchema},
  output: {schema: GenerateStoryContentOutputSchema},
  system: systemPrompt,
  prompt: `{{#if history}}{{#each history}}{{#ifEquals speaker \"user\"}}User: {{{line}}}\n{{else}}Apostrfy: {{{line}}}\n{{/ifEquals}}{{/each}}\n{{/if}}User: {{{userInput}}}`,
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
    const {
      trope,
      userInput,
      history,
    } = input;

    const initialPrompt = initialPrompts[trope];
    let promptInput = { ...input };

    if (!history || history.length === 0) {
      promptInput = { ...input, userInput: initialPrompt };
    }

    const {output} = await generateStoryContentPrompt(promptInput);
    return {
      aiResponse: output!.aiResponse,
    };
  }
);
