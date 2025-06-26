"use client";

import { useState } from "react";
import type { Trope } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TROPES, DURATIONS, ORB_MESSAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import ApostrfyLogo from "../icons/ApostrfyLogo";
import { useEffect } from "react";

interface MainMenuProps {
  onStartGame: (trope: Trope, duration: number) => void;
}

const Orb = () => (
  <motion.div 
    animate={{ scale: [1, 1.05, 1], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }}}
    className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-accent/70 flex items-center justify-center shadow-[0_0_40px] shadow-accent/30"
  >
    <div className="w-36 h-36 rounded-full bg-background/50 backdrop-blur-sm"></div>
  </motion.div>
);

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const [selectedTrope, setSelectedTrope] = useState<Trope | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(5);
  const [orbMessage, setOrbMessage] = useState("");

  useEffect(() => {
    setOrbMessage(ORB_MESSAGES[Math.floor(Math.random() * ORB_MESSAGES.length)]);
  }, []);

  const handleStart = () => {
    if (selectedTrope) {
      onStartGame(selectedTrope, selectedDuration);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full animate-fade-in">
      <div className="flex flex-col items-center text-center mb-8">
        <ApostrfyLogo className="w-48 h-auto mb-2 text-foreground" />
        <p className="font-headline text-muted-foreground tracking-widest">connect || co-create</p>
      </div>

      <div className="relative mb-8">
        <Orb />
        <p className="absolute inset-0 flex items-center justify-center text-center text-sm text-foreground/90 font-sans p-8">
          {orbMessage}
        </p>
      </div>
      
      <Card className="w-full max-w-lg glassmorphism">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-center">Co-create a story</CardTitle>
          <CardDescription className="text-center">First, choose a style for your AI companion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {TROPES.map((trope) => (
              <button
                key={trope.name}
                onClick={() => setSelectedTrope(trope.name)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all hover:border-accent",
                  selectedTrope === trope.name ? "border-accent bg-accent/20" : "border-border"
                )}
              >
                <h3 className="font-headline text-lg text-foreground">{trope.name}</h3>
                <p className="text-sm text-muted-foreground">{trope.description}</p>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-center font-headline">Select Duration</h4>
            <div className="flex justify-center gap-2">
              {DURATIONS.map((duration) => (
                <Button
                  key={duration.value}
                  variant={selectedDuration === duration.value ? "default" : "secondary"}
                  onClick={() => setSelectedDuration(duration.value)}
                  className="w-28"
                >
                  {duration.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button
        onClick={handleStart}
        disabled={!selectedTrope}
        size="lg"
        className="mt-8 w-full max-w-lg font-headline text-lg"
      >
        Start Writing
      </Button>
    </div>
  );
}
