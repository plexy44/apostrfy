/**
 * @fileoverview This component renders a consistent, themed loading screen for the application.
 * It features the animated AI Orb, drifting background shapes, and displays a random
 * literary quote to maintain immersion during loading periods.
 */
"use client";

import { SiliconShape } from "@/components/icons/SiliconShape";
import { LITERARY_PLACEHOLDERS } from "@/lib/constants";
import { useEffect, useState } from "react";
import Orb from "./Orb";

export default function LoadingScreen() {
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    setPlaceholder(LITERARY_PLACEHOLDERS[Math.floor(Math.random() * LITERARY_PLACEHOLDERS.length)]);
  }, []);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden z-[100] animate-fade-in">
        <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
                <SiliconShape key={i} />
            ))}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center gap-8">
            <Orb size="large" isInteractive={false} />
            <p className="text-lg font-headline text-foreground/80 max-w-xs">
                {placeholder}
            </p>
        </div>
    </div>
  );
}
