/**
 * @fileoverview This component renders a full-screen overlay for displaying ads.
 * It provides a placeholder for an interstitial ad unit and includes a close
 * button that simulates dismissing the ad. It includes robust logic to prevent
 * ad-related crashes by ensuring the ad container is visible before loading.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logEvent } from '@/lib/analytics';

interface AdOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AdOverlay({ isVisible, onClose }: AdOverlayProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (!isVisible) {
        setAdLoaded(false);
        return;
    }

    const timer = setTimeout(() => {
      if (adRef.current && !adLoaded) {
        try {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            console.log('Pushing ad to Google...');
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            logEvent('ad_impression', { ad_platform: 'google_admob', ad_source: 'admob', ad_format: 'interstitial', ad_unit_name: 'interstitial_ad' });
            setAdLoaded(true);
          }
        } catch (error) {
          console.error("AdSense non-critical error:", error);
          logEvent('ad_load_failed', { ad_unit_name: 'interstitial_ad', error_message: (error as Error).message });
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isVisible, adLoaded]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 flex flex-col items-center">
        
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 hover:bg-white/10" 
            onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <h3 className="text-xl font-headline mb-4 text-center">Advertisement</h3>
        
        <div 
            ref={adRef} 
            className="w-full bg-white/5 rounded-md flex items-center justify-center overflow-hidden"
            style={{ minHeight: '280px', minWidth: '300px' }} 
        >
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '100%' }}
                data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
                data-ad-slot="9931548453"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Support Scriblox by viewing this message.
        </p>

        <Button onClick={onClose} className="mt-6 w-full">
          Close & Continue
        </Button>
      </div>
    </div>
  );
}
