/**
 * @fileoverview Renders the primary game interface. This component supports
 * both interactive user input and automated simulation modes. The layout
 * consists of a static header and footer with a central, internally scrollable
 * area for the story transcript.
 */
"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import type { StoryPart, Trope } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader, Timer, Hourglass, X } from "lucide-react";
import Orb from "./Orb";

interface GameScreenProps {
  trope: Trope;
  story: StoryPart[];
  duration: number; // in seconds
  isAiTyping: boolean;
  onUserSubmit: (userInput: string, turnTime: number) => void;
  onEndGame: () => void;
  onQuitRequest: () => void;
  gameMode: 'interactive' | 'simulation';
  onPauseForAd: () => void;
  isAdPaused: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}


const TimerBar = ({ durationInSeconds, onEndGame, onPauseForAd, isPaused }: { durationInSeconds: number; onEndGame: () => void, onPauseForAd: () => void; isPaused: boolean; }) => {
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
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs md:text-sm font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Hourglass className="h-3 w-3 md:h-4 md:w-4" />
          <span>{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Timer className="h-3 w-3 md:h-4 md:w-4" />
          <span>{formatTime(durationInSeconds)}</span>
        </div>
      </div>
      <div className="w-full h-1.5 md:h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${percentage}%`,
            background: isUrgent
              ? 'hsl(var(--destructive))'
              : `hsl(var(--accent))`,
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

  const isTimerPaused = isAdPaused || (isAiTyping && gameMode === 'interactive');

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
        {/* Header */}
        <header className="flex-shrink-0 p-4 border-b border-border/20 flex items-center gap-4">
           <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onQuitRequest}
            aria-label="Quit game"
            disabled={isTimerPaused}
          >
             <X className="h-4 w-4" />
          </Button>
          <div className="flex-grow">
            <h3 className="font-headline text-lg md:text-xl text-foreground">{trope}</h3>
            <TimerBar 
                durationInSeconds={duration} 
                onEndGame={onEndGame} 
                onPauseForAd={onPauseForAd} 
                isPaused={isTimerPaused}
            />
          </div>
          <Orb size="tiny" isInteractive={true} />
        </header>
        
        {/* Story/Chat Area */}
        <main className="flex-grow min-h-0 overflow-y-auto">
          <div className="p-4 space-y-6 max-w-2xl mx-auto">
              {story.map((part, index) => {
                  const isUserSpeaker = part.speaker === 'user';
                  let alignment, bubbleStyles;

                  alignment = isUserSpeaker ? 'items-end' : 'items-start';
                  bubbleStyles = isUserSpeaker
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-secondary rounded-bl-none';

                  return (
                    <div key={index} className={`flex flex-col animate-fade-in-up ${alignment}`}>
                      {part.personaName && (
                        <p className={`text-xs md:text-sm text-muted-foreground mb-1 px-2 ${alignment === 'items-end' ? 'self-end' : 'self-start'}`}>
                          {part.personaName}
                        </p>
                      )}
                      <div className={`p-3 rounded-lg max-w-[85%] shadow-md ${bubbleStyles}`}>
                        <p className="text-sm md:text-base">{part.line}</p>
                      </div>
                    </div>
                  );
              })}
              {isAiTyping && (
                <div className="flex items-start">
                   <div className="p-3 rounded-lg max-w-[85%] bg-secondary rounded-bl-none flex items-center space-x-2 shadow-md">
                     <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                     <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                     <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
          </div>
        </main>
        {/* Footer/Input */}
        <footer className="flex-shrink-0 p-4 border-t border-border/20">
          <div className="flex flex-col gap-2 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={isAiTyping ? "AI is thinking..." : gameMode === 'simulation' ? "Simulation in progress..." : "Continue the story..."}
                disabled={isTimerPaused || gameMode === 'simulation'}
                className="flex-grow h-11 md:h-12 text-sm md:text-base bg-background/50"
              />
              <Button type="submit" size="icon" className="h-11 w-11 md:h-12 md:w-12 flex-shrink-0" disabled={isAiTyping || !userInput.trim() || gameMode === 'simulation'}>
                {isAiTyping ? <Loader className="animate-spin" /> : <Send />}
              </Button>
            </form>
            <Button onClick={onEndGame} variant="outline" size="sm" disabled={isTimerPaused} className="w-full mt-1 md:h-10 md:text-base">
                  End Game
            </Button>
          </div>
        </footer>
    </motion.div>
  );
}
