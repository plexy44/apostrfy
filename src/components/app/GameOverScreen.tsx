/**
 * @fileoverview Renders the 'Sentiment Analysis' screen displayed after a session concludes.
 * It provides a comprehensive breakdown of the user's writing, including a mood
 * wheel, style matches, and evocative keywords, all in a responsive layout.
 * A key feature is the toggle allowing users to switch between the final,
 * AI-polished script and the original raw chat transcript.
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

interface GameOverScreenProps {
  analysis: GameAnalysis;
  onPlayAgain: () => void;
  onEmailSubmit: (email: string) => Promise<boolean>;
}

export default function GameOverScreen({ analysis, onPlayAgain, onEmailSubmit }: GameOverScreenProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEmailFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    
    const success = await onEmailSubmit(email);

    if (success) {
      setIsModalOpen(false);
    }
    
    setIsSubmitting(false);
  };


  const handleOpenEmailModal = () => {
    setIsModalOpen(true);
  }

  const AnalysisCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card className="bg-background/30 border-border/10 flex-1 min-w-0 md:min-w-[280px]">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="font-headline text-base md:text-xl text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">{children}</CardContent>
    </Card>
  );

  return (
    <motion.div 
      className="w-full max-w-6xl mx-auto flex flex-col items-center text-center p-2 md:p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <h2 className="font-script text-xl md:text-4xl text-foreground mb-4 text-center">
        &ldquo;{analysis.quoteBanner}&rdquo;
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          <AnalysisCard title="Mood">
            <MoodWheel mood={analysis.mood.primaryEmotion} score={analysis.mood.confidenceScore} />
          </AnalysisCard>
          <AnalysisCard title="Sentiment">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {analysis.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-xs md:text-sm px-2 py-1 md:px-3">
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
              <p className="text-muted-foreground text-xs md:text-sm mb-1">Primary Match</p>
              <p className="text-lg md:text-2xl font-bold font-headline text-foreground">{analysis.style.primaryMatch}</p>
              <p className="text-muted-foreground text-xs md:text-sm mt-3 mb-1">Secondary Match</p>
              <p className="text-sm md:text-lg text-foreground/80">{analysis.style.secondaryMatch}</p>
            </div>
          </AnalysisCard>
          {analysis.famousQuote && (
            <AnalysisCard title="A Word From...">
              <blockquote className="text-sm md:text-base italic border-l-4 border-accent pl-4 text-left leading-relaxed">
                {analysis.famousQuote.quote}
                <cite className="block text-right not-italic text-xs md:text-sm mt-2 text-muted-foreground">&ndash; {analysis.famousQuote.author}</cite>
              </blockquote>
            </AnalysisCard>
          )}
        </div>
      </div>
      
      {/* Script/Transcript Section */}
      <div className="w-full mb-4">
        <Card className="bg-background/30 border-border/10 flex flex-col h-full">
          <CardHeader className="text-center p-4">
            <CardTitle className="font-headline text-xl md:text-2xl text-foreground">{analysis.title}</CardTitle>
            <p className="text-sm text-muted-foreground font-sans">{analysis.trope}</p>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-2 md:p-6 pt-0">
            <Tabs defaultValue="script" className="flex-grow flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="script">Final Script</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>
              <TabsContent value="script" className="flex-grow mt-4">
                <ScrollArea className="h-64 md:h-96 w-full rounded-md border bg-secondary/20">
                  <div className="font-code text-sm md:text-base whitespace-pre-wrap p-4 md:p-8 lg:py-12 lg:pl-16 lg:pr-12 text-foreground text-left leading-relaxed">
                    {analysis.finalScript}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="transcript" className="flex-grow mt-4">
                 <ScrollArea className="h-64 md:h-96 w-full rounded-md border bg-secondary/20 p-4">
                  <div className="space-y-4">
                    {analysis.story.map((part, index) => (
                      <div key={index} className={`flex flex-col animate-fade-in-up ${part.speaker === 'ai' ? 'items-start' : 'items-end'}`}>
                        <div className={`p-3 rounded-xl max-w-[85%] ${part.speaker === 'ai' ? 'bg-secondary rounded-bl-none' : 'bg-primary/90 text-primary-foreground rounded-br-none'}`}>
                          <p className="text-sm">{part.line}</p>
                        </div>
                      </div>
                    ))}
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
        <Button onClick={onPlayAgain} size="lg" className="w-full">
          <RefreshCw />
          Play Again
        </Button>
        <Button onClick={handleOpenEmailModal} variant="outline" size="lg" className="w-full">
          <Mail />
          Email Story
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glassmorphism">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Receive Your Story</DialogTitle>
            <DialogDescription>
              Enter your email below to receive a copy of your co-created story.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" className="col-span-3" required disabled={isSubmitting} />
              </div>
               <p className="text-xs text-muted-foreground col-span-4 px-1 pt-2">
                By submitting, you agree to our terms and may receive future communications.
               </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
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
