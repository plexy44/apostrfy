/**
 * @fileoverview This component renders the "Sentiment Analysis" screen after a session.
 * It displays a comprehensive breakdown of the user's writing, including a mood wheel,
 * style matches, and evocative keywords, all based on AI analysis.
 */

"use client";

import { useState } from "react";
import type { GameAnalysis } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw, Send } from "lucide-react";
import { motion } from "framer-motion";
import MoodWheel from "./MoodWheel";

interface GameOverScreenProps {
  analysis: GameAnalysis;
  onPlayAgain: () => void;
}

export default function GameOverScreen({ analysis, onPlayAgain }: GameOverScreenProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically trigger a Firebase Cloud Function.
    // For this example, we'll just show a success toast.
    toast({
      title: "Success!",
      description: "Your story has been sent to your email.",
    });
    setIsModalOpen(false);
  };

  const AnalysisCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card className="bg-background/30 border-border/10 flex-1 min-w-[280px]">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <motion.div 
      className="w-full max-w-6xl mx-auto flex flex-col items-center text-center p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <h2 className="font-script text-4xl text-foreground mb-6 text-center">
        &ldquo;{analysis.quoteBanner}&rdquo;
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-6">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AnalysisCard title="Mood">
            <MoodWheel mood={analysis.mood.primaryEmotion} score={analysis.mood.confidenceScore} />
          </AnalysisCard>

          <AnalysisCard title="Sentiment">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {analysis.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-sm px-3 py-1 cursor-default">
                  {keyword}
                </Badge>
              ))}
            </div>
          </AnalysisCard>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AnalysisCard title="Style">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Primary Match</p>
              <p className="text-2xl font-bold font-headline text-foreground">{analysis.style.primaryMatch}</p>
              <p className="text-muted-foreground text-sm mt-4 mb-1">Secondary Match</p>
              <p className="text-lg text-foreground/80">{analysis.style.secondaryMatch}</p>
            </div>
          </AnalysisCard>
          
          {analysis.famousQuote && (
            <AnalysisCard title="A Word From...">
              <blockquote className="text-lg italic border-l-4 border-accent pl-4 text-left">
                {analysis.famousQuote.quote}
                <cite className="block text-right not-italic text-sm mt-2 text-muted-foreground">&ndash; {analysis.famousQuote.author}</cite>
              </blockquote>
            </AnalysisCard>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
           <Card className="bg-background/30 border-border/10 flex flex-col h-full">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-foreground">Final Transcript</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <ScrollArea className="h-96 w-full rounded-md border bg-secondary/20 p-4">
                <div className="font-code text-sm whitespace-pre-wrap px-2 py-2 text-foreground">
                  <p className="font-bold uppercase text-center mb-6">INT. A FADING MEMORY - DAY</p>
                  
                  {analysis.finalScript.split('\n').map((line, index) => {
                    if (line.trim() === '') return <div key={index} className="h-4" />;
                    
                    const characterRegex = /^([A-Z][A-Z0-9\s().-]*):\s*(.*)/s;
                    const match = line.match(characterRegex);

                    if (match) {
                      const character = match[1].trim();
                      const dialogue = match[2].trim();
                      return (
                        <div key={index} className="grid grid-cols-1 justify-items-center mb-4">
                          <div className="w-full max-w-sm">
                            <p className="text-center font-bold uppercase">
                              {character}
                            </p>
                            <p className="text-left">
                              {dialogue}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={index} className="grid grid-cols-1 justify-items-center mb-4">
                        <div className="w-full max-w-lg">
                          <p className="text-left">
                            {line}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <p className="text-center font-bold uppercase mt-6">FADE OUT.</p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
        <Button onClick={onPlayAgain} size="lg">
          <RefreshCw />
          Play Again
        </Button>
        <Button onClick={() => setIsModalOpen(true)} variant="outline" size="lg">
          <Mail />
          Email Story
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glassmorphism">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Email Story Transcript</DialogTitle>
            <DialogDescription>
              Enter your details below to receive a copy of your co-created story.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" placeholder="Alex" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" placeholder="alex@example.com" className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">
                <Send />
                Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
