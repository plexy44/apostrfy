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
  duration?: number;
}

export default function LoadingScreen({ trope, duration }: LoadingScreenProps) {
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    if (!trope) {
      setPlaceholder(LITERARY_PLACEHOLDERS[Math.floor(Math.random() * LITERARY_PLACEHOLDERS.length)]);
    }
  }, [trope]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden z-[100] animate-fade-in">
        <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
                <SiliconShape key={i} />
            ))}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center gap-8">
            <Orb size="large" isInteractive={false} />
            
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
                        Time: <span className="text-foreground/90 font-semibold">{duration} minutes</span>
                    </p>
                </motion.div>
            ) : (
                <p className="text-lg font-headline text-foreground/80 max-w-xs">
                    {placeholder}
                </p>
            )}
        </div>
    </div>
  );
}
