/**
 * @fileoverview This component provides the main interface for the story co-creation game.
 * It features a timer bar to track the session duration, a scrollable area to display
 * the evolving story in a chat-like format, and a user input form to submit the next
 * part of the narrative.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import type { StoryPart } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader, ArrowLeft } from "lucide-react";

interface GameScreenProps {
  story: StoryPart[];
  duration: number;
  isAiTyping: boolean;
  onUserSubmit: (input: string) => void;
  onEndGame: () => void;
  onQuitRequest: () => void;
}

const TimerBar = ({ durationInMinutes, onEndGame }: { durationInMinutes: number; onEndGame: () => void }) => {
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

  const percentage = (timeLeft / durationInSeconds) * 100;

  return (
    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden my-4">
      <div
        className="h-full bg-accent rounded-full transition-all duration-1000 ease-linear"
        style={{ width: `${percentage}%`, background: `linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))` }}
      />
    </div>
  );
};

export default function GameScreen({ story, duration, isAiTyping, onUserSubmit, onEndGame, onQuitRequest }: GameScreenProps) {
  const [userInput, setUserInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [story]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isAiTyping) {
      onUserSubmit(userInput.trim());
      setUserInput("");
    }
  };

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-3xl mx-auto p-4 glassmorphism rounded-lg animate-fade-in relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 -left-5 z-20 rounded-full"
        onClick={onQuitRequest}
        aria-label="Quit game"
      >
        <ArrowLeft />
      </Button>
      
      <TimerBar durationInMinutes={duration} onEndGame={onEndGame} />
      
      <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {story.map((part, index) => (
            <div key={index} className={`flex flex-col animate-fade-in-up ${part.speaker === 'ai' ? 'items-start' : 'items-end'}`}>
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
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Continue the story..."
          disabled={isAiTyping}
          className="flex-grow h-12 text-base"
          autoFocus
        />
        <Button type="submit" size="icon" className="h-12 w-12" disabled={isAiTyping || !userInput.trim()}>
          {isAiTyping ? <Loader className="animate-spin" /> : <Send />}
        </Button>
      </form>
       <p className="text-xs text-muted-foreground mt-2 text-center">A 30-second response timer will be implemented here.</p>
    </div>
  );
}
