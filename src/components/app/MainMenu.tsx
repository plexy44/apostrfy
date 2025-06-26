"use client";

import { useState, useEffect, useRef } from "react";
import type { Trope } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TROPES, DURATIONS, ORB_MESSAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform } from "framer-motion";
import ApostrfyLogo from "../icons/ApostrfyLogo";

interface MainMenuProps {
  onStartGame: (trope: Trope, duration: number) => void;
}

const Orb = () => {
    const orbRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e: globalThis.MouseEvent) => {
            if (orbRef.current) {
                const rect = orbRef.current.getBoundingClientRect();
                const orbCenterX = rect.left + rect.width / 2;
                const orbCenterY = rect.top + rect.height / 2;
                
                const deltaX = e.clientX - orbCenterX;
                const deltaY = e.clientY - orbCenterY;

                mouseX.set(deltaX);
                mouseY.set(deltaY);
            }
        };
        
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [mouseX, mouseY]);

    const pupilX = useTransform(mouseX, [-800, 800], [-24, 24]);
    const pupilY = useTransform(mouseY, [-800, 800], [-24, 24]);

    const baseBackgroundImage = "radial-gradient(circle at 30% 30%, hsl(var(--accent) / 0.8), transparent 40%), radial-gradient(circle at 70% 70%, hsl(var(--primary-foreground) / 0.1), transparent 40%), linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)";
    
    return (
        <motion.div
            ref={orbRef}
            animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                boxShadow: [
                    "0 0 40px hsl(var(--accent) / 0.3)",
                    "0 0 60px hsl(var(--accent) / 0.5)",
                    "0 0 40px hsl(var(--accent) / 0.3)",
                ],
            }}
            transition={{
                backgroundPosition: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "mirror",
                },
                boxShadow: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "mirror",
                }
            }}
            style={{
                backgroundSize: "200% 200%",
                backgroundImage: baseBackgroundImage,
            }}
            className="w-40 h-40 rounded-full flex items-center justify-center relative overflow-hidden"
        >
            <motion.div 
                className="w-[65%] h-[65%] rounded-full bg-black/80 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.5),0_0_25px_3px_hsl(var(--primary-foreground)/0.4)]"
                style={{
                    x: pupilX,
                    y: pupilY,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
        </motion.div>
    );
};


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

      <div className="flex flex-col items-center gap-4 mb-8">
        <Orb />
        <div className="w-full max-w-xs p-4 text-center rounded-lg glassmorphism">
            <p className="text-sm text-foreground/90 font-sans min-h-[3em] flex items-center justify-center">
              {orbMessage}
            </p>
        </div>
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
