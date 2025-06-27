/**
 * @fileoverview This component provides the main interface for the story co-creation game.
 * It features a timer bar to track the session duration, a scrollable area to display
 * the evolving story in a chat-like format, and a user input form to submit the next
 * part of the narrative.
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

interface GameScreenProps {
  trope: Trope;
  story: StoryPart[];
  duration: number;
  isAiTyping: boolean;
  onUserSubmit: (input: string) => void;
  onEndGame: () => void;
  onQuitRequest: () => void;
  gameMode: 'interactive' | 'simulation';
}

const TimerBar = ({ durationInMinutes, onEndGame, className }: { durationInMinutes: number; onEndGame: () => void, className?: string }) => {
  const durationInSeconds = durationInMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onEndGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onEndGame]);

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
      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
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

export default function GameScreen({ trope, story, duration, isAiTyping, onUserSubmit, onEndGame, onQuitRequest, gameMode }: GameScreenProps) {
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [story]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isAiTyping) {
      onUserSubmit(userInput.trim());
      setUserInput("");
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-[90vh] w-full max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Game Panel */}
      <div className="flex flex-col h-full w-full flex-grow p-4 glassmorphism rounded-lg relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 -left-16 z-20 rounded-full"
          onClick={onQuitRequest}
          aria-label="Quit game"
        >
          <ArrowLeft />
        </Button>
        
        <div className="flex items-start gap-4 mb-4">
            <div className="flex-grow">
                <h3 className="font-headline text-lg text-foreground mb-1">{trope}</h3>
                <TimerBar durationInMinutes={duration} onEndGame={onEndGame} />
            </div>
            <Orb size="tiny" isInteractive={true} className="flex-shrink-0" />
        </div>
        
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-6">
            {story.map((part, index) => (
              <div key={index} className={`flex flex-col animate-fade-in-up ${part.speaker === 'ai' ? 'items-start' : 'items-end'}`}>
                 {part.personaName && (
                  <p className={`text-xs text-muted-foreground mb-1 px-2 ${part.speaker === 'user' ? 'self-end' : 'self-start'}`}>
                    {part.personaName}
                  </p>
                )}
                <div className={`p-4 rounded-xl max-w-[85%] ${part.speaker === 'ai' ? 'bg-secondary rounded-bl-none' : 'bg-primary/90 text-primary-foreground rounded-br-none'}`}>
                  <p>{part.line}</p>
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex items-start">
                 <div className="p-4 rounded-xl max-w-[85%] bg-secondary rounded-bl-none flex items-center space-x-2">
                   <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                   <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={gameMode === 'simulation' ? "Simulation in progress..." : "Continue the story..."}
            disabled={isAiTyping || gameMode === 'simulation'}
            className="flex-grow h-12 text-base"
            autoFocus
          />
          <Button type="submit" size="icon" className="h-12 w-12" disabled={isAiTyping || !userInput.trim() || gameMode === 'simulation'}>
            {isAiTyping ? <Loader className="animate-spin" /> : <Send />}
          </Button>
        </form>
         <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
          <Timer className="h-4 w-4" />
          <span>A 30-second response timer will be implemented here.</span>
        </div>
        <div className="text-center py-2">
          <Button onClick={onEndGame} variant="outline" size="sm">Test End Game</Button>
        </div>
      </div>

    </motion.div>
  );
}
