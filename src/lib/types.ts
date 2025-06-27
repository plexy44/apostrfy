/**
 * @fileoverview This file defines the core TypeScript types used throughout the Apostrfy application.
 * It centralizes the definitions for game states, story elements, character archetypes (tropes),
 * and the structure of stored data, ensuring consistency and type safety across different components and modules.
 */

export type Trope = 'Noir Detective' | 'Cosmic Wanderer' | 'Gothic Romance' | 'Freeflow';
export type TropePersonaKey = 'noirDetective' | 'cosmicWanderer' | 'gothicRomance' | 'freeflow';

export type Speaker = 'user' | 'ai';

export type StoryPart = {
  speaker: Speaker;
  line: string;
  personaName?: string;
};

export type GameState = 
  | { status: 'loading_screen' }
  | { status: 'onboarding', step: number }
  | { status: 'menu' }
  | { status: 'generating_initial_story' }
  | { status: 'playing' }
  | { status: 'generating_summary' }
  | { status: 'gameover' };

export interface PastStory {
  id: string;
  timestamp: number;
  trope: Trope;
  duration: number;
  story: StoryPart[];
}

export interface Persona {
  name: string;
  description: string;
}

export type InspirationalPersonas = {
  [key in TropePersonaKey]: Persona[];
};

export type Emotion = 'Joy' | 'Hope' | 'Awe' | 'Serenity' | 'Melancholy' | 'Tension' | 'Fear' | 'Sadness' | 'Morose';

export interface GameAnalysis {
  title: string;
  trope: Trope;
  quoteBanner: string;
  mood: {
    primaryEmotion: Emotion;
    confidenceScore: number;
  };
  style: {
    primaryMatch: string;
    secondaryMatch: string;
  };
  famousQuote: {
    author: string;
    quote: string;
  } | null;
  keywords: string[];
  finalScript: string;
  story: StoryPart[];
}
