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
  const adPushedRef = useRef(false);

  useEffect(() => {
    // When the overlay becomes visible, and we haven't pushed an ad yet for this instance
    if (isVisible && !adPushedRef.current) {
      adPushedRef.current = true; // Immediately mark as attempting to push

      // Use a slightly longer timeout to ensure the ad container is rendered and has dimensions
      const adLoadTimer = setTimeout(() => {
        try {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            console.log('Pushing ad to Google.');
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            logEvent('ad_impression', { ad_platform: 'google_admob', ad_source: 'admob', ad_format: 'interstitial', ad_unit_name: 'interstitial_ad' });
          }
        } catch (err) {
          console.error("AdSense error in overlay:", err);
          logEvent('ad_load_failed', { ad_unit_name: 'interstitial_ad', error_message: (err as Error).message });
        }
      }, 200); // Increased delay for more stability

      return () => clearTimeout(adLoadTimer);
    } else if (!isVisible) {
      // Reset the ref when the overlay is hidden, so it can be shown again
      adPushedRef.current = false;
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
            
            <p className="text-muted-foreground text-xs mt-4 px-4">Ad Unit: Scriblox Interstitial</p>

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
