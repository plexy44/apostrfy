import type { Trope, TropePersonaKey } from "./types";

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
    description: "Rain slicked the asphalt, reflecting neon signs like bleeding wounds. In this city, secrets are currency and everyone is bankrupt. A lone detective, haunted by his past, navigates a labyrinth of femme fatales and double-crosses. The truth? It’s a luxury no one here can afford, paid for in lead.", 
    isInitiallyVisible: true 
  },
  { 
    name: "Cosmic Wanderer", 
    description: "Adrift in the velvet nothing, a solitary vessel ghosts between dying stars and nascent galaxies. Inside, a lone traveler deciphers cryptic signals from unknowable intelligences, contemplating humanity's fragile footnote in an infinite, uncaring cosmos. The destination is a question, and the silence is the only answer they have.", 
    isInitiallyVisible: true 
  },
  { 
    name: "Gothic Romance", 
    description: "Within the crumbling spine of a forgotten manor, a love story unfolds, waltzing with ancestral madness and forbidden desires. Passion here is a fever, inseparable from a deep, chilling melancholy. The line between devotion and obsession is as thin as a cobweb, and every shadow whispers a tragic history.", 
    isInitiallyVisible: false 
  },
  { 
    name: "Freeflow", 
    description: "There is no map. This is a canvas for your stream of consciousness. Let your thoughts run wild, from the mundane to the surreal, the beautiful to the grotesque. I will listen to your rhythm, adapt to your voice, and follow your lead wherever the narrative river flows. Your mind is the genre.", 
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

export const NARRATIVE_HOOKS: Record<TropePersonaKey, string[]> = {
  noirDetective: [
    "A single playing card, the Queen of Spades, left on a wet sidewalk.",
    "The last message on a dead man's phone was just a single, cryptic number.",
    "A thick fog rolling in from the docks, smelling of salt and secrets.",
    "The distinct sound of a woman's laughter from an empty, locked room.",
    "A missing person's case where the only clue is a worn-out poetry book.",
    "A client who pays in antique gold coins and refuses to give their name.",
    "An old photograph that shows a murder victim alive and well yesterday.",
    "The sudden, inexplicable silence of a city that never sleeps.",
    "A key that fits no lock anyone can find.",
    "A coded message found tucked inside a matchbook from a closed-down bar."
  ],
  cosmicWanderer: [
    "The ship's AI begins humming a song that hasn't been written yet.",
    "A distress signal that is older than the universe itself.",
    "A planet where the flora are made of crystalline, moving glass.",
    "Discovering a perfect sphere of absolute nothingness in deep space.",
    "The last star in a forgotten galaxy finally flickers and dies.",
    "A log entry from a ghost ship details a journey to a non-existent star.",
    "Waking up from cryo-sleep to find the ship's destination has been erased.",
    "An alien signal that is a perfect echo of your own thoughts.",
    "Finding a perfect, Earth-like forest growing on the inside of an asteroid.",
    "A cosmic entity that communicates not with words, but with shared memories."
  ],
  gothicRomance: [
    "A portrait whose eyes seem to follow you with a sorrowful gaze.",
    "A locked diary that feels cold to the touch, even in the summer heat.",
    "The faint scent of dying roses in a room that has been sealed for a century.",
    "A music box that plays a haunting melody on its own during a thunderstorm.",
    "A hidden, overgrown garden containing a single, perpetually blooming black flower.",
    "A letter of confession from an ancestor, detailing a love they took to the grave.",
    "The discovery of a beautiful, antique dress that seems to fit you perfectly.",
    "A chilling prophecy found in the margins of an old family bible.",
    "A ghostly waltz heard echoing through the manor's empty ballroom.",
    "A strange, recurring dream of a lover you've never met, but whose face you know."
  ],
  freeflow: [
    "The taste of static on the air right before a storm.",
    "A sudden, overwhelming memory of a place you've never been.",
    "The realization that your shadow is no longer mimicking your movements.",
    "The quiet hum of a refrigerator in the middle of the night.",
a   "A conversation overheard between two birds that sounds suspiciously like an argument.",
    "The geometry of a spider's web, glistening with morning dew.",
    "The feeling of déjà vu for a future event.",
    "A forgotten shopping list found in the pocket of an old coat.",
    "The precise moment when a street lamp flickers on at dusk.",
    "The internal monologue of a cat watching a moth."
  ]
};