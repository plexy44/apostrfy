/**
 * @fileoverview This component serves as the main menu for the application.
 * It allows users to select a story style (trope) and session duration.
 * It features the central interactive AI orb and provides options to start an
 * interactive co-creation session or begin an automated 'simulation' between
 * two AI personas.
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Trope } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TROPES, DURATIONS, ORB_MESSAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import ApostrfyLogo from "../icons/ApostrfyLogo";
import Orb from "./Orb";
import { logEvent } from "@/lib/analytics";
import { Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MainMenuProps {
  onStartGame: (trope: Trope, duration: number, analyticsName: 'lightning' | 'minute' | 'twice_a_minute') => void;
  onStartSimulation: (trope: Trope) => void;
  comingFromOnboarding: boolean;
}

export default function MainMenu({ onStartGame, onStartSimulation, comingFromOnboarding }: MainMenuProps) {
  const [selectedTrope, setSelectedTrope] = useState<Trope>("Cosmic Wanderer");
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [selectedAnalyticsName, setSelectedAnalyticsName] = useState<string>('minute');
  const [orbMessage, setOrbMessage] = useState("");
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [startTyping, setStartTyping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const message = ORB_MESSAGES[Math.floor(Math.random() * ORB_MESSAGES.length)];
    setOrbMessage(message);

    // Start typing almost immediately unless coming from the smooth onboarding transition.
    const timer = setTimeout(() => {
        setStartTyping(true);
    }, 100); // Reduced delay for faster start
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (startTyping && orbMessage) {
      setDisplayedMessage("");
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < orbMessage.length) {
          setDisplayedMessage(orbMessage.substring(0, i + 1));
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, 40); // Slightly faster typing speed

      return () => clearInterval(intervalId);
    }
  }, [startTyping, orbMessage]);


  const handleTransitionComplete = () => {
    // This allows the orb's shared layout animation to complete before starting to type.
    if (comingFromOnboarding) {
        setStartTyping(true);
    }
  };

  const handleStart = () => {
    if (selectedTrope) {
      onStartGame(selectedTrope, selectedDuration, selectedAnalyticsName as any);
    }
  };

  const handleSimulate = () => {
    if (selectedTrope) {
      onStartSimulation(selectedTrope);
    }
  };

  const handleDurationSelect = (duration: typeof DURATIONS[0]) => {
    setSelectedDuration(duration.value);
    setSelectedAnalyticsName(duration.analyticsName);
  }
  
  const handleThemeSwitch = (trope: Trope) => {
    logEvent('theme_switched', { selected_theme: trope });
    setSelectedTrope(trope);
  }
  
  const handleRewardedAd = () => {
    logEvent('rewarded_ad_flow', { status: 'offered' });
    logEvent('ad_impression', { ad_platform: 'google_admob', ad_source: 'admob', ad_format: 'rewarded', ad_unit_name: 'unlock_secret_style_reward' });
    // Simulate watching an ad
    toast({ title: "Simulating Rewarded Ad", description: "You've unlocked a new secret style (placeholder)!" });
    logEvent('rewarded_ad_flow', { status: 'completed' });
    // In a real app, you would unlock a feature here.
  }

  const isTyping = startTyping && displayedMessage.length < orbMessage.length;

  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col items-center text-center mb-4 md:mb-8">
        <ApostrfyLogo className="w-40 h-auto mb-1 md:w-48 md:mb-2 text-foreground" />
        <p className="font-headline text-muted-foreground tracking-widest text-sm md:text-base">connect || co-create</p>
      </div>

      <div className="flex flex-col items-center gap-4 mb-4 md:mb-8">
        <Orb 
          layoutId="main-orb" 
          size="large" 
          isInteractive 
          onTransitionComplete={handleTransitionComplete} 
        />
        <div className="w-full max-w-xs p-3 md:p-4 text-center rounded-lg glassmorphism">
            <p className="text-sm text-foreground/90 font-sans min-h-[3em] flex items-center justify-center">
              {displayedMessage}
              {isTyping && <span className="animate-pulse ml-1">|</span>}
            </p>
        </div>
      </div>
      
      <Card className="w-full max-w-lg glassmorphism">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="font-headline text-xl md:text-2xl text-center text-foreground">Co-create a story</CardTitle>
          <CardDescription className="text-center">First, choose a style for your AI companion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-4 md:p-6">
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {TROPES.map((trope) => (
              <button
                key={trope.name}
                onClick={() => handleThemeSwitch(trope.name)}
                className={cn(
                  "p-3 md:p-4 rounded-lg border-2 text-left transition-all hover:border-accent",
                  selectedTrope === trope.name ? "border-accent bg-accent/20 shadow-lg shadow-accent/50" : "border-border"
                )}
              >
                <h3 className="font-headline text-base md:text-lg text-foreground">{trope.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{trope.description}</p>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-center font-headline text-foreground">Select Mode</h4>
            <div className="flex justify-center gap-2">
              {DURATIONS.map((duration) => (
                <Button
                  key={duration.value}
                  variant={selectedDuration === duration.value ? "default" : "secondary"}
                  onClick={() => handleDurationSelect(duration)}
                  className="w-28 md:w-32"
                >
                  {duration.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="w-full max-w-lg flex flex-col items-center">
        <Button
          onClick={handleStart}
          disabled={!selectedTrope}
          size="lg"
          className="mt-6 md:mt-8 w-full font-headline text-lg"
        >
          Start Writing
        </Button>
        <Button
          onClick={handleSimulate}
          disabled={!selectedTrope}
          variant="outline"
          size="lg"
          className="mt-3 md:mt-4 w-full font-headline text-lg"
        >
          Simulate
        </Button>
        <Button
            onClick={handleRewardedAd}
            variant="link"
            className="mt-2 md:mt-4 text-accent"
        >
            <Gift className="mr-2 h-4 w-4" />
            Unlock a Secret Style (Ad)
        </Button>
      </div>
    </motion.div>
  );
}
