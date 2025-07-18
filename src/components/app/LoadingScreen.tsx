/**
 * @fileoverview This component renders a consistent, themed loading screen.
 * It features an animated AI Orb and can display either a random literary quote
 * for general loading, or contextual game information (like style and duration)
 * when transitioning into a new session.
 */
"use client";

import { SiliconShape } from "@/components/icons/SiliconShape";
import { LITERARY_PLACEHOLDERS } from "@/lib/constants";
import { useEffect, useState } from "react";
import Orb from "./Orb";
import type { Trope } from "@/lib/types";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  trope?: Trope;
  duration?: number; // duration is in seconds
}

export default function LoadingScreen({ trope, duration }: LoadingScreenProps) {
  const [placeholder, setPlaceholder] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (trope) {
      // If it's a game-specific loading screen, don't show the animated quotes.
      return;
    }
  
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
  
    const animateText = async () => {
      if (!isMounted) return;
  
      const currentQuote = LITERARY_PLACEHOLDERS[currentIndex];
      
      // Type out the quote
      for (let i = 0; i <= currentQuote.length; i++) {
        if (!isMounted) return;
        setPlaceholder(currentQuote.substring(0, i));
        await new Promise(res => setTimeout(res, 50));
      }
      
      // Pause at the end
      await new Promise(res => setTimeout(res, 2000));
      if (!isMounted) return;

      // "Delete" the quote
      for (let i = currentQuote.length; i >= 0; i--) {
        if (!isMounted) return;
        setPlaceholder(currentQuote.substring(0, i));
        await new Promise(res => setTimeout(res, 30));
      }

      // Pause before the next one
      await new Promise(res => setTimeout(res, 500));
      if (!isMounted) return;

      // Move to the next quote
      setCurrentIndex((prevIndex) => (prevIndex + 1) % LITERARY_PLACEHOLDERS.length);
    };

    timeoutId = setTimeout(animateText, 500);
  
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [trope, currentIndex]);


  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden z-[100] animate-fade-in">
        <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
                <SiliconShape key={i} />
            ))}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center gap-8">
            <Orb size="large" isInteractive={true} />
            
            {trope && duration ? (
                 <motion.div 
                    className="flex flex-col items-center gap-2 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <p className="text-lg font-headline text-foreground/80">
                        Style: <span className="text-foreground font-bold">{trope}</span>
                    </p>
                    <p className="text-base text-muted-foreground">
                        Time: <span className="text-foreground/90 font-semibold">{formatDuration(duration)}</span>
                    </p>
                </motion.div>
            ) : (
                <p className="text-lg font-headline text-foreground/80 max-w-xs min-h-[2.5em]">
                    {placeholder}
                    <span className="animate-pulse">|</span>
                </p>
            )}
        </div>
    </div>
  );
}
