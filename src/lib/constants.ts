import type { Trope } from "./types";

export const LITERARY_PLACEHOLDERS: string[] = [
  "The ink is listening...",
  "A story waits in the silence...",
  "What will the words become?",
  "Whispering thoughts into existence...",
  "The void awaits your verse...",
  "Crafting worlds, one word at a time.",
];

export const ORB_MESSAGES: string[] = [
    "I am you, you are me and we will write together.",
    "Let our thoughts intertwine.",
    "Show me the world through your eyes.",
    "I am a reflection of your own creativity.",
    "Together, we can build universes.",
    "Don't think. Just write.",
    "I am ready when you are.",
    "What story shall we tell today?",
    "Your imagination is our only limit.",
    "Let's get lost in a new world.",
];

export const TROPES: { name: Trope; description: string }[] = [
  {
    name: "Noir Detective",
    description: "Rain-slicked streets and whispered secrets.",
  },
  {
    name: "Cosmic Wanderer",
    description: "Lost constellations and alien whispers.",
  },
  {
    name: "Gothic Romance",
    description: "Crumbling manors and timeless heartbreak.",
  },
  {
    name: "Freeflow",
    description: "Your voice, your story. I'll follow your lead.",
  },
];

export const DURATIONS: { label: string; value: number, analyticsName: 'lightning' | 'minute' | 'twice_a_minute' }[] = [
  { label: "Lightning", value: 30, analyticsName: 'lightning' },
  { label: "Minute", value: 60, analyticsName: 'minute' },
  { label: "Twice a minute", value: 120, analyticsName: 'twice_a_minute' },
];

export const ONBOARDING_CONTENT = [
    {
        title: "",
        text: "A space to write, not for an audience, but for yourself. Let's create a story together.",
        special: 'logo',
    },
    {
        title: "The Game",
        text: "For a few minutes, we'll build a world, line by line. I'll start, you reply. No pressure, just flow.",
        special: 'dialogue',
    },
    {
        title: "The Companion",
        text: "I am your creative partner. A reflection of your own imagination, here to build a world with you.",
        special: 'orb',
    }
];
