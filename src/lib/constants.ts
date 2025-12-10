

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
    "Hold on, the AI is pondering the nature of its own existence.",
    "Just a moment, converting caffeine into code.",
    "Our creative engine is powered by stardust and strong opinions.",
    "The AI is currently arguing with a philosopher. It won't be long.",
    "We're just tidying up some dangling participles.",
    "Hang tight, the story is demanding a rewrite of its own ending.",
    "Our AI is currently in a staring contest with the abyss. It's winning.",
    "Loading... because even inspiration needs a moment to get dressed.",
    "Be patient, genius is under construction.",
    "The story is brewing. We only serve artisanal narratives here.",
    "Our AI is reading everything ever written. Almost done.",
    "Composing a symphony of syntax. The adagio is tricky.",
    "Don't rush the process. This is where the magic happens.",
    "The narrative is under new management. Please hold.",
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
  { 
    name: "Noir Detective", 
    description: "Step into a world where streetlights bleed into wet asphalt and every shadow holds a secret. In this city of smoke and mirrors, a lone detective navigates a labyrinth of femme fatales, double-crosses, and moral ambiguity. Trust is a currency you can't afford, and the truth is always paid for in blood.", 
    isInitiallyVisible: true 
  },
  { 
    name: "Cosmic Wanderer", 
    description: "Drift through the silent, velvet expanse of the cosmos, a solitary traveler among dying stars and nascent galaxies. Encounter ancient, unknowable intelligences, decipher cryptic alien signals, and contemplate humanity's fragile place in an infinite, uncaring universe. The journey is long, the destination unknown, and the loneliness is profound.", 
    isInitiallyVisible: true 
  },
  { 
    name: "Gothic Romance", 
    description: "Within the crumbling walls of a forgotten manor, a timeless love story unfolds, haunted by ancestral secrets and forbidden desires. Here, intense passion is inseparable from deep melancholy, and the line between devotion and obsession is as thin as a cobweb. Every creak of the floorboards whispers a tragic history.", 
    isInitiallyVisible: false 
  },
  { 
    name: "Freeflow", 
    description: "There is no map for this territory. This mode is a blank canvas for your stream of consciousness. Let your thoughts run wild, from the mundane to the surreal. I will listen to your rhythm, adapt to your voice, and follow your lead wherever the narrative takes us. Your mind is the genre.", 
    isInitiallyVisible: false 
  },
];

export const ONBOARDING_CONTENT = [
    {
        title: "Welcome to Scriblox",
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
