/**
 * @fileoverview This component serves as the main menu for the application.
 * It allows users to select a story style (trope) and session duration.
 * It features the central interactive AI orb and provides options to start an
 * interactive co-creation session or begin an automated 'simulation' between
 * two AI personas. It also includes a feature to unlock a secret style via a rewarded ad.
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Trope } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DURATIONS, ORB_MESSAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import ApostrfyLogo from "../icons/ApostrfyLogo";
import Orb from "./Orb";
import { logEvent } from "@/lib/analytics";
import { Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TROPES_DATA: { name: Trope; description: string }[] = [
  { name: "Noir Detective", description: "Rain-slicked streets and whispered secrets." },
  { name: "Cosmic Wanderer", description: "Lost constellations and alien whispers." },
  { name: "Gothic Romance", description: "Crumbling manors and timeless heartbreak." },
  { name: "Freeflow", description: "Your voice, your story. I'll follow your lead." },
];

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
  const [isFreeflowUnlocked, setIsFreeflowUnlocked] = useState(false);
  const { toast } = useToast();
  
  const initialTropes = TROPES_DATA.filter(t => t.name !== 'Freeflow');
  const freeflowTrope = TROPES_DATA.find(t => t.name === 'Freeflow')!;

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
  
  const handleRewardedAd = () => {
    if (isFreeflowUnlocked) {
      toast({ title: "Already Unlocked!", description: "You can now select the Freeflow style." });
      return;
    }
    logEvent('rewarded_ad_flow', { status: 'offered' });
    
    // This simulates the ad watching process
    logEvent('ad_impression', { ad_platform: 'google_admob', ad_source: 'admob', ad_format: 'rewarded', ad_unit_name: 'unlock_secret_style_reward' });
    
    toast({ 
      title: "Ad Finished!", 
      description: "You've unlocked the secret 'Freeflow' style!" 
    });

    setIsFreeflowUnlocked(true);
    setSelectedTrope("Freeflow"); // auto-select the new style
    logEvent('rewarded_ad_flow', { status: 'completed' });
  }

  const isTyping = startTyping && displayedMessage.length < orbMessage.length;
  
  const TropeButton = ({ trope, ...props }: { trope: { name: Trope, description: string }, [key: string]: any }) => (
    <button
      onClick={() => handleThemeSwitch(trope.name)}
      className={cn(
        "p-3 rounded-lg border-2 text-left transition-all hover:border-accent w-full",
        selectedTrope === trope.name ? "border-accent bg-accent/20 shadow-lg shadow-accent/20" : "border-border"
      )}
      {...props}
    >
      <h3 className="font-headline text-base text-foreground">{trope.name}</h3>
      <p className="text-xs text-muted-foreground">{trope.description}</p>
    </button>
  );


  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col items-center text-center mb-4 md:mb-6">
        <ApostrfyLogo className="w-36 h-auto mb-1 md:w-48 md:mb-2 text-foreground" />
        <p className="font-headline text-muted-foreground tracking-widest text-sm">connect || co-create</p>
      </div>

      <div className="flex flex-col items-center gap-4 mb-4">
        <Orb 
          layoutId="main-orb" 
          size="large" 
          isInteractive 
          onTransitionComplete={handleTransitionComplete} 
        />
        <div className="w-full max-w-xs p-3 text-center rounded-lg glassmorphism">
            <p className="text-sm text-foreground/90 font-sans min-h-[3em] flex items-center justify-center">
              {displayedMessage}
              {isTyping && <span className="animate-pulse ml-1">|</span>}
            </p>
        </div>
      </div>
      
      <Card className="w-full max-w-md glassmorphism">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="font-headline text-xl text-center text-foreground">Co-create a story</CardTitle>
          <CardDescription className="text-center text-xs">First, choose a style for your AI companion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
           <div className="grid grid-cols-2 gap-2 md:gap-4">
            <AnimatePresence>
                <TropeButton key={initialTropes[0].name} trope={initialTropes[0]} />
                <TropeButton key={initialTropes[1].name} trope={initialTropes[1]} />
                
                {isFreeflowUnlocked ? (
                    <>
                        <motion.div 
                            key={initialTropes[2].name}
                            layout
                            transition={{ ease: "easeInOut", duration: 0.5 }}
                        >
                             <TropeButton trope={initialTropes[2]} />
                        </motion.div>
                        <motion.div
                            key={freeflowTrope.name}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ ease: "easeInOut", duration: 0.5, delay: 0.2 }}
                        >
                            <TropeButton trope={freeflowTrope} />
                        </motion.div>
                    </>
                ) : (
                    <motion.div key="centered-trope" className="col-span-2 flex justify-center" layout>
                         <div className="w-1/2">
                            <TropeButton trope={initialTropes[2]} />
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-center font-headline text-foreground text-sm">Select Mode</h4>
            <div className="flex justify-center gap-2">
              {DURATIONS.map((duration) => (
                <Button
                  key={duration.value}
                  variant={selectedDuration === duration.value ? "default" : "secondary"}
                  onClick={() => handleDurationSelect(duration)}
                  className="w-24 md:w-32"
                >
                  {duration.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="w-full max-w-md flex flex-col items-center">
        <Button
          onClick={handleStart}
          disabled={!selectedTrope}
          size="lg"
          className="mt-4 w-full font-headline text-lg"
        >
          Start Writing
        </Button>
        <Button
          onClick={handleSimulate}
          disabled={!selectedTrope}
          variant="outline"
          size="lg"
          className="mt-2 w-full font-headline text-lg"
        >
          Simulate
        </Button>
        <Button
            onClick={handleRewardedAd}
            variant="link"
            className="mt-2 text-accent"
        >
            <Gift className="mr-2 h-4 w-4" />
            Unlock a Secret Style (Ad)
        </Button>
      </div>
    </motion.div>
  );
}
