/**
 * @fileoverview This component renders the main interface for story creation.
 * It is structured into three distinct, non-overlapping sections: a fixed header
 * displaying the timer and game context, a central scrollable area for the story
 * transcript, and a fixed footer containing the user input form. The component
 * adapts for both 'interactive' mode, where the user can submit text, and
 * 'simulation' mode, where input is disabled. It can also be paused for ads.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import type { StoryPart, Trope } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader, ArrowLeft, Timer, Hourglass } from "lucide-react";
import Orb from "./Orb";
import { cn } from "@/lib/utils";
import { logEvent } from "@/lib/analytics";

interface GameScreenProps {
  trope: Trope;
  story: StoryPart[];
  duration: number; // Duration is in seconds
  isAiTyping: boolean;
  onUserSubmit: (input: string, turnTime: number) => void;
  onEndGame: () => void;
  onQuitRequest: () => void;
  gameMode: 'interactive' | 'simulation';
  onPauseForAd: () => void;
  isAdPaused: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

const TimerBar = ({ durationInSeconds, onEndGame, onPauseForAd, isPaused, className }: { durationInSeconds: number; onEndGame: () => void, onPauseForAd: () => void; isPaused: boolean; className?: string }) => {
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    if (timeLeft <= 0) {
      onEndGame();
      return;
    }
    
    // Mid-game ad logic for "Twice a minute" (120s) mode
    if (durationInSeconds === 120 && timeLeft === 60) {
        onPauseForAd();
        return; // Pause the timer until the ad is closed
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onEndGame, isPaused, durationInSeconds, onPauseForAd]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const percentage = (timeLeft / durationInSeconds) * 100;
  const isUrgent = timeLeft <= 20;

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className={cn("flex justify-between items-center text-xs font-mono text-muted-foreground", isUrgent && "text-destructive animate-pulse font-semibold")}>
        <div className="flex items-center gap-1.5">
          <Hourglass className="h-3 w-3" />
          <span>{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Timer className="h-3 w-3" />
          <span>{formatTime(durationInSeconds)}</span>
        </div>
      </div>
      <div className="w-full h-2 md:h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${percentage}%`,
            background: isUrgent
              ? 'hsl(var(--destructive))'
              : `linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))`,
          }}
        />
      </div>
    </div>
  );
};

export default function GameScreen({ trope, story, duration, isAiTyping, onUserSubmit, onEndGame, onQuitRequest, gameMode, onPauseForAd, isAdPaused, inputRef }: GameScreenProps) {
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const turnTimerRef = useRef<number>(Date.now());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [story]);

  // Effect to focus the input when it's the user's turn
  useEffect(() => {
    if (!isAiTyping && gameMode === 'interactive' && !isAdPaused) {
      inputRef.current?.focus();
    }
  }, [isAiTyping, gameMode, isAdPaused, inputRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isAiTyping) {
      const turnTime = (Date.now() - turnTimerRef.current) / 1000;
      onUserSubmit(userInput.trim(), turnTime);
      setUserInput("");
      turnTimerRef.current = Date.now();
    }
  };

  const isTimerPaused = isAdPaused || (gameMode === 'interactive' && isAiTyping);

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full md:h-[90vh] w-full max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Game Panel */}
      <div className="flex flex-col h-full w-full flex-grow p-2 md:p-4 glassmorphism rounded-lg relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 -left-12 md:top-4 md:-left-16 z-20 rounded-full"
          onClick={onQuitRequest}
          aria-label="Quit game"
          disabled={isTimerPaused}
        >
          <ArrowLeft />
        </Button>
        
        <div className="flex items-start gap-4 mb-2 md:mb-4">
            <div className="flex-grow">
                <h3 className="font-headline text-base md:text-lg text-foreground mb-1">{trope}</h3>
                <TimerBar 
                    durationInSeconds={duration} 
                    onEndGame={onEndGame} 
                    onPauseForAd={onPauseForAd} 
                    isPaused={isTimerPaused}
                />
            </div>
            <Orb size="tiny" isInteractive={true} className="flex-shrink-0" />
        </div>
        
        <ScrollArea className="flex-grow pr-2 md:pr-4">
          <div className="space-y-4 md:space-y-6">
            {story.map((part, index) => (
              <div key={index} className={`flex flex-col animate-fade-in-up ${part.speaker === 'ai' ? 'items-start' : 'items-end'}`}>
                 {part.personaName && (
                  <p className={`text-xs text-muted-foreground mb-1 px-2 ${part.speaker === 'user' ? 'self-end' : 'self-start'}`}>
                    {part.personaName}
                  </p>
                )}
                <div className={`p-3 md:p-4 rounded-xl max-w-[85%] ${part.speaker === 'ai' ? 'bg-secondary rounded-bl-none' : 'bg-primary/90 text-primary-foreground rounded-br-none'}`}>
                  <p className="text-sm md:text-base">{part.line}</p>
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex items-start">
                 <div className="p-3 md:p-4 rounded-xl max-w-[85%] bg-secondary rounded-bl-none flex items-center space-x-2">
                   <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                   <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 md:pt-4">
          <Input
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isTimerPaused ? "AI is thinking..." : gameMode === 'simulation' ? "Simulation in progress..." : "Continue the story..."}
            disabled={isTimerPaused || gameMode === 'simulation'}
            className="flex-grow h-11 md:h-12 text-sm md:text-base"
          />
          <Button type="submit" size="icon" className="h-11 w-11 md:h-12 md:w-12" disabled={isTimerPaused || !userInput.trim() || gameMode === 'simulation'}>
            {isAiTyping ? <Loader className="animate-spin" /> : <Send />}
          </Button>
        </form>
        <div className="text-center py-2">
          <Button onClick={onEndGame} variant="outline" size="sm" disabled={isTimerPaused}>Test End Game</Button>
        </div>
      </div>

    </motion.div>
  );
}
