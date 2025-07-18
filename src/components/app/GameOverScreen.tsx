/**
 * @fileoverview Displays the sentiment analysis screen after a session. It
 * shows a mood wheel, style matches, keywords, and a toggle between the

 * final, AI-polished script and the raw chat transcript. Optimized for both
 * desktop and mobile views.
 */
"use client";

import { useState } from "react";
import type { GameAnalysis, StoryPart } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import MoodWheel from "./MoodWheel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface GameOverScreenProps {
  analysis: GameAnalysis;
  onPlayAgain: () => void;
  onEmailSubmit: (name: string, email: string) => Promise<boolean>;
}


const FinalScriptRenderer = ({ story }: { story: StoryPart[] }) => {
  return (
    <div className="font-code text-sm md:text-base whitespace-pre-wrap p-4 text-foreground text-left leading-relaxed" style={{ overflowWrap: 'break-word' }}>
      {story.map((part, index) => {
        if (part.isPaste) {
          return (
            <pre key={index} className="bg-black text-white p-3 my-2 rounded-md font-mono text-xs whitespace-pre-wrap overflow-x-auto">
              {part.line}
            </pre>
          );
        }
        return <span key={index}>{part.line + ' '}</span>;
      })}
    </div>
  );
};


export default function GameOverScreen({ analysis, onPlayAgain, onEmailSubmit }: GameOverScreenProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEmailFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    
    logEvent('email_story_submitted', { has_name: !!name.trim(), has_email: !!email.trim() });
    const success = await onEmailSubmit(name, email);

    if (success) {
      setIsModalOpen(false);
    }
    
    setIsSubmitting(false);
  };


  const handleOpenEmailModal = () => {
    logEvent('request_transcript', { email_provided: false });
    setIsModalOpen(true);
  }

  const AnalysisCard = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <Card className={cn("bg-background/30 border-border/10 flex-1 min-w-0", className)}>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="font-headline text-xl md:text-2xl text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">{children}</CardContent>
    </Card>
  );

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto flex flex-col items-center text-center p-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <h2 className="font-script text-2xl md:text-5xl text-foreground mb-4 md:mb-8 text-center">
        &ldquo;{analysis.quoteBanner}&rdquo;
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4 md:mb-6">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          <AnalysisCard title="Mood">
            <MoodWheel mood={analysis.mood.primaryEmotion} score={analysis.mood.confidenceScore} />
          </AnalysisCard>
          <AnalysisCard title="Sentiment">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {analysis.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-sm md:text-base px-3 py-1">
                  {keyword}
                </Badge>
              ))}
            </div>
          </AnalysisCard>
        </div>
        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <AnalysisCard title="Style">
            <div className="text-center">
              <p className="text-muted-foreground text-sm md:text-base mb-1">Primary Match</p>
              <p className="text-lg md:text-3xl font-bold font-headline text-foreground">{analysis.style.primaryMatch}</p>
              <p className="text-muted-foreground text-sm md:text-base mt-3 mb-1">Secondary Match</p>
              <p className="text-base md:text-xl text-foreground/80">{analysis.style.secondaryMatch}</p>
            </div>
          </AnalysisCard>
          {analysis.famousQuote && (
            <AnalysisCard title="A Word From...">
              <blockquote className="text-base md:text-lg italic border-l-4 border-accent pl-4 text-left leading-relaxed">
                {analysis.famousQuote.quote}
                <cite className="block text-right not-italic text-sm md:text-base mt-2 text-muted-foreground">&ndash; {analysis.famousQuote.author}</cite>
              </blockquote>
            </AnalysisCard>
          )}
        </div>
      </div>
      
      {/* Script/Transcript Section */}
      <div className="w-full mb-4">
        <Card className="bg-background/30 border-border/10 flex flex-col h-full">
          <CardHeader className="text-center p-4 md:p-6">
            <CardTitle className="font-headline text-xl md:text-3xl text-foreground">{analysis.title}</CardTitle>
            <p className="text-base md:text-lg text-muted-foreground font-sans">{analysis.trope}</p>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-2 md:p-6 pt-0">
            <Tabs defaultValue="script" className="flex-grow flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="script">Final Script</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>
              <TabsContent value="script" className="flex-grow mt-4">
                <ScrollArea className="h-64 md:h-96 w-full rounded-md border bg-secondary/20">
                    <FinalScriptRenderer story={analysis.story} />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="transcript" className="flex-grow mt-4">
                 <ScrollArea className="h-64 md:h-96 w-full rounded-md border bg-secondary/20 p-4">
                  <div className="space-y-4">
                    {analysis.story.map((part, index) => {
                      const isUserSpeaker = part.speaker === 'user';
                      
                      const speakerLabel = part.personaName
                        ? part.personaName
                        : isUserSpeaker ? 'You' : 'Apostrfy';
                      
                      const alignment = isUserSpeaker ? 'items-end' : 'items-start';
                      const bubbleStyles = isUserSpeaker
                          ? 'bg-primary/90 text-primary-foreground rounded-br-none'
                          : 'bg-secondary rounded-bl-none';
                      
                      if (part.isPaste) {
                         return (
                            <div key={index} className={`flex flex-col animate-fade-in-up items-start`}>
                                <p className={`text-xs text-muted-foreground mb-1 px-2 self-start`}>
                                    You (Pasted)
                                </p>
                                <pre className="bg-black text-white p-3 my-2 rounded-md font-mono text-xs whitespace-pre-wrap overflow-x-auto max-w-[85%] text-left">
                                  {part.line}
                                </pre>
                            </div>
                         )
                      }

                      return (
                        <div key={index} className={`flex flex-col animate-fade-in-up ${alignment}`}>
                          <p className={`text-xs text-muted-foreground mb-1 px-2 ${alignment === 'items-end' ? 'self-end' : 'self-start'}`}>
                            {speakerLabel}
                          </p>
                          <div className={`p-3 rounded-xl max-w-[85%] text-left ${bubbleStyles}`}>
                            <p className="text-sm md:text-base">{part.line}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

       {/* Ad Banner Placeholder */}
      <div className="w-full max-w-lg my-4">
        <div 
            className="h-24 bg-secondary rounded-lg flex items-center justify-center text-center text-muted-foreground border border-border"
            data-ai-hint="advertisement"
            onClick={() => logEvent('ad_click', { ad_format: 'banner', ad_unit_name: 'analysis_screen_banner' })}
        >
            <p className="text-sm">Ad Unit 2: Analysis Screen Banner <br />(ca-app-pub-3940256099942544/6300978111)</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-2 w-full max-w-md">
        <Button onClick={onPlayAgain} size="lg" className="w-full px-4 text-base md:text-lg">
          <RefreshCw />
          Play Again
        </Button>
        <Button onClick={handleOpenEmailModal} variant="outline" size="lg" className="w-full px-4 text-base md:text-lg">
          <Mail />
          Email Story
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glassmorphism md:max-w-xl md:p-8">
          <DialogHeader className="text-left">
            <DialogTitle className="font-headline text-2xl md:text-4xl">Receive Your Story</DialogTitle>
            <DialogDescription className="text-foreground/80">
              Enter your details below to receive a copy of your co-created story.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailFormSubmit}>
            <div className="grid grid-cols-1 gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="md:text-base">Name</Label>
                <Input id="name" name="name" placeholder="Your Name" className="h-10 md:h-12 md:text-base" disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="md:text-base">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" className="h-10 md:h-12 md:text-base" required disabled={isSubmitting} />
              </div>
               <p className="text-xs text-muted-foreground col-span-1 px-1 pt-2">
                By submitting, you agree to our terms and may receive future communications.
               </p>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row md:justify-center md:gap-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting} className="mt-2 sm:mt-0 md:h-12 md:px-8 md:text-lg md:flex-1">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="md:h-12 md:px-8 md:text-lg md:flex-1">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                {isSubmitting ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
