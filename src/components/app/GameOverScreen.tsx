/**
 * @fileoverview This component renders the "Sentiment Analysis" screen after a session.
 * It displays a comprehensive breakdown of the user's writing, including a mood wheel,
 * style matches, and evocative keywords, all based on AI analysis.
 */

"use client";

import { useState } from "react";
import type { StoryPart, GameAnalysis } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw, Send, Users, BookOpen, Quote, BrainCircuit, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import MoodWheel from "./MoodWheel";
import { Separator } from "../ui/separator";

interface GameOverScreenProps {
  story: StoryPart[];
  analysis: GameAnalysis;
  onPlayAgain: () => void;
}

export default function GameOverScreen({ story, analysis, onPlayAgain }: GameOverScreenProps) {
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

  const AnalysisCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <Card className="bg-background/30 border-border/10 flex-1 min-w-[280px]">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        {icon}
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
          <AnalysisCard icon={<BrainCircuit className="text-accent" />} title="Mood Analysis">
            <MoodWheel mood={analysis.mood.primaryEmotion} score={analysis.mood.confidenceScore} />
          </AnalysisCard>

          <AnalysisCard icon={<Sparkles className="text-accent" />} title="Story Keywords">
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
          <AnalysisCard icon={<Users className="text-accent" />} title="Style Match">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Primary Match</p>
              <p className="text-2xl font-bold font-headline text-foreground">{analysis.style.primaryMatch}</p>
              <p className="text-muted-foreground text-sm mt-4 mb-1">Secondary Match</p>
              <p className="text-lg text-foreground/80">{analysis.style.secondaryMatch}</p>
            </div>
          </AnalysisCard>
          
          {analysis.famousQuote && (
            <AnalysisCard icon={<Quote className="text-accent" />} title="A Word From...">
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
            <CardHeader className="flex-row items-center gap-3">
              <BookOpen className="text-accent" />
              <CardTitle className="font-headline text-xl text-foreground">Final Transcript</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <ScrollArea className="h-96 w-full rounded-md border p-4 text-left">
                <div className="space-y-4">
                  {story.map((part, index) => (
                    <div key={index} className={`flex ${part.speaker === "ai" ? "justify-start" : "justify-end"}`}>
                      <p className={`max-w-[80%] p-3 rounded-lg ${part.speaker === "ai" ? "bg-secondary" : "bg-primary/80 text-primary-foreground"}`}>
                        {part.line}
                      </p>
                    </div>
                  ))}
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
