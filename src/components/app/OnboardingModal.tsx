/**
 * @fileoverview This component manages the multi-step onboarding experience for new users.
 * It presents a series of modals that explain the app's concept and functionality.
 * The component uses Framer Motion for smooth transitions between steps and includes
 * special content elements like the app logo and a shared layout animation for the Orb.
 */

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ONBOARDING_CONTENT } from '@/lib/constants';
import ScribloxLogo from '../icons/ScribloxLogo';
import Orb from './Orb';

interface OnboardingModalProps {
  onComplete: () => void;
}

const DialogueAnimation = () => (
    <div className="space-y-2 my-4 w-48 md:w-56 text-sm">
        <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0, transition: {delay: 0.2}}} className="p-2 bg-secondary rounded-lg text-left">I'll start...</motion.div>
        <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0, transition: {delay: 0.7}}} className="p-2 bg-primary/80 text-primary-foreground rounded-lg text-right">You reply.</motion.div>
        <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0, transition: {delay: 1.2}}} className="p-2 bg-secondary rounded-lg text-left">We create.</motion.div>
    </div>
);


export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = ONBOARDING_CONTENT.length;
  const { title, text, special } = ONBOARDING_CONTENT[currentStep - 1];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const renderSpecialContent = () => {
    if (!special) return null;
    switch(special) {
        case 'logo': return <ScribloxLogo className="w-36 md:w-48 h-auto my-4 text-foreground"/>
        case 'dialogue': return <DialogueAnimation />;
        case 'orb': return <Orb layoutId="main-orb" size="small" isInteractive={false} className="my-4" />;
        default: return null;
    }
  }

  return (
    <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full max-w-sm md:max-w-md glassmorphism rounded-2xl p-6 md:p-8 text-center flex flex-col items-center"
        >
          {renderSpecialContent()}
          <h2 className="font-headline text-2xl md:text-3xl mb-4 text-foreground">{ONBOARDING_CONTENT[currentStep - 1].title}</h2>
          <p className="text-foreground/80 mb-8 h-24 text-sm md:text-base">{text}</p>

          <div className="flex items-center justify-center space-x-2 my-4">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors ${i + 1 === currentStep ? 'bg-accent' : 'bg-muted'}`}
              />
            ))}
          </div>

          <Button onClick={handleNext} size="lg" className="w-full font-headline text-base md:text-lg h-12 md:h-14">
            {currentStep === totalSteps ? 'Play' : 'Next'}
          </Button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
