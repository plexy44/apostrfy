/**
 * @fileoverview This component defines the animated AI companion Orb.
 * It uses Framer Motion for complex visual effects, including:
 * - A smooth, continuous color-shifting background using warm tones.
 * - An interactive "pupil" that follows the user's cursor across the screen.
 * - A glowing "accretion disk" effect.
 * - A shared layout animation (`layoutId`) to smoothly transition between
 *   different states (e.g., from the onboarding modal to the main menu).
 */

"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrbProps {
  layoutId?: string;
  size?: "small" | "large";
  isInteractive?: boolean;
  className?: string;
  onTransitionComplete?: () => void;
}

export default function Orb({ layoutId, size = "large", isInteractive = true, className, onTransitionComplete }: OrbProps) {
    const orbRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        if (!isInteractive) return;

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
    }, [isInteractive, mouseX, mouseY]);

    const pupilX = useTransform(mouseX, [-800, 800], [-24, 24]);
    const pupilY = useTransform(mouseY, [-800, 800], [-24, 24]);
    
    return (
        <motion.div
            layoutId={layoutId}
            ref={orbRef}
            onLayoutAnimationComplete={onTransitionComplete}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
            className={cn(
                "rounded-full flex items-center justify-center relative overflow-hidden",
                size === "large" ? "w-40 h-40" : "w-24 h-24",
                className
            )}
        >
            <motion.div
                className="w-full h-full absolute inset-0"
                animate={{
                    backgroundColor: [
                        "hsl(38, 95%, 55%)",  // Warm orange
                        "hsl(5, 85%, 60%)",   // Warm red
                        "hsl(340, 90%, 65%)", // Warm pink
                        "hsl(25, 95%, 55%)",  // Amber
                    ],
                    boxShadow: [
                        "0 0 60px hsl(38, 95%, 55%, 0.7)",
                        "0 0 70px hsl(5, 85%, 60%, 0.8)",
                        "0 0 65px hsl(340, 90%, 65%, 0.8)",
                        "0 0 60px hsl(25, 95%, 55%, 0.7)",
                    ]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "mirror",
                }}
            />
            <motion.div 
                className="w-[65%] h-[65%] rounded-full bg-black/80 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.5),0_0_35px_5px_hsl(var(--primary-foreground)/0.8)] z-10"
                style={{
                    x: isInteractive ? pupilX : 0,
                    y: isInteractive ? pupilY : 0,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
        </motion.div>
    );
};
