/**
 * @fileoverview This component renders and manages the game timer, specifically
 * for the "Dragon Chasing" mode. It handles time depletion, the "Flow Restore"
 * healing mechanic, and all associated UI feedback like activation glows and
 * healing flashes.
 */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Hourglass, Timer as TimerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerBarProps {
  durationInSeconds: number;
  isPaused: boolean;
  isDragonChasingMode: boolean;
  isFlowRestoreActive: boolean;
  onEndGame: () => void;
  onPauseForAd: () => void;
  onHeal: (amount: number) => void;
}

export default function TimerBar({ 
  durationInSeconds, 
  isPaused,
  isDragonChasingMode,
  isFlowRestoreActive,
  onEndGame, 
  onPauseForAd,
  onHeal
}: TimerBarProps) {
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);
  const [showActivationGlow, setShowActivationGlow] = useState(false);
  const [isHealing, setIsHealing] = useState(false);

  const healTimer = useCallback((amount: number) => {
    if (amount > 0) {
      setTimeLeft(prev => Math.min(durationInSeconds, prev + amount));
      setIsHealing(true);
      setTimeout(() => setIsHealing(false), 500); // Reset heal flash
    }
  }, [durationInSeconds]);

  // Effect to handle the main timer countdown
  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      onEndGame();
      return;
    }
    
    // Mid-game ad logic for "Dragon Chasing" mode
    if (isDragonChasingMode && durationInSeconds === 120 && Math.floor(timeLeft) === 60) {
        onPauseForAd();
        return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => Math.max(0, prevTime - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onEndGame, durationInSeconds, isDragonChasingMode, onPauseForAd]);

  // Effect to handle healing the timer
  useEffect(() => {
    onHeal(0); // This is a bit of a hack to get the stable function from the parent
    // The parent passes a new function identity each time for onHeal.
    // We re-assign the prop to a stable function we can use in our dependency array.
    // This stops the effect from running on every render.
    // @ts-ignore
    onHeal = healTimer;
  }, [onHeal, healTimer]);

  // Effect to trigger the one-time activation glow
  useEffect(() => {
    if (isFlowRestoreActive && !showActivationGlow) {
      setShowActivationGlow(true);
      const timer = setTimeout(() => setShowActivationGlow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isFlowRestoreActive, showActivationGlow]);


  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const percentage = (timeLeft / durationInSeconds) * 100;
  const isUrgent = timeLeft <= 20;

  return (
    <div className={cn(
        "w-full space-y-2 p-1 rounded-lg transition-all duration-300",
        showActivationGlow && "shadow-[0_0_15px_hsl(var(--accent))] border border-accent/50"
    )}>
      <div className="flex justify-between items-center text-xs md:text-sm font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Hourglass className="h-3 w-3 md:h-4 md:w-4" />
          <span>{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TimerIcon className="h-3 w-3 md:h-4 md:w-4" />
          <span>{formatTime(durationInSeconds)}</span>
        </div>
      </div>
      <div className="w-full h-1.5 md:h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          animate={{
            width: `${percentage}%`,
            backgroundColor: isHealing
              ? 'hsl(145, 63%, 49%)' // vibrant green
              : isUrgent
                ? 'hsl(var(--destructive))'
                : 'hsl(var(--accent))',
          }}
          transition={{ duration: isHealing ? 0.1 : 1, ease: 'linear' }}
        />
      </div>
    </div>
  );
};
