/**
 * @fileoverview This component renders and manages the game timer, specifically
 * for the "Dragon Chasing" mode. It handles time depletion, the "Flow Restore"
 * healing mechanic, and all associated UI feedback like activation glows and
 * healing flashes.
 */
"use client";

import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { motion } from 'framer-motion';
import { Hourglass, Timer as TimerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerBarProps {
  durationInSeconds: number;
  isPaused: boolean;
  isDragonChasingMode: boolean;
  isFlowRestoreActive: boolean;
  onEndGame: () => void;
}

interface TimerBarRef {
  heal: (amountInSeconds: number) => void;
}

const TimerBar = forwardRef<TimerBarRef, TimerBarProps>(({ 
  durationInSeconds, 
  isPaused,
  isDragonChasingMode,
  isFlowRestoreActive,
  onEndGame, 
}, ref) => {
  const [timeLeft, setTimeLeft] = useState(durationInSeconds * 1000);
  const [showActivationGlow, setShowActivationGlow] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastTickRef = useRef<number>(Date.now());

  useImperativeHandle(ref, () => ({
    heal: (amountInSeconds) => {
      if (amountInSeconds > 0) {
        setTimeLeft(prev => Math.min(durationInSeconds * 1000, prev + (amountInSeconds * 1000)));
        setIsHealing(true);
        setTimeout(() => setIsHealing(false), 500); // Reset heal flash
      }
    }
  }));

  // Effect to handle the main timer countdown
  useEffect(() => {
    if (isPaused) {
        if(intervalRef.current) clearInterval(intervalRef.current);
        return;
    }

    if (timeLeft <= 0) {
        if(intervalRef.current) clearInterval(intervalRef.current);
        onEndGame();
        return;
    }
    
    lastTickRef.current = Date.now();
    intervalRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;
        setTimeLeft(prevTime => Math.max(0, prevTime - delta));
    }, 50); // Update every 50ms for smooth millisecond display

    return () => clearInterval(intervalRef.current);
  }, [isPaused, onEndGame]); // Rerun only when pause state changes

  useEffect(() => {
    if (timeLeft <= 0) {
      if(intervalRef.current) clearInterval(intervalRef.current);
      onEndGame();
    }
  }, [timeLeft, onEndGame]);


  // Effect to trigger the one-time activation glow
  useEffect(() => {
    if (isFlowRestoreActive && !showActivationGlow) {
      setShowActivationGlow(true);
      const timer = setTimeout(() => setShowActivationGlow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isFlowRestoreActive, showActivationGlow]);


  const formatTime = (totalMilliseconds: number) => {
    const totalSeconds = Math.max(0, totalMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds * 100) % 100);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
  };

  const percentage = (timeLeft / (durationInSeconds * 1000)) * 100;
  const isUrgent = timeLeft <= 20000;

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
          <span>{formatTime(durationInSeconds * 1000)}</span>
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
          transition={{ duration: isHealing ? 0.1 : 0.05, ease: 'linear' }}
        />
      </div>
    </div>
  );
});

TimerBar.displayName = 'TimerBar';

export default TimerBar;
