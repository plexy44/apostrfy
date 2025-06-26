"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ONBOARDING_CONTENT } from '@/lib/constants';
import ApostrfyLogo from '../icons/ApostrfyLogo';

interface OnboardingModalProps {
  onComplete: () => void;
}

const OrbAnimation = () => (
  <div className="w-24 h-24 my-4">
    <motion.div
      className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent/70"
      animate={{
        scale: [1, 1.1, 1, 1.1, 1],
        boxShadow: ["0 0 20px rgba(143, 0, 255, 0.2)", "0 0 30px rgba(143, 0, 255, 0.4)", "0 0 20px rgba(143, 0, 255, 0.2)", "0 0 30px rgba(143, 0, 255, 0.4)", "0 0 20px rgba(143, 0, 255, 0.2)"],
      }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

const DialogueAnimation = () => (
    <div className="space-y-2 my-4 w-48">
        <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0, transition: {delay: 0.2}}} className="text-xs p-2 bg-secondary rounded-lg text-left">I'll start...</motion.div>
        <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0, transition: {delay: 0.7}}} className="text-xs p-2 bg-primary/80 text-primary-foreground rounded-lg text-right">You reply.</motion.div>
        <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0, transition: {delay: 1.2}}} className="text-xs p-2 bg-secondary rounded-lg text-left">We create.</motion.div>
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
        case 'logo': return <ApostrfyLogo className="w-48 h-auto my-4 text-foreground"/>
        case 'dialogue': return <DialogueAnimation />;
        case 'orb': return <OrbAnimation />;
        default: return null;
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full max-w-md glassmorphism rounded-2xl p-8 text-center flex flex-col items-center"
        >
          {renderSpecialContent()}
          {special !== 'logo' && <h2 className="font-headline text-3xl mb-4 text-accent">{title}</h2>}
          <p className="text-foreground/80 mb-8 h-20">{text}</p>

          <div className="flex items-center justify-center space-x-2 my-4">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i + 1 === currentStep ? 'bg-accent' : 'bg-muted'}`}
              />
            ))}
          </div>

          <Button onClick={handleNext} size="lg" className="w-full font-headline text-lg">
            {currentStep === totalSteps ? 'Play' : 'Next'}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
