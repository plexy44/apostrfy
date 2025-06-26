/**
 * @fileoverview This component renders the screen displayed after a story session ends.
 * It shows the final story transcript, an AI-generated "Sentiment Snapshot",
 * and provides options for the user to play again or to email the story transcript.
 */

"use client";

import { useState } from "react";
import type { StoryPart } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw, Send } from "lucide-react";

interface GameOverScreenProps {
  story: StoryPart[];
  sentiment: {
    snapshot: string;
    emotions: string[];
  };
  onPlayAgain: () => void;
}

export default function GameOverScreen({ story, sentiment, onPlayAgain }: GameOverScreenProps) {
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

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center animate-fade-in">
      <Card className="w-full glassmorphism">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-foreground">Sentiment Snapshot</CardTitle>
          <CardDescription className="text-lg pt-2">
            &ldquo;{sentiment.snapshot}&rdquo;
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {sentiment.emotions.map((emotion) => (
              <Badge key={emotion} variant="secondary" className="text-sm px-3 py-1 cursor-default">
                {emotion}
              </Badge>
            ))}
          </div>

          <ScrollArea className="h-48 w-full rounded-md border p-4 text-left">
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
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={onPlayAgain} size="lg">
            <RefreshCw />
            Play Again
          </Button>
          <Button onClick={() => setIsModalOpen(true)} variant="outline" size="lg">
            <Mail />
            Email Story
          </Button>
        </CardFooter>
      </Card>

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
    </div>
  );
}
