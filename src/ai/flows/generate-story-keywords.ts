/**
 * @fileOverview Generates conceptual keywords based on a sentiment analysis of the user's writing.
 *
 * - generateStoryKeywords - A function that analyzes user content and generates keywords.
 * - GenerateStoryKeywordsInput - The input type for the generateStoryKeywords function.
 * - GenerateStoryKeywordsOutput - The return type for the generateStoryKeywords function.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryKeywordsInputSchema = z.object({
  userContent: z.string().describe("A single block of text containing only the user's lines from the session."),
});
export type GenerateStoryKeywordsInput = z.infer<typeof GenerateStoryKeywordsInputSchema>;

const GenerateStoryKeywordsOutputSchema = z.object({
  keywords: z.array(z.string()).min(5).max(7).describe("An array of 5 to 7 single-word, conceptual keywords in Title Case that encapsulate the overall sentiment of the user's writing (e.g., 'Hope', 'Isolation', 'Urgency')."),
});
export type GenerateStoryKeywordsOutput = z.infer<typeof GenerateStoryKeywordsOutputSchema>;

export async function generateStoryKeywords(input: GenerateStoryKeywordsInput): Promise<GenerateStoryKeywordsOutput> {
  return generateStoryKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryKeywordsPrompt',
  input: {schema: GenerateStoryKeywordsInputSchema},
  output: {schema: GenerateStoryKeywordsOutputSchema},
  model: 'gemini-pro',
  prompt: `You are a literary analyst AI specializing in sentiment and thematic analysis. Read the following text, which contains a user's creative writing. Your task is to look beyond the literal words and analyze the underlying emotional tone, mood, and core themes.

Based on this deep analysis, generate 5 to 7 single-word, conceptual keywords that encapsulate the overall sentiment of the piece. These keywords should represent abstract feelings or ideas (e.g., 'Hope', 'Isolation', 'Urgency', 'Discovery', 'Conflict') rather than being words directly extracted from the text.

Format all keywords in Title Case.

Return your response as a JSON object with a single key, \`keywords\`, which is an array of these generated strings.

User Text:
{{{userContent}}}`,
});

const generateStoryKeywordsFlow = ai.defineFlow(
  {
    name: 'generateStoryKeywordsFlow',
    inputSchema: GenerateStoryKeywordsInputSchema,
    outputSchema: GenerateStoryKeywordsOutputSchema,
  },
  async (input) => {
    const maxRetries = 3;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      try {
        const { output } = await prompt(input);
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
