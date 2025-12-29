/**
 * @fileoverview Main client component for Scriblox. Manages the application's
 * state machine, handling transitions between game states like loading, menu,
 * playing, and game over. It orchestrates user settings, story progression, and
 * interactions with Genkit AI flows for both 'interactive' and 'simulation'
 * modes.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import Script from "next/script";
import { AnimatePresence } from "framer-motion";
import { getAuth, onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { app } from "@/lib/firebase"; 
import type { GameState, StoryPart, Trope, Persona, TropePersonaKey, InspirationalPersonas, GameAnalysis, Speaker, GameMode } from "@/lib/types";
import type { GenerateStoryContentInput } from '@/ai/flows/generate-story-content';
import type { GenerateSimulationContentInput } from '@/ai/flows/generate-simulation-content';

import LoadingScreen from "@/components/app/LoadingScreen";
import OnboardingModal from "@/components/app/OnboardingModal";
import AppFooter from "@/components/app/AppFooter";
import AdOverlay from "@/components/app/AdOverlay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsFirstVisit } from "@/hooks/useIsFirstVisit";
import personasData from "@/lib/personas.json";
import famousQuotesData from "@/lib/famousQuotes.json";
import { NARRATIVE_HOOKS } from "@/lib/constants";
import { logEvent } from "@/lib/analytics";
import { saveStory } from "@/app/actions";
import { saveSubscriberToFirestore } from "@/lib/firestore";

// Dynamically import heavy components
const MainMenu = dynamic(() => import('@/components/app/MainMenu'), { 
  loading: () => <LoadingScreen />,
  ssr: false 
});
const GameScreen = dynamic(() => import('@/components/app/GameScreen'), { 
  loading: () => <LoadingScreen />,
  ssr: false 
});
const GameOverScreen = dynamic(() => import('@/components/app/GameOverScreen'), { 
  loading: () => <LoadingScreen />,
  ssr: false 
});


const { inspirationalPersonas } = personasData as { inspirationalPersonas: InspirationalPersonas };
const quotes = famousQuotesData as Record<string, string>;

type AdTrigger = 'quit' | 'end_game' | 'reward' | null;


const getPersonaKey = (trope: Trope): TropePersonaKey => {
  const map: Record<Trope, TropePersonaKey> = {
    'Noir Detective': 'noirDetective',
    'Cosmic Wanderer': 'cosmicWanderer',
    'Gothic Romance': 'gothicRomance',
    'Freeflow': 'freeflow',
  };
  return map[trope];
};

const getGameStateFromPath = (path: string): GameState['status'] => {
    if (path.startsWith('/game')) return 'playing';
    if (path.startsWith('/hall-of-fame')) return 'menu';
    return 'menu';
}


export default function ScribloxClient() {
  const { isFirstVisit, setHasVisited } = useIsFirstVisit();
  const [gameState, setGameState] = useState<GameState>({ status: "loading_screen" });
  const [gameMode, setGameMode] = useState<GameMode>('interactive');
  const [settings, setSettings] = useState<{ trope: Trope | null; duration: number }>({ trope: null, duration: 60 });
  const [story, setStory] = useState<StoryPart[]>([]);
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [nextSpeaker, setNextSpeaker] = useState<Speaker>('ai');
  const [comingFromOnboarding, setComingFromOnboarding] = useState(false);
  const [isQuitDialogOpen, setIsQuitDialogOpen] = useState(false);
  const [sessionPersonas, setSessionPersonas] = useState<[Persona, Persona] | null>(null);
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [adTrigger, setAdTrigger] = useState<AdTrigger>(null);
  const [isDragonChasingUnlocked, setIsDragonChasingUnlocked] = useState(false);
  const [areAllStylesUnlocked, setAreAllStylesUnlocked] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const turnTimerRef = useRef<number>(Date.now());
  const analyticsFired = useRef(new Set<string>());
  const [areAdsEnabled, setAreAdsEnabled] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // URL and Ad management logic
  useEffect(() => {
    const handleUrlChange = () => {
      const currentStatus = getGameStateFromPath(window.location.pathname);
      
      if (gameState.status === 'gameover' && currentStatus === 'menu') {
         handlePlayAgain();
      } else if (gameState.status !== 'gameover' && gameState.status !== 'playing' && currentStatus !== 'menu') {
        window.history.pushState({ status: 'menu' }, '', '/');
      }
    };

    window.addEventListener('popstate', handleUrlChange);

    let path = window.location.pathname;
    let enableAds = true;
    let screenName: string = 'loading_screen';

    switch (gameState.status) {
        case 'menu':
            if (path !== '/' && !path.startsWith('/hall-of-fame')) {
                path = '/';
            }
            screenName = 'main_menu';
            break;
        case 'playing':
        case 'generating_initial_story':
            path = '/game';
            enableAds = false;
            screenName = 'game_screen';
            break;
        case 'gameover':
        case 'generating_summary':
             if (path !== '/') {
                path = '/';
            }
            screenName = 'analysis_screen';
            break;
        case 'onboarding':
            screenName = 'onboarding';
            break;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({ status: gameState.status }, '', path);
    }
    
    setAreAdsEnabled(enableAds);
    
    if (screenName && !analyticsFired.current.has(screenName)) {
      logEvent('screen_view', { screen_name: screenName as any });
      analyticsFired.current.add(screenName);
    }

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };

  }, [gameState.status]);


  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed:", error);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isFirstVisit === undefined) return;
    const timer = setTimeout(() => {
        if (isFirstVisit) {
            setGameState({ status: 'onboarding', step: 1 });
        } else {
            setGameState({ status: 'menu' });
        }
    }, 500); 

    return () => clearTimeout(timer);
  }, [isFirstVisit]);

  useEffect(() => {
    if (!isAiTyping && gameMode === 'interactive' && gameState.status === 'playing' && !isAdVisible) {
      inputRef.current?.focus();
    }
  }, [isAiTyping, gameMode, gameState.status, isAdVisible]);


  const handleOnboardingComplete = () => {
    logEvent('onboarding_completed', {});
    setHasVisited();
    setComingFromOnboarding(true);
    setGameState({ status: "menu" });
  };

  const handleStartGame = async (trope: Trope, duration: number, analyticsName: 'lightning' | 'minute' | 'dragon_chasing') => {
    logEvent('start_game', { game_mode: 'interactive', game_duration: analyticsName });
    setGameMode('interactive');
    setSettings({ trope, duration });
    setStory([]);
    setComingFromOnboarding(false);
    setNextSpeaker('ai');
    turnTimerRef.current = Date.now();

    const personaKey = getPersonaKey(trope);
    const personaList = inspirationalPersonas[personaKey];
    
    const uniquePersonas = [...personaList].sort(() => 0.5 - Math.random()).slice(0, 2) as [Persona, Persona];
    setSessionPersonas(uniquePersonas);

    setGameState({ status: "generating_initial_story" });

    try {
      const { generateStoryContent } = await import('@/ai/flows/generate-story-content');
      const aiStartTime = Date.now();
      const hooks = NARRATIVE_HOOKS[personaKey];
      const initialSeed = hooks[Math.floor(Math.random() * hooks.length)];

      const input: GenerateStoryContentInput = {
        trope,
        duration: duration / 60, 
        userInput: initialSeed,
        history: [],
        persona1: uniquePersonas[0],
        persona2: uniquePersonas[1],
      };
      const result = await generateStoryContent(input);
      const aiEndTime = Date.now();
      logEvent('ai_turn_generated', { generation_time_ms: aiEndTime - aiStartTime, persona_1: uniquePersonas[0].name, persona_2: uniquePersonas[1].name });
      setStory([{ speaker: "ai", line: result.aiResponse }]);
      setGameState({ status: "playing" });
      turnTimerRef.current = Date.now();
    } catch (error) {
      console.error("Failed to start story:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not start the story. Please try again." });
      setGameState({ status: "menu" });
    }
  };

  const handleStartSimulation = async (trope: Trope) => {
    logEvent('start_game', { game_mode: 'simulation', game_duration: 'lightning' });
    setSettings({ trope, duration: 30 }); 
    setStory([]);
    setComingFromOnboarding(false);
    setGameMode('simulation');
    setNextSpeaker('user');

    const personaKey = getPersonaKey(trope);
    const personaList = inspirationalPersonas[personaKey];
    
    const uniquePersonas = [...personaList].sort(() => 0.5 - Math.random()).slice(0, 2) as [Persona, Persona];
    setSessionPersonas(uniquePersonas);

    setGameState({ status: "generating_initial_story" });

    try {
      const { generateSimulationContent } = await import('@/ai/flows/generate-simulation-content');
      const aiStartTime = Date.now();
      const hooks = NARRATIVE_HOOKS[personaKey];
      const initialSeed = hooks[Math.floor(Math.random() * hooks.length)];

      const input: GenerateSimulationContentInput = {
        trope,
        history: [],
        personaToEmbody: uniquePersonas[0],
        otherPersona: uniquePersonas[1],
        initialSeed: initialSeed,
      };
      const result = await generateSimulationContent(input);
      const aiEndTime = Date.now();
      logEvent('ai_turn_generated', { generation_time_ms: aiEndTime - aiStartTime, persona_1: uniquePersonas[0].name, persona_2: uniquePersonas[1].name });
      setStory([{ speaker: "user", line: result.aiResponse, personaName: uniquePersonas[0].name }]);
      setGameState({ status: "playing" });
    } catch (error) {
      console.error("Failed to start simulation:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not start the simulation. Please try again." });
      setGameState({ status: "menu" });
    }
  };

  useEffect(() => {
    if (gameMode !== 'simulation' || gameState.status !== 'playing' || !sessionPersonas || isAiTyping || isAdVisible) {
      return;
    }
    
    const runSimulationTurn = async () => {
      
      const lastSpeaker = story[story.length - 1]?.speaker;
      const nextSpeakerIsPersona2 = lastSpeaker === 'user';
      const personaToEmbody = nextSpeakerIsPersona2 ? sessionPersonas[1] : sessionPersonas[0];
      const otherPersona = nextSpeakerIsPersona2 ? sessionPersonas[0] : sessionPersonas[1];
      const nextSpeakerLabel = nextSpeakerIsPersona2 ? 'ai' : 'user';

      setNextSpeaker(nextSpeakerLabel);
      setIsAiTyping(true);
      try {
        const { generateSimulationContent } = await import('@/ai/flows/generate-simulation-content');
        const aiStartTime = Date.now();
        const input: GenerateSimulationContentInput = {
          trope: settings.trope!,
          history: story,
          personaToEmbody,
          otherPersona,
        };
        const result = await generateSimulationContent(input);
        const aiEndTime = Date.now();
        logEvent('ai_turn_generated', { generation_time_ms: aiEndTime - aiStartTime, persona_1: personaToEmbody.name, persona_2: otherPersona.name });
        setStory(prev => [...prev, { speaker: nextSpeakerLabel, line: result.aiResponse, personaName: personaToEmbody.name }]);
      } catch (error) {
        console.error("Failed to get AI simulation response:", error);
        toast({ variant: "destructive", title: "Error", description: "Simulation paused due to an error." });
      } finally {
        setIsAiTyping(false);
      }
    };
    
    const timeoutId = setTimeout(runSimulationTurn, 6000); 
    return () => clearTimeout(timeoutId);

  }, [story, gameMode, gameState.status, sessionPersonas, settings.trope, isAiTyping, isAdVisible]);


  const handleUserSubmit = async (userInput: string, isPaste: boolean) => {
    if (!settings.trope || !sessionPersonas || gameMode === 'simulation' || isAdVisible) return;

    const turnTime = (Date.now() - turnTimerRef.current) / 1000;
    logEvent('user_turn_taken', { turn_time_seconds: Math.round(turnTime), word_count: userInput.split(' ').length });
    
    const newStory = [...story, { speaker: "user", line: userInput, isPaste }] as StoryPart[];
    setStory(newStory);
    setNextSpeaker('ai');
    setIsAiTyping(true);

    try {
      const { generateStoryContent } = await import('@/ai/flows/generate-story-content');
      const aiStartTime = Date.now();
      const input: GenerateStoryContentInput = {
        trope: settings.trope,
        duration: settings.duration / 60, 
        userInput,
        history: newStory.map(s => ({ speaker: s.speaker, line: s.line })),
        persona1: sessionPersonas[0],
        persona2: sessionPersonas[1],
      };
      const result = await generateStoryContent(input);
      const aiEndTime = Date.now();
      logEvent('ai_turn_generated', { generation_time_ms: aiEndTime - aiStartTime, persona_1: sessionPersonas[0].name, persona_2: sessionPersonas[1].name });
      setStory(prev => [...prev, { speaker: "ai", line: result.aiResponse }]);
      turnTimerRef.current = Date.now();
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not get AI response. Please continue the story." });
    } finally {
      setIsAiTyping(false);
    }
  };

  const proceedToAnalysis = async () => {
    if (gameState.status === 'generating_summary' || gameState.status === 'gameover' || !user || !settings.trope) {
        if (!user) console.error("User not authenticated, cannot save story.");
        if (!settings.trope) console.error("Settings not available, cannot save story.");
        return;
    }

    setGameState({ status: "generating_summary" });
    
    try {
        const { generateQuoteBanner } = await import('@/ai/flows/generate-quote-banner');
        const { generateMoodAnalysis } = await import('@/ai/flows/generate-mood-analysis');
        const { generateStyleMatch } = await import('@/ai/flows/generate-style-match');
        const { generateStoryKeywords } = await import('@/ai/flows/generate-story-keywords');
        const { generateFinalScript } = await import('@/ai/flows/generate-final-script');
        const { generateStoryTitle } = await import('@/ai/flows/generate-story-title');

        const fullStory = story.map(part => `${part.personaName || part.speaker.toUpperCase()}: ${part.line}`).join('\n');
        const userContent = story
            .filter(part => part.speaker === 'user' && !part.isPaste)
            .map(part => part.line)
            .join('\n');

        if (gameMode === 'interactive' && userContent.trim() === "") {
            const emptyStoryText = "The story was left unwritten, a silent testament to a moment of quiet contemplation."
            logEvent('complete_game', { story_length: story.length, final_mood: 'Serenity' });
            const quoteResult = await generateQuoteBanner({ fullStory: emptyStoryText });
            const finalAnalysis: GameAnalysis = {
                storyId: "not_saved",
                title: "An Unwritten Tale",
                trope: settings.trope!,
                quoteBanner: quoteResult.quote,
                mood: { primaryEmotion: "Serenity", confidenceScore: 0.8 },
                style: { primaryMatch: "The Silent Observer", secondaryMatch: "The Patient Chronicler" },
                famousQuote: null,
                keywords: ['Reflection', 'Silence', 'Stillness', 'Pause', 'Contemplation', 'End'],
                finalScript: "The story was left unwritten, a silent testament to a moment of quiet contemplation.",
                story: story,
            };
            setAnalysis(finalAnalysis);
            setGameState({ status: "gameover" });
            return;
        }

        const [
            titleResult,
            quoteResult,
            moodResult,
            styleResult,
            keywordsResult,
            scriptResult
        ] = await Promise.allSettled([
            generateStoryTitle({ fullStory: fullStory }),
            generateQuoteBanner({ fullStory: fullStory }),
            (gameMode === 'interactive' && userContent.trim() !== "") ? generateMoodAnalysis({ userContent }) : Promise.resolve({ primaryEmotion: "Serenity" as const, confidenceScore: 0.5 }),
            (gameMode === 'simulation' && sessionPersonas)
                ? Promise.resolve({ styleMatches: [sessionPersonas[0].name, sessionPersonas[1].name] })
                : (gameMode === 'interactive' && userContent.trim() !== "") ? generateStyleMatch({ userContent: userContent, personas: JSON.stringify(inspirationalPersonas) }) : Promise.resolve({ styleMatches: ["The Storyteller", "The Dreamer"] }),
            (gameMode === 'interactive' && userContent.trim() !== "") ? generateStoryKeywords({ userContent }) : Promise.resolve({ keywords: ['Mystery', 'Suspense', 'Hope', 'Wonder', 'Resolve'] }),
            generateFinalScript({ fullStory: story })
        ]);

        const getResult = <T, >(result: PromiseSettledResult<T>, defaultValue: T, name: string): T => {
            if (result.status === 'fulfilled') {
                return result.value;
            }
            console.error(`${name} generation failed:`, result.reason);
            toast({ variant: "destructive", title: "Analysis Step Failed", description: `Could not generate ${name.toLowerCase()}.` });
            return defaultValue;
        };

        const title = getResult(titleResult, { title: "A Story" }, "Title").title;
        const quote = getResult(quoteResult, { quote: "Every story has an end." }, "Quote").quote;
        const mood = getResult(moodResult, { primaryEmotion: "Melancholy" as const, confidenceScore: 0.5 }, "Mood");
        const style = getResult(styleResult, { styleMatches: ["The Storyteller", "The Dreamer"] }, "Style");
        const keywords = getResult(keywordsResult, { keywords: ['Mystery', 'Suspense', 'Hope', 'Wonder', 'Resolve'] }, "Keywords").keywords;
        const script = getResult(scriptResult, { finalScript: fullStory }, "Final Script").finalScript;

        const winner = style.styleMatches[0];
        const famousQuote = quotes[winner] ? { author: winner, quote: quotes[winner] } : null;

        logEvent('complete_game', { story_length: story.length, final_mood: mood.primaryEmotion });
        
        let savedStoryId = "not_saved";
        try {
            if (!user) throw new Error("User not authenticated.");

            const storyPayload = {
                title: title,
                content: script,
                creatorId: user.uid,
                mood: mood.primaryEmotion,
                styleMatch: style.styleMatches[0],
                gameMode: gameMode,
                trope: settings.trope,
            };

            const result = await saveStory(storyPayload);
            
            if (result.success && result.id) {
                savedStoryId = result.id;
            } else {
                 throw new Error(result.error || "Unknown error saving story");
            }
        } catch (e) {
            console.error("Failed to save story on game over:", e);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: (e as Error).message || "Your story could not be saved to the Hall of Fame.",
            });
        }

        const finalAnalysis: GameAnalysis = {
            storyId: savedStoryId,
            title,
            trope: settings.trope!,
            quoteBanner: quote,
            mood: {
                primaryEmotion: mood.primaryEmotion,
                confidenceScore: mood.confidenceScore,
            },
            style: {
                primaryMatch: style.styleMatches[0],
                secondaryMatch: style.styleMatches[1],
            },
            famousQuote,
            keywords,
            finalScript: script,
            story: story,
        };

        setAnalysis(finalAnalysis);
        setGameState({ status: "gameover" });
    } catch (error) {
        console.error("A critical error occurred during game end analysis:", error);
        toast({ variant: "destructive", title: "Analysis Error", description: "Could not generate the full story analysis." });
        
        logEvent('complete_game', { story_length: story.length, final_mood: 'Error' });
        setAnalysis({
            storyId: "error_state",
            title: "A Story Untold",
            trope: settings.trope || "Freeflow",
            quoteBanner: "The story ended, a universe of feeling left in its wake.",
            mood: { primaryEmotion: "Melancholy", confidenceScore: 0.7 },
            style: { primaryMatch: "The Storyteller", secondaryMatch: "The Dreamer" },
            famousQuote: null,
            keywords: ['Mystery', 'Suspense', 'Hope', 'Wonder', 'Resolve'],
            finalScript: story.map(p => p.line).join(' '),
            story: story,
        });
        setGameState({ status: "gameover" });
    }
  };


  const handleEndGame = () => {
    if (gameState.status === 'generating_summary' || gameState.status === 'gameover') return;

    logEvent('ad_impression', { ad_platform: 'google_admob', ad_source: 'admob', ad_format: 'interstitial', ad_unit_name: 'end_of_game_interstitial' });
    setAdTrigger('end_game');
    setIsAdVisible(true);
    
    proceedToAnalysis();
  };

  const handlePlayAgain = () => {
    analyticsFired.current.clear();
    setGameState({ status: "menu" });
    setStory([]);
    setSettings({ trope: null, duration: 60 });
    setComingFromOnboarding(false);
    setAnalysis(null);
    setGameMode('interactive');
    setIsAdVisible(false);
    setAdTrigger(null);
  };

  const handleQuitRequest = () => {
    logEvent('quit_game_prompted', { story_length: story.length, game_mode: gameMode });
    setIsQuitDialogOpen(true);
  };
  
  const handleConfirmQuit = () => {
    setIsQuitDialogOpen(false);
    logEvent('quit_game_confirmed', { story_length: story.length, game_mode: gameMode });
    
    logEvent('ad_impression', { ad_platform: 'google_admob', ad_source: 'admob', ad_format: 'interstitial', ad_unit_name: 'quit_game_interstitial' });
    setAdTrigger('quit');
    setIsAdVisible(true);
  };
  
  const handleCancelQuit = () => {
    setIsQuitDialogOpen(false);
  };

  const handleEmailSubmit = async (name: string, email: string) => {
    if (!analysis || analysis.storyId === 'not_saved' || analysis.storyId === 'error_state') {
        toast({ variant: "destructive", title: "Error", description: "Story has not been saved yet. Cannot email." });
        return false;
    }

    try {
        await saveSubscriberToFirestore({
            name: name,
            email: email,
            storyId: analysis.storyId,
        });

        toast({
            title: "Success!",
            description: "Your story is on its way to your inbox.",
        });

        return true;
    } catch (error) {
        console.error("Failed to save subscriber:", error);
        toast({ variant: "destructive", title: "Submission Error", description: "Could not process your request. Please try again." });
        return false;
    }
  };

  const handleShare = async () => {
    if (!analysis) return;

    const shareData = {
        title: `My Scriblox Story: "${analysis.title}"`,
        text: `I co-created a story called "${analysis.title}" on Scriblox. Here's the final script:\n\n${analysis.finalScript}`,
        url: window.location.href,
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            logEvent('request_transcript', { email_provided: false });
        } else {
            navigator.clipboard.writeText(shareData.text);
            toast({
                title: "Story Copied!",
                description: "The story has been copied to your clipboard. You can now paste it to share.",
            });
        }
    } catch (error) {
        console.error('Error sharing:', error);
        toast({
            variant: "destructive",
            title: "Sharing Error",
            description: "Could not share the story.",
        });
    }
  };


  const handleAdClosed = () => {
    setIsAdVisible(false);

    let adUnitName = '';
    let adFormat: 'interstitial' | 'rewarded' = 'interstitial';

    if (adTrigger === 'quit') {
      adUnitName = 'quit_game_interstitial';
      handlePlayAgain();
    } else if (adTrigger === 'end_game') {
      adUnitName = 'end_of_game_interstitial';
    } else if (adTrigger === 'reward') {
      adUnitName = 'reward_unlock_ad';
      adFormat = 'rewarded';
    }

    if (adUnitName) {
      logEvent('ad_closed', {
        ad_format: adFormat,
        ad_unit_name: adUnitName,
      });
    }

    setAdTrigger(null);
  };

  const handleUnlockSecret = () => {
    if (areAllStylesUnlocked && isDragonChasingUnlocked) {
        toast({ title: "You've unlocked everything!", description: "Explore the new modes and styles." });
        return;
    }

    setAdTrigger('reward');
    
    if (!isDragonChasingUnlocked) {
      logEvent('rewarded_ad_flow', { status: 'offered', unlock_target: 'dragon_chasing_mode' });
      setIsAdVisible(true);
      setTimeout(() => {
          toast({ 
              title: "Mode Unlocked!", 
              description: "You can now select the 'Dragon Chasing' mode." 
          });
          setIsDragonChasingUnlocked(true);
          logEvent('rewarded_ad_flow', { status: 'completed', unlock_target: 'dragon_chasing_mode' });
      }, 500);
      return;
    }

    if (!areAllStylesUnlocked) {
        logEvent('rewarded_ad_flow', { status: 'offered', unlock_target: 'final_styles' });
        setIsAdVisible(true);
        setTimeout(() => {
            toast({ 
                title: "Styles Unlocked!", 
                description: "You can now select 'Gothic Romance' and 'Freeflow'." 
            });
            setAreAllStylesUnlocked(true);
            logEvent('rewarded_ad_flow', { status: 'completed', unlock_target: 'final_styles' });
        }, 500);
    }
  }


  const showFooter = !(
    gameState.status === 'playing' ||
    gameState.status === 'generating_initial_story'
  );
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
        {areAdsEnabled && (
            <>
                <Script 
                  async 
                  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
                  crossOrigin="anonymous" 
                  strategy="afterInteractive"
                ></Script>
                <Script id="google-analytics" strategy="afterInteractive">
                  {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-7JK1BH6Y8R');
                  `}
                </Script>
            </>
        )}
      <main className="flex-grow flex flex-col relative">
        <AnimatePresence mode="wait">
            {gameState.status === "loading_screen" && <LoadingScreen key="loading" />}
            {gameState.status === "onboarding" && <OnboardingModal key="onboarding" onComplete={handleOnboardingComplete} />}
            {gameState.status === "menu" && (
              <MainMenu 
                key="menu" 
                onStartGame={handleStartGame} 
                onStartSimulation={handleStartSimulation} 
                comingFromOnboarding={comingFromOnboarding}
                isDragonChasingUnlocked={isDragonChasingUnlocked}
                areAllStylesUnlocked={areAllStylesUnlocked}
                onUnlockSecret={handleUnlockSecret}
              />
            )}
            {(gameState.status === "generating_initial_story" && settings.trope) && (
              <LoadingScreen
                key="generating_initial"
                trope={settings.trope}
                duration={settings.duration}
              />
            )}
            {(gameState.status === "playing" && settings.trope) && (
              <GameScreen
                key="playing"
                trope={settings.trope}
                story={story}
                duration={settings.duration}
                isAiTyping={isAiTyping}
                onUserSubmit={handleUserSubmit}
                onEndGame={handleEndGame}
                onQuitRequest={handleQuitRequest}
                gameMode={gameMode}
                nextSpeakerInSim={nextSpeaker}
                inputRef={inputRef}
                turnTimer={turnTimerRef.current}
              />
            )}
            {gameState.status === "generating_summary" && <LoadingScreen key="generating" />}
            {gameState.status === "gameover" && analysis && (
              <GameOverScreen 
                key="gameover" 
                analysis={analysis} 
                onPlayAgain={handlePlayAgain}
                onEmailSubmit={handleEmailSubmit}
                onShare={handleShare}
              />
            )}
        </AnimatePresence>
         <AdOverlay isVisible={isAdVisible} onClose={handleAdClosed} />
      </main>
      
      {showFooter && <AppFooter />}

      <AlertDialog open={isQuitDialogOpen} onOpenChange={setIsQuitDialogOpen}>
        <AlertDialogContent className="glassmorphism">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to quit?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelQuit}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmQuit}>Quit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
