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
import { Send, Loader, Timer, Hourglass, ArrowLeft } from "lucide-react";
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
      <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Hourglass className="h-3 w-3" />
          <span>{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Timer className="h-3 w-3" />
          <span>{formatTime(durationInSeconds)}</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
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
      className="flex flex-col h-full w-full max-w-2xl mx-auto p-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="flex flex-col h-full w-full bg-secondary/20 rounded-lg border border-border/20 shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border/20 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onQuitRequest}
            aria-label="Quit game"
            disabled={isTimerPaused}
          >
            <ArrowLeft />
          </Button>
          <div className="flex-grow">
            <h3 className="font-headline text-lg text-foreground">{trope}</h3>
            <TimerBar 
                durationInSeconds={duration} 
                onEndGame={onEndGame} 
                onPauseForAd={onPauseForAd} 
                isPaused={isTimerPaused}
            />
          </div>
          <Orb size="tiny" isInteractive={false} />
        </div>
        
        {/* Story/Chat Area */}
        <ScrollArea className="flex-grow bg-transparent min-h-0">
          <div className="p-4 space-y-6">
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
                        <p className={`text-xs text-muted-foreground mb-1 px-2 ${alignment === 'items-end' ? 'self-end' : 'self-start'}`}>
                          {part.personaName}
                        </p>
                      )}
                      <div className={`p-3 rounded-lg max-w-[85%] shadow-md ${bubbleStyles}`}>
                        <p className="text-sm">{part.line}</p>
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
        </ScrollArea>

        {/* Footer/Input */}
        <div className="flex-shrink-0 p-4 border-t border-border/20">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Button onClick={onEndGame} variant="link" size="sm" disabled={isTimerPaused} className="text-muted-foreground">
                End Game
            </Button>
            <Input
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={isAiTyping ? "AI is thinking..." : gameMode === 'simulation' ? "Simulation in progress..." : "Continue the story..."}
              disabled={isTimerPaused || gameMode === 'simulation'}
              className="flex-grow h-11 text-sm bg-background/50"
            />
            <Button type="submit" size="icon" className="h-11 w-11" disabled={isAiTyping || !userInput.trim() || gameMode === 'simulation'}>
              {isAiTyping ? <Loader className="animate-spin" /> : <Send />}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
