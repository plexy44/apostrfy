import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  models: {
    'gemini-pro': 'gemini-1.5-pro-latest',
  },
  model: 'gemini-pro',
});
