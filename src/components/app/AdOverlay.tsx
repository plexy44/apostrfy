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

  const handleClose = () => {
    // In a real ad SDK, you might get a callback for ad closed.
    // Here we just call the parent's onClose handler.
    onClose();
  }

  const handleAdLoad = () => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error in overlay:", err);
    }
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
          onAnimationComplete={handleAdLoad}
        >
          <div className="relative w-full max-w-md h-[80vh] bg-secondary rounded-lg flex flex-col items-center justify-center text-center border border-border shadow-2xl">
            
            <p className="text-muted-foreground text-sm mb-4">Advertisement</p>
            
            <div 
              className="w-11/12 h-4/5 bg-background flex items-center justify-center cursor-pointer p-4 text-center"
              onClick={handleAdClick}
            >
              <ins className="adsbygoogle"
                  style={{display:'block'}}
                  data-ad-client="ca-pub-7132522800049597"
                  data-ad-slot="9931548453"
                  data-ad-format="auto"
                  data-full-width-responsive="true"></ins>
            </div>
            
            <p className="text-muted-foreground text-xs mt-4 px-4">Ad Unit: Apostrfy Analysis Banner</p>

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full z-10 bg-background/50 hover:bg-background"
              onClick={handleClose}
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
