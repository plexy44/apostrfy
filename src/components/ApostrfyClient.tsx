/**
 * @fileoverview This is the main client-side component for Apostrfy.
 * It acts as the central state machine for the entire application, managing the
 * overall game state (loading, onboarding, menu, playing, gameover), user settings,
 * story progression, and interactions with the Genkit AI flows for content generation.
 */

"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import type { GameState, StoryPart, Trope, Persona, TropePersonaKey, InspirationalPersonas } from "@/lib/types";
import { generateStoryContent, GenerateStoryContentInput } from "@/ai/flows/generate-story-content";
import { generateSentimentSnapshot } from "@/ai/flows/generate-sentiment-snapshot";
import LoadingScreen from "@/components/app/LoadingScreen";
import OnboardingModal from "@/components/app/OnboardingModal";
import MainMenu from "@/components/app/MainMenu";
import GameScreen from "@/components/app/GameScreen";
import GameOverScreen from "@/components/app/GameOverScreen";
import AppFooter from "@/components/app/AppFooter";
import { Button } from "@/components/ui/button";
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
import { usePastStories } from "@/hooks/usePastStories";
import personasData from "@/lib/personas.json";
const { inspirationalPersonas } = personasData as { inspirationalPersonas: InspirationalPersonas };


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
  const [settings, setSettings] = useState<{ trope: Trope | null; duration: number }>({ trope: null, duration: 5 });
  const [story, setStory] = useState<StoryPart[]>([]);
  const [sentiment, setSentiment] = useState<{ snapshot: string; emotions: string[] }>({ snapshot: "", emotions: [] });
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [comingFromOnboarding, setComingFromOnboarding] = useState(false);
  const [quitDialogState, setQuitDialogState] = useState<'closed' | 'confirm_quit' | 'confirm_save'>('closed');
  const [sessionPersonas, setSessionPersonas] = useState<[Persona, Persona] | null>(null);
  const [loadingPersonaText, setLoadingPersonaText] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveStory } = usePastStories();


  useEffect(() => {
    if (isFirstVisit === undefined) return;
    if (isFirstVisit) {
      setGameState({ status: 'onboarding', step: 1 });
    } else {
      setGameState({ status: 'menu' });
    }
  }, [isFirstVisit]);

  const handleOnboardingComplete = () => {
    setHasVisited();
    setComingFromOnboarding(true);
    setGameState({ status: "menu" });
  };

  const handleStartGame = async (trope: Trope, duration: number) => {
    setSettings({ trope, duration });
    setStory([]);
    setComingFromOnboarding(false);

    const personaKey = getPersonaKey(trope);
    const personaList = inspirationalPersonas[personaKey];
    
    const loadingPersona = personaList[Math.floor(Math.random() * personaList.length)];
    setLoadingPersonaText(`Conjuring the spirit of ${loadingPersona.name}...`);

    const uniquePersonas = [...personaList].sort(() => 0.5 - Math.random()).slice(0, 2) as [Persona, Persona];
    setSessionPersonas(uniquePersonas);

    setGameState({ status: "generating_initial_story" });

    try {
      const input: GenerateStoryContentInput = {
        trope,
        duration,
        userInput: "Start the story.",
        history: [],
        persona1: uniquePersonas[0],
        persona2: uniquePersonas[1],
      };
      const result = await generateStoryContent(input);
      setStory([{ speaker: "ai", line: result.aiResponse }]);
      setGameState({ status: "playing" });
    } catch (error) {
      console.error("Failed to start story:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not start the story. Please try again." });
      setGameState({ status: "menu" });
    }
  };

  const handleUserSubmit = async (userInput: string) => {
    if (!settings.trope || !sessionPersonas) return;
    const newStory = [...story, { speaker: "user", line: userInput }] as StoryPart[];
    setStory(newStory);
    setIsAiTyping(true);

    try {
      const input: GenerateStoryContentInput = {
        trope: settings.trope,
        duration: settings.duration,
        userInput,
        history: newStory.map(s => ({ speaker: s.speaker, line: s.line })),
        persona1: sessionPersonas[0],
        persona2: sessionPersonas[1],
      };
      const result = await generateStoryContent(input);
      setStory(prev => [...prev, { speaker: "ai", line: result.aiResponse }]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not get AI response. Please continue the story." });
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleEndGame = async () => {
    setGameState({ status: "generating_summary" });
    try {
      const transcript = story.map(s => `${s.speaker}: ${s.line}`).join("\n");
      const result = await generateSentimentSnapshot({ transcript });
      
      const emotions = ['Mystery', 'Suspense', 'Hope', 'Melancholy', 'Wonder', 'Resolve'];
      setSentiment({ snapshot: result.sentimentSnapshot, emotions: emotions.sort(() => 0.5 - Math.random()).slice(0, 6) });
      setGameState({ status: "gameover" });
    } catch (error) {
      console.error("Failed to generate sentiment snapshot:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not generate story summary. Please try again." });
      setSentiment({ snapshot: "The story ended, a universe of feeling left in its wake.", emotions: ['Mystery', 'Suspense', 'Hope', 'Melancholy', 'Wonder', 'Resolve'] });
      setGameState({ status: "gameover" });
    }
  };

  const handlePlayAgain = () => {
    setGameState({ status: "menu" });
    setStory([]);
    setSettings({ trope: null, duration: 5 });
    setComingFromOnboarding(false);
  };

  const handleQuitRequest = () => {
    setQuitDialogState('confirm_quit');
  };

  const handleConfirmQuit = () => {
    if (story.length < 2) {
      handlePlayAgain();
      setQuitDialogState('closed');
    } else {
      setQuitDialogState('confirm_save');
    }
  };

  const handleSaveAndQuit = () => {
    if (settings.trope) {
      saveStory({
        trope: settings.trope,
        duration: settings.duration,
        story: story,
      });
      toast({ title: "Story Saved", description: "Your story has been saved." });
    }
    handlePlayAgain();
    setQuitDialogState('closed');
  };

  const handleQuitWithoutSaving = () => {
    handlePlayAgain();
    setQuitDialogState('closed');
  };
  
  const handleCancelQuit = () => {
    setQuitDialogState('closed');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="flex-grow flex items-center justify-center p-4 relative">
        <AnimatePresence mode="wait">
            {gameState.status === "loading_screen" && <LoadingScreen key="loading"/>}
            {gameState.status === "onboarding" && <OnboardingModal key="onboarding" onComplete={handleOnboardingComplete} />}
            {gameState.status === "menu" && <MainMenu key="menu" onStartGame={handleStartGame} comingFromOnboarding={comingFromOnboarding} />}
            {gameState.status === "generating_initial_story" && <LoadingScreen key="generating_initial" text={loadingPersonaText || "..."} />}
            {gameState.status === "playing" && (
              <GameScreen
                key="playing"
                story={story}
                duration={settings.duration}
                isAiTyping={isAiTyping}
                onUserSubmit={handleUserSubmit}
                onEndGame={handleEndGame}
                onQuitRequest={handleQuitRequest}
              />
            )}
            {gameState.status === "generating_summary" && <LoadingScreen key="generating" text="The words are settling..." />}
            {gameState.status === "gameover" && <GameOverScreen key="gameover" story={story} sentiment={sentiment} onPlayAgain={handlePlayAgain} />}
        </AnimatePresence>
      </div>
      {gameState.status !== "playing" && gameState.status !== 'generating_summary' && gameState.status !== 'generating_initial_story' && <AppFooter />}

      <AlertDialog open={quitDialogState === 'confirm_quit'} onOpenChange={(open) => !open && handleCancelQuit()}>
        <AlertDialogContent className="glassmorphism">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to quit?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress in the current story will not be saved automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelQuit}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmQuit}>Quit Game</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={quitDialogState === 'confirm_save'} onOpenChange={(open) => !open && handleCancelQuit()}>
        <AlertDialogContent className="glassmorphism">
          <AlertDialogHeader>
            <AlertDialogTitle>Save this story?</AlertDialogTitle>
            <AlertDialogDescription>
              You can store up to 5 stories to view later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <Button variant="ghost" onClick={handleCancelQuit}>Cancel</Button>
            <Button variant="outline" onClick={handleQuitWithoutSaving}>Quit Without Saving</Button>
            <Button onClick={handleSaveAndQuit}>Save and Quit</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
