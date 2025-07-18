/**
 * @fileoverview Renders the primary game interface. This component supports
 * both interactive user input and automated simulation modes. The layout
 * consists of a static header and footer with a central, internally scrollable
 * area for the story transcript.
 */
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StoryPart, Trope, Speaker } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader, X } from "lucide-react";
import Orb from "./Orb";
import TimerBar from "./TimerBar";
import { useToast } from "@/hooks/use-toast";
import { logEvent } from "@/lib/analytics";


interface GameScreenProps {
  trope: Trope;
  story: StoryPart[];
  duration: number; // in seconds
  isAiTyping: boolean;
  onUserSubmit: (userInput: string, isPaste: boolean) => void;
  onEndGame: () => void;
  onQuitRequest: () => void;
  gameMode: 'interactive' | 'simulation';
  nextSpeakerInSim: Speaker;
  onPauseForAd: () => void;
  isAdPaused: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  turnTimer: number;
}


export default function GameScreen({ 
  trope, 
  story, 
  duration, 
  isAiTyping, 
  onUserSubmit, 
  onEndGame, 
  onQuitRequest, 
  gameMode, 
  nextSpeakerInSim, 
  onPauseForAd, 
  isAdPaused, 
  inputRef,
  turnTimer,
}: GameScreenProps) {
  const [userInput, setUserInput] = useState("");
  const [isPasted, setIsPasted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const timerBarRef = useRef<{ heal: (amount: number) => void }>(null);

  const [lastHealAmount, setLastHealAmount] = useState<number | null>(null);
  const [validTurnCount, setValidTurnCount] = useState(0);
  const [isFlowRestoreActive, setIsFlowRestoreActive] = useState(false);
  const healTimerRef = useRef<NodeJS.Timeout>();
  const isDragonChasingMode = duration === 120;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [story]);

  useEffect(() => {
    if (!isAiTyping && gameMode === 'interactive' && !isAdPaused) {
      inputRef.current?.focus();
    }
  }, [isAiTyping, gameMode, isAdPaused, inputRef]);

  const calculateFlowRestore = (turnTime: number, wordCount: number, isPasted: boolean): number => {
    if (!isDragonChasingMode || isPasted || wordCount < 4 || !isFlowRestoreActive) {
      return 0;
    }

    // Time Bonus
    let timeBonus = 0;
    if (turnTime >= 2.0 && turnTime < 4.0) timeBonus = 1.0;
    else if (turnTime >= 4.0 && turnTime <= 12.0) timeBonus = 2.0;
    else if (turnTime > 12.0) timeBonus = 1.0;

    // Word Bonus
    let wordBonus = 0;
    if (wordCount >= 4 && wordCount <= 7) wordBonus = 0.5;
    else if (wordCount >= 8 && wordCount <= 15) wordBonus = 1.5;
    else if (wordCount >= 16) wordBonus = 2.5;

    return timeBonus + wordBonus;
  }

  const handleHeal = (amount: number) => {
    if (amount > 0) {
      setLastHealAmount(amount);
      if (timerBarRef.current) {
        timerBarRef.current.heal(amount);
      }
      if (healTimerRef.current) clearTimeout(healTimerRef.current);
      healTimerRef.current = setTimeout(() => setLastHealAmount(null), 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isAiTyping) {
      const turnTime = (Date.now() - turnTimer) / 1000;
      const wordCount = userInput.trim().split(/\s+/).length;
      const isInputValid = wordCount >= 4 && !isPasted;

      if (isDragonChasingMode) {
        if (isInputValid) {
          const newValidTurnCount = validTurnCount + 1;
          setValidTurnCount(newValidTurnCount);
          if (newValidTurnCount >= 2 && !isFlowRestoreActive) {
            setIsFlowRestoreActive(true);
          }
        }
        
        const healAmount = calculateFlowRestore(turnTime, wordCount, isPasted);
        handleHeal(healAmount);
      }
      
      onUserSubmit(userInput.trim(), isPasted);
      setUserInput("");
      setIsPasted(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const isBlocked = pastedText.length > 1000;

    logEvent('text_pasted', {
        pasted_length: pastedText.length,
        was_blocked: isBlocked
    });

    if (isBlocked) {
      e.preventDefault();
      toast({
        variant: "destructive",
        title: "Paste Limit Exceeded",
        description: "You can only paste up to 1000 characters at a time.",
      });
    } else {
        setIsPasted(true);
    }
  };

  const isTimerPaused = isAdPaused || (isAiTyping && gameMode === 'interactive');

  const renderTypingIndicator = () => {
    if (!isAiTyping) return null;

    let alignment, bubbleStyles;
    
    const isNextSpeakerUser = gameMode === 'simulation' && nextSpeakerInSim === 'user';
    
    alignment = isNextSpeakerUser ? 'items-end' : 'items-start';
    bubbleStyles = isNextSpeakerUser
      ? 'bg-primary text-primary-foreground rounded-br-none'
      : 'bg-secondary rounded-bl-none';

    return (
      <div className={`flex ${alignment}`}>
        <div className={`p-3 rounded-lg max-w-[85%] ${bubbleStyles} flex items-center space-x-2 shadow-md`}>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
        {/* Header */}
        <header className="flex-shrink-0 p-4 border-b border-border/20 flex items-center gap-4 relative">
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
                ref={timerBarRef}
                durationInSeconds={duration} 
                isPaused={isTimerPaused}
                isDragonChasingMode={isDragonChasingMode}
                isFlowRestoreActive={isFlowRestoreActive}
                onEndGame={onEndGame} 
                onPauseForAd={onPauseForAd} 
            />
          </div>
          <Orb size="tiny" isInteractive={true} />
           <AnimatePresence>
            {lastHealAmount && (
                <motion.div
                    className="absolute top-10 left-1/2 -translate-x-1/2 text-lg font-bold text-green-400"
                    style={{ textShadow: '0 0 8px rgba(74, 222, 128, 0.7)'}}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -30, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    +{lastHealAmount.toFixed(1)}s
                </motion.div>
            )}
           </AnimatePresence>
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
              {renderTypingIndicator()}
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
                onPaste={handlePaste}
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
