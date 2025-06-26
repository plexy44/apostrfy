/**
 * @fileoverview This is the entry point for the Genkit development server.
 * It imports all the defined flows so they can be inspected and tested
 * through the Genkit developer UI.
 */

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-story-content.ts';
import '@/ai/flows/generate-quote-banner.ts';
import '@/ai/flows/generate-mood-analysis.ts';
import '@/ai/flows/generate-style-match.ts';
import '@/ai/flows/generate-story-keywords.ts';
