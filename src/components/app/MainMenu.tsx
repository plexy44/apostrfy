/**
 * @fileoverview The main menu of the application. Allows users to select a
 * story style (trope) and session duration. Features the central interactive
 * AI orb and provides options to start an interactive or automated 'simulation'
 * session. Optimized for both desktop and mobile views.
 */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Trope } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DURATIONS, ORB_MESSAGES, TROPES_DATA } from "@/lib/constants";
import { cn } from "@/lib/utils";
import ApostrfyLogo from "../icons/ApostrfyLogo";
import Orb from "./Orb";
import { logEvent } from "@/lib/analytics";
import { Gift } from "lucide-react";


interface MainMenuProps {
  onStartGame: (trope: Trope, duration: number, analyticsName: 'lightning' | 'minute' | 'dragon_chasing') => void;
  onStartSimulation: (trope: Trope) => void;
  comingFromOnboarding: boolean;
  isDragonChasingUnlocked: boolean;
  areAllStylesUnlocked: boolean;
  onUnlockSecret: () => void;
}

export default function MainMenu({ 
    onStartGame, 
    onStartSimulation, 
    comingFromOnboarding, 
    isDragonChasingUnlocked, 
    areAllStylesUnlocked, 
    onUnlockSecret 
}: MainMenuProps) {
  const [selectedTrope, setSelectedTrope] = useState<Trope>("Cosmic Wanderer");
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [selectedAnalyticsName, setSelectedAnalyticsName] = useState<string>('lightning');
  const [orbMessage, setOrbMessage] = useState("");
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [startTyping, setStartTyping] = useState(false);
  
  const initialTropes = TROPES_DATA.filter(t => t.isInitiallyVisible);
  const unlockableTropes = TROPES_DATA.filter(t => !t.isInitiallyVisible);
  const initialDurations = DURATIONS.filter(d => d.label !== 'Dragon Chasing');
  const dragonChasingDuration = DURATIONS.find(d => d.label === 'Dragon Chasing')!;


  useEffect(() => {
    const message = ORB_MESSAGES[Math.floor(Math.random() * ORB_MESSAGES.length)];
    setOrbMessage(message);

    const timer = setTimeout(() => {
        setStartTyping(true);
    }, 100);
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
      }, 40);

      return () => clearInterval(intervalId);
    }
  }, [startTyping, orbMessage]);


  const handleTransitionComplete = () => {
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
  
  const handleUnlockClick = () => {
    onUnlockSecret();
    // Also switch to the trope if it's just been unlocked
    if (!areAllStylesUnlocked && isDragonChasingUnlocked) {
        setTimeout(() => setSelectedTrope("Gothic Romance"), 600);
    }
  }

  const getUnlockButtonText = () => {
    if (!isDragonChasingUnlocked) return "Unlock a Secret";
    if (!areAllStylesUnlocked) return "Unlock Final Styles";
    return "Everything Unlocked";
  }

  const isTyping = startTyping && displayedMessage.length < orbMessage.length;
  
  const TropeButton = ({ trope, ...props }: { trope: { name: Trope, description: string }, [key: string]: any }) => (
    <button
      onClick={() => handleThemeSwitch(trope.name)}
      className={cn(
        "p-3 md:p-4 rounded-lg border-2 text-left transition-all hover:border-accent w-full h-full",
        selectedTrope === trope.name ? "border-accent bg-accent/20 shadow-lg shadow-accent/20" : "border-border"
      )}
      {...props}
    >
      <h3 className="font-headline text-base md:text-lg text-foreground">{trope.name}</h3>
      <p className="text-xs md:text-sm text-muted-foreground">{trope.description}</p>
    </button>
  );


  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col items-center text-center mb-4 md:mb-6">
        <ApostrfyLogo className="w-36 h-auto mb-1 md:w-56 md:mb-2 text-foreground" />
        <p className="font-headline text-muted-foreground tracking-widest text-sm md:text-lg">connect || co-create</p>
      </div>

      <div className="flex flex-col items-center gap-4 mb-4">
        <Orb 
          layoutId="main-orb" 
          size="large" 
          isInteractive 
          onTransitionComplete={handleTransitionComplete} 
        />
        <div className="w-full max-w-xs md:max-w-md p-3 text-center rounded-lg glassmorphism">
            <p className="text-sm md:text-base text-foreground/90 font-sans min-h-[3em] flex items-center justify-center">
              {displayedMessage}
              {isTyping && <span className="animate-pulse ml-1">|</span>}
            </p>
        </div>
      </div>
      
      <Card className="w-full max-w-md md:max-w-xl glassmorphism">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="font-headline text-lg md:text-2xl text-center text-foreground">Co-create a story</CardTitle>
          <CardDescription className="text-center text-xs md:text-sm">First, choose a style for your AI companion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-4 md:p-6 pt-0 md:pt-0">
           <div className="grid grid-cols-2 gap-2 md:gap-4">
            {initialTropes.map(trope => (
                <TropeButton key={trope.name} trope={trope} />
            ))}
            <AnimatePresence>
            {areAllStylesUnlocked && unlockableTropes.map((trope, index) => (
                <motion.div
                    key={trope.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    <TropeButton trope={trope} />
                </motion.div>
            ))}
            </AnimatePresence>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-center font-headline text-foreground text-sm md:text-base">Select Mode</h4>
             <div className="flex justify-center gap-2 flex-wrap">
              {initialDurations.map((duration) => (
                <Button
                  key={duration.value}
                  variant={selectedDuration === duration.value ? "default" : "secondary"}
                  onClick={() => handleDurationSelect(duration)}
                  className="w-28 md:w-32 text-xs md:text-base md:h-11"
                >
                  {duration.label}
                </Button>
              ))}
               <AnimatePresence>
               {isDragonChasingUnlocked && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button
                            key={dragonChasingDuration.value}
                            variant={selectedDuration === dragonChasingDuration.value ? "default" : "secondary"}
                            onClick={() => handleDurationSelect(dragonChasingDuration)}
                             className="w-28 md:w-32 text-xs md:text-base md:h-11 border border-accent/50"
                        >
                            {dragonChasingDuration.label}
                        </Button>
                    </motion.div>
               )}
               </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="w-full max-w-md md:max-w-xl flex flex-col items-center">
        <Button
          onClick={handleStart}
          disabled={!selectedTrope}
          size="lg"
          className="mt-4 w-full font-headline text-base md:text-xl md:h-14"
        >
          Start Writing
        </Button>
        <Button
          onClick={handleSimulate}
          disabled={!selectedTrope}
          variant="outline"
          size="lg"
          className="mt-2 w-full font-headline text-base md:text-xl md:h-14"
        >
          Simulate
        </Button>
        <Button
            onClick={handleUnlockClick}
            variant="link"
            className="mt-2 text-accent md:text-base"
            disabled={isDragonChasingUnlocked && areAllStylesUnlocked}
        >
            <Gift className="mr-2 h-4 w-4" />
            {getUnlockButtonText()}
        </Button>
      </div>
    </motion.div>
  );
}
