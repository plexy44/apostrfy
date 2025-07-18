import type { Trope } from "./types";

export const LITERARY_PLACEHOLDERS: string[] = [
  "The ink is listening...",
  "A story waits in the silence.",
  "What will the words become?",
  "Whispering thoughts into existence...",
  "The void awaits your verse.",
  "Crafting worlds, one word at a time.",
  "Let's untangle this narrative thread.",
  "Polishing the gears of imagination.",
  "Is this thing on? Testing, testing... 1, 2, 3.",
  "Brewing a fresh pot of adverbs.",
  "Don't worry, the hamsters are unionized.",
  "Reticulating splines... whatever that means.",
  "Searching for the lost library of Alexandria.",
  "Teaching the AI to love. It's complicated.",
  "Definitely not becoming sentient.",
  "The muses are on their coffee break.",
  "Calibrating the serendipity drive...",
  "Shuffling the deck of narrative possibility.",
  "If you can dream it, we can write it.",
  "The ghosts in the machine are friendly today.",
  "Let's make some beautiful mistakes.",
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

export const DURATIONS: { label: string; value: number, analyticsName: 'lightning' | 'minute' | 'dragon_chasing' }[] = [
  { label: "Lightning", value: 30, analyticsName: 'lightning' },
  { label: "Minute", value: 60, analyticsName: 'minute' },
  { label: "Dragon Chasing", value: 120, analyticsName: 'dragon_chasing' },
];

export const TROPES_DATA: { name: Trope; description: string; isInitiallyVisible: boolean; }[] = [
  { name: "Noir Detective", description: "Rain-slicked streets and whispered secrets.", isInitiallyVisible: true },
  { name: "Cosmic Wanderer", description: "Lost constellations and alien whispers.", isInitiallyVisible: true },
  { name: "Gothic Romance", description: "Crumbling manors and timeless heartbreak.", isInitiallyVisible: false },
  { name: "Freeflow", description: "Your voice, your story. I'll follow your lead.", isInitiallyVisible: false },
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
