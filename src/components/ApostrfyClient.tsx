"use client";

import { useState } from "react";
import type { GameState, StoryPart, Trope } from "@/lib/types";
import { generateStoryContent, GenerateStoryContentInput } from "@/ai/flows/generate-story-content";
import { generateSentimentSnapshot } from "@/ai/flows/generate-sentiment-snapshot";
import LoadingScreen from "@/components/app/LoadingScreen";
import OnboardingModal from "@/components/app/OnboardingModal";
import MainMenu from "@/components/app/MainMenu";
import GameScreen from "@/components/app/GameScreen";
import GameOverScreen from "@/components/app/GameOverScreen";
import AppFooter from "@/components/app/AppFooter";
import { useToast } from "@/hooks/use-toast";

export default function ApostrfyClient() {
  const [gameState, setGameState] = useState<GameState>({ status: "onboarding", step: 1 });
  const [settings, setSettings] = useState<{ trope: Trope | null; duration: number }>({ trope: null, duration: 5 });
  const [story, setStory] = useState<StoryPart[]>([]);
  const [sentiment, setSentiment] = useState<{ snapshot: string; emotions: string[] }>({ snapshot: "", emotions: [] });
  const [isAiTyping, setIsAiTyping] = useState(false);
  const { toast } = useToast();

  const handleOnboardingComplete = () => {
    setGameState({ status: "menu" });
  };

  const handleStartGame = async (trope: Trope, duration: number) => {
    setSettings({ trope, duration });
    setStory([]);
    setGameState({ status: "playing" });
    setIsAiTyping(true);

    try {
      const input: GenerateStoryContentInput = {
        trope,
        duration,
        userInput: "Start the story.",
        history: [],
      };
      const result = await generateStoryContent(input);
      setStory([{ speaker: "ai", line: result.aiResponse }]);
    } catch (error) {
      console.error("Failed to start story:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not start the story. Please try again." });
      setGameState({ status: "menu" });
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleUserSubmit = async (userInput: string) => {
    if (!settings.trope) return;
    const newStory = [...story, { speaker: "user", line: userInput }] as StoryPart[];
    setStory(newStory);
    setIsAiTyping(true);

    try {
      const input: GenerateStoryContentInput = {
        trope: settings.trope,
        duration: settings.duration,
        userInput,
        history: newStory.map(s => ({ speaker: s.speaker, line: s.line })),
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
    setSettings({ trope: null, duration: 5 });
  };
  
  const renderContent = () => {
    switch (gameState.status) {
      case "onboarding":
        return <OnboardingModal step={gameState.step} onComplete={handleOnboardingComplete} />;
      case "menu":
        return <MainMenu onStartGame={handleStartGame} />;
      case "playing":
        return (
          <GameScreen
            story={story}
            duration={settings.duration}
            isAiTyping={isAiTyping}
            onUserSubmit={handleUserSubmit}
            onEndGame={handleEndGame}
          />
        );
      case "generating_summary":
        return <LoadingScreen text="The words are settling..." />;
      case "gameover":
        return <GameOverScreen story={story} sentiment={sentiment} onPlayAgain={handlePlayAgain} />;
      default:
        return <MainMenu onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="flex-grow flex items-center justify-center p-4 relative">
        {renderContent()}
      </div>
      {gameState.status !== "playing" && gameState.status !== 'generating_summary' && <AppFooter />}
    </div>
  );
}
