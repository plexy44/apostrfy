/**
 * @fileoverview This component renders a full-screen overlay for displaying ads.
 * It provides a placeholder for an interstitial ad unit and includes a close
 * button that simulates dismissing the ad.
 */

"use client";

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { logEvent } from '@/lib/analytics';

interface AdOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AdOverlay({ isVisible, onClose }: AdOverlayProps) {
  const hasPushedAd = useRef(false);

  useEffect(() => {
    // Reset the ad push tracker when the overlay is hidden
    if (!isVisible) {
      hasPushedAd.current = false;
      return;
    }

    // If the ad is visible and we haven't pushed yet, push the ad.
    if (isVisible && !hasPushedAd.current) {
      // Use a timeout to ensure the ad container is rendered and has dimensions
      const adLoadTimer = setTimeout(() => {
        try {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            console.log('Pushing ad to Google.');
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            hasPushedAd.current = true; // Mark that we've pushed the ad
            logEvent('ad_impression', { ad_platform: 'google_admob', ad_source: 'admob', ad_format: 'interstitial', ad_unit_name: 'quit_game_interstitial' });
          }
        } catch (err) {
          console.error("AdSense error in overlay:", err);
          logEvent('ad_load_failed', { ad_unit_name: 'quit_game_interstitial', error_message: (err as Error).message });
        }
      }, 150); // Increased delay slightly for more stability

      return () => clearTimeout(adLoadTimer);
    }
  }, [isVisible]);


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
              className="w-11/12 h-4/5 bg-background flex items-center justify-center cursor-pointer p-4 text-center"
            >
              <ins className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client="ca-pub-7132522800049597"
                  data-ad-slot="9931548453"
                  data-ad-format="auto"
                  data-full-width-responsive="true"></ins>
            </div>
            
            <p className="text-muted-foreground text-xs mt-4 px-4">Ad Unit: Scriblox Analysis Banner</p>

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
