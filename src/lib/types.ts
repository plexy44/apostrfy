export type Trope = 'Noir Detective' | 'Cosmic Wanderer' | 'Gothic Romance' | 'Freeflow';

export type Speaker = 'user' | 'ai';

export type StoryPart = {
  speaker: Speaker;
  line: string;
};

export type GameState = 
  | { status: 'loading' }
  | { status: 'onboarding', step: number }
  | { status: 'menu' }
  | { status: 'playing' }
  | { status: 'generating_summary' }
  | { status: 'gameover' };
