/**
 * @fileoverview Main client component for Apostrfy. Manages the application's
 * state machine, handling transitions between game states like loading, menu,
 * playing, and game over. It orchestrates user settings, story progression, and
 * interactions with Genkit AI flows for both 'interactive' and 'simulation'
 * modes.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import type { GameState, StoryPart, Trope, Persona, TropePersonaKey, InspirationalPersonas, GameAnalysis } from "@/lib/types";
import { generateStoryContent, GenerateStoryContentInput } from "@/ai/flows/generate-story-content";
import { generateSimulationContent, GenerateSimulationContentInput } from "@/ai/flows/generate-simulation-content";
import { generateQuoteBanner } from "@/ai/flows/generate-quote-banner";
import { generateMoodAnalysis } from "@/ai/flows/generate-mood-analysis";
import { generateStyleMatch } from "@/ai/flows/generate-style-match";
import { generateStoryKeywords } from "@/ai/flows/generate-story-keywords";
import { generateFinalScript } from "@/ai/flows/generate-final-script";
import { generateStoryTitle } from "@/ai/flows/generate-story-title";

import LoadingScreen from "@/components/app/LoadingScreen";
import OnboardingModal from "@/components/app/OnboardingModal";
import MainMenu from "@/components/app/MainMenu";
import GameScreen from "@/components/app/GameScreen";
import GameOverScreen from "@/components/app/GameOverScreen";
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
import { logEvent } from "@/lib/analytics";
import { saveStoryToFirestore, saveSubscriberToFirestore } from "@/lib/firestore";

const { inspirationalPersonas } = personasData as { inspirationalPersonas: InspirationalPersonas };
const quotes = famousQuotesData as Record<string, string>;

type AdTrigger = 'quit' | 'end_game' | 'reward' | 'mid_game' | null;


const getPersonaKey = (trope: Trope): TropePersonaKey => {
  const map: Record<Trope, TropePersonaKey> = {
    'Noir Detective': 'noirDetective',
    'Cosmic Wanderer': 'cosmicWanderer',
    'Gothic Romance': 'gothicRomance',
    'Freeflow': 'freeflow',
  };
  return map[trope];
};

export default function ApostrfyClient() {
  const { isFirstVisit, setHasVisited } = useIsFirstVisit();
  const [gameState, setGameState] = useState<GameState>({ status: "loading_screen" });
  const [gameMode, setGameMode] = useState<'interactive' | 'simulation'>('interactive');
  const [settings, setSettings] = useState<{ trope: Trope | null; duration: number }>({ trope: null, duration: 60 });
  const [story, setStory] = useState<StoryPart[]>([]);
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [comingFromOnboarding, setComingFromOnboarding] = useState(false);
  const [isQuitDialogOpen, setIsQuitDialogOpen] = useState(false);
  const [sessionPersonas, setSessionPersonas] = useState<[Persona, Persona] | null>(null);
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [adTrigger, setAdTrigger] = useState<AdTrigger>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const analyticsFired = useRef(new Set<string>());

  useEffect(() => {
    let screenName: string;
    switch (gameState.status) {
      case 'loading_screen':
        screenName = 'loading_screen';
        break;
      case 'onboarding':
        screenName = 'onboarding';
        break;
      case 'menu':
        screenName = 'main_menu';
        break;
      case 'playing':
      case 'generating_initial_story':
        screenName = 'game_screen';
        break;
      case 'gameover':
      case 'generating_summary':
        screenName = 'analysis_screen';
        break;
      default:
        return; // Don't log for intermediate or unknown states
    }
    
    if (screenName && !analyticsFired.current.has(screenName)) {
      logEvent('screen_view', { screen_name: screenName as any });
      analyticsFired.current.add(screenName);
    }
  }, [gameState.status]);

  useEffect(() => {
    if (isFirstVisit === undefined) {
      return; 
    }
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

  const handleStartGame = async (trope: Trope, duration: number, analyticsName: 'lightning' | 'minute' | 'twice_a_minute') => {
    logEvent('start_game', { game_mode: 'interactive', game_duration: analyticsName });
    setGameMode('interactive');
    setSettings({ trope, duration });
    setStory([]);
    setComingFromOnboarding(false);

    const personaKey = getPersonaKey(trope);
    const personaList = inspirationalPersonas[personaKey];
    
    const uniquePersonas = [...personaList].sort(() => 0.5 - Math.random()).slice(0, 2) as [Persona, Persona];
    setSessionPersonas(uniquePersonas);

    setGameState({ status: "generating_initial_story" });

    try {
      const aiStartTime = Date.now();
      const input: GenerateStoryContentInput = {
        trope,
        duration: duration / 60, 
        userInput: "Start the story.",
        history: [],
        persona1: uniquePersonas[0],
        persona2: uniquePersonas[1],
      };
      const result = await generateStoryContent(input);
      const aiEndTime = Date.now();
      logEvent('ai_turn_generated', { generation_time_ms: aiEndTime - aiStartTime, persona_1: uniquePersonas[0].name, persona_2: uniquePersonas[1].name });
      setStory([{ speaker: "ai", line: result.aiResponse }]);
      setGameState({ status: "playing" });
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

    const personaKey = getPersonaKey(trope);
    const personaList = inspirationalPersonas[personaKey];
    
    const uniquePersonas = [...personaList].sort(() => 0.5 - Math.random()).slice(0, 2) as [Persona, Persona];
    setSessionPersonas(uniquePersonas);

    setGameState({ status: "generating_initial_story" });

    try {
      const aiStartTime = Date.now();
      const input: GenerateSimulationContentInput = {
        trope,
        history: [],
        personaToEmbody: uniquePersonas[0],
        otherPersona: uniquePersonas[1],
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

      setIsAiTyping(true);
      try {
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
    
    const timeoutId = setTimeout(runSimulationTurn, 1500); 
    return () => clearTimeout(timeoutId);

  }, [story, gameMode, gameState.status, sessionPersonas, settings.trope, isAiTyping, isAdVisible]);


  const handleUserSubmit = async (userInput: string, turnTime: number) => {
    if (!settings.trope || !sessionPersonas || gameMode === 'simulation' || isAdVisible) return;

    logEvent('user_turn_taken', { turn_time_seconds: Math.round(turnTime), word_count: userInput.split(' ').length });
    
    const newStory = [...story, { speaker: "user", line: userInput }] as StoryPart[];
    setStory(newStory);
    setIsAiTyping(true);

    try {
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
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not get AI response. Please continue the story." });
    } finally {
      setIsAiTyping(false);
    }
  };

  const proceedToAnalysis = async () => {
    if (gameState.status === 'generating_summary' || gameState.status === 'gameover') return;

    setGameState({ status: "generating_summary" });
    
    try {
        const fullStory = story.map(part => `${part.personaName || part.speaker.toUpperCase()}: ${part.line}`).join('\n');
        let fullStoryRaw = story.map(p => p.line).join('\n');
        const analysisContent = story.filter(part => part.speaker === "user").map(part => part.line).join("\n");

        if (gameMode === 'interactive' && analysisContent.trim() === "") {
            fullStoryRaw = "The story was left unwritten, a silent testament to a moment of quiet contemplation."
            logEvent('complete_game', { story_length: story.length, final_mood: 'N/A' });
             const quoteResult = await generateQuoteBanner({ fullStory: fullStoryRaw });
            const finalAnalysis: GameAnalysis = {
                storyId: "not_saved",
                title: "An Unwritten Tale",
                trope: settings.trope!,
                quoteBanner: quoteResult.quote,
                mood: { primaryEmotion: "Serenity", confidenceScore: 0.8 },
                style: { primaryMatch: "The Silent Observer", secondaryMatch: "The Patient Chronicler" },
                famousQuote: null,
                keywords: ['Reflection', 'Silence', 'Stillness', 'Pause', 'Contemplation', 'End'],
                finalScript: "The page is blank. The story was not written.",
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
            generateStoryTitle({ fullStory: fullStoryRaw }),
            generateQuoteBanner({ fullStory: fullStoryRaw }),
            generateMoodAnalysis({ userContent: analysisContent }),
            (gameMode === 'simulation' && sessionPersonas)
                ? Promise.resolve({ styleMatches: [sessionPersonas[0].name, sessionPersonas[1].name] })
                : generateStyleMatch({ userContent: analysisContent, personas: JSON.stringify(inspirationalPersonas) }),
            generateStoryKeywords({ userContent: analysisContent }),
            generateFinalScript({ fullStory })
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
        const finalScript = getResult(scriptResult, { finalScript: fullStoryRaw }, "Script").finalScript;

        const winner = style.styleMatches[0];
        const famousQuote = quotes[winner] ? { author: winner, quote: quotes[winner] } : null;

        logEvent('complete_game', { story_length: story.length, final_mood: mood.primaryEmotion });
        
        const finalAnalysis: GameAnalysis = {
            storyId: "not_saved", // The story is not saved by default
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
            finalScript,
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
            finalScript: story.map(part => part.line).join('\n\n'),
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
    
    // Start analysis in the background while ad is showing
    proceedToAnalysis();
  };

  const handlePauseForAd = () => {
    logEvent('ad_impression', { ad_platform: 'google_admob', ad_source: 'admob', ad_format: 'interstitial', ad_unit_name: 'mid_game_interstitial' });
    setAdTrigger('mid_game');
    setIsAdVisible(true);
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

  const handleEmailSubmit = async (email: string) => {
    if (!analysis) {
        toast({ variant: "destructive", title: "Error", description: "No analysis data available to email." });
        return false;
    }
    logEvent('request_transcript', { email_provided: true });

    try {
        const sanitizedStory = analysis.story.map(part => ({
          speaker: part.speaker,
          line: part.line,
          personaName: part.personaName || null, 
        }));

        const sanitizedAnalysis = {
            ...analysis,
            story: sanitizedStory,
            famousQuote: analysis.famousQuote || null,
        };

        const storyId = await saveStoryToFirestore({
            transcript: sanitizedAnalysis.story,
            analysis: sanitizedAnalysis, 
            trope: sanitizedAnalysis.trope,
            title: sanitizedAnalysis.title,
        });

        await saveSubscriberToFirestore({
            email: email,
            storyId: storyId,
        });

        toast({
            title: "Success!",
            description: "Your story is on its way to your inbox.",
        });

        setAnalysis(prev => prev ? { ...prev, storyId } : null);

        return true;
    } catch (error) {
        console.error("Failed to save or send story:", error);
        toast({ variant: "destructive", title: "Submission Error", description: "Could not process your request. Please try again." });
        return false;
    }
  };

  const handleAdClosed = () => {
    setIsAdVisible(false);
    if (adTrigger === 'quit') {
      handlePlayAgain();
    } else if (adTrigger === 'end_game') {
      // The analysis is already running; the gameover state will be set when it's done.
    } else if (adTrigger === 'reward') {
      // The reward logic is handled in MainMenu now.
    }
    // 'mid_game' and 'reward' ad triggers are self-contained and don't need further action here.
    setAdTrigger(null);
  };

  const handleRequestAd = (source: 'reward') => {
    let adUnitName: 'unlock_secret_style_reward';
    switch (source) {
        case 'reward':
            adUnitName = 'unlock_secret_style_reward';
            break;
    }
    logEvent('ad_impression', { ad_platform: 'google_admob', ad_source: 'admob', ad_format: 'rewarded', ad_unit_name: adUnitName });
    setAdTrigger(source);
    setIsAdVisible(true);
  }
  
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <main className="flex-grow flex flex-col relative">
        <AnimatePresence mode="wait">
            {gameState.status === "loading_screen" && <LoadingScreen key="loading"/>}
            {gameState.status === "onboarding" && <OnboardingModal key="onboarding" onComplete={handleOnboardingComplete} />}
            {gameState.status === "menu" && (
              <MainMenu 
                key="menu" 
                onStartGame={handleStartGame} 
                onStartSimulation={handleStartSimulation} 
                comingFromOnboarding={comingFromOnboarding}
                onRequestAd={() => handleRequestAd('reward')}
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
                onPauseForAd={handlePauseForAd}
                isAdPaused={isAdVisible && adTrigger === 'mid_game'}
                inputRef={inputRef}
              />
            )}
            {gameState.status === "generating_summary" && <LoadingScreen key="generating" />}
            {gameState.status === "gameover" && analysis && (
              <GameOverScreen 
                key="gameover" 
                analysis={analysis} 
                onPlayAgain={handlePlayAgain}
                onEmailSubmit={handleEmailSubmit}
              />
            )}
        </AnimatePresence>
         <AdOverlay isVisible={isAdVisible} onClose={handleAdClosed} />
      </main>
      
      {gameState.status !== 'loading_screen' && gameState.status !== 'generating_initial_story' && <AppFooter />}

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
