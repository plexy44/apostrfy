/**
 * @fileoverview This component renders a full-screen overlay for displaying ads.
 * It provides a placeholder for an interstitial ad unit and includes a close
 * button that simulates dismissing the ad.
 */

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { logEvent } from '@/lib/analytics';

interface AdOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AdOverlay({ isVisible, onClose }: AdOverlayProps) {
  const handleAdClick = () => {
    logEvent('ad_click', { ad_format: 'interstitial', ad_unit_name: 'mid_game_interstitial' });
    // In a real app, this might navigate to the ad's destination URL
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative w-full max-w-md h-[80vh] bg-secondary rounded-lg flex flex-col items-center justify-center text-center border border-border shadow-2xl">
            
            <p className="text-muted-foreground text-sm mb-4">Advertisement</p>
            
            <div 
              className="w-11/12 h-4/5 bg-background flex items-center justify-center cursor-pointer"
              data-ai-hint="advertisement"
              onClick={handleAdClick}
            >
              <p className="font-bold text-2xl text-foreground">Placeholder for Ad Unit 4</p>
            </div>
            
            <p className="text-muted-foreground text-xs mt-4">Ad placeholder ID: ca-app-pub-3940256099942544/1033173712</p>

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full z-10 bg-background/50 hover:bg-background"
              onClick={onClose}
              aria-label="Close ad"
            >
              <X />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
