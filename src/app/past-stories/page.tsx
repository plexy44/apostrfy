/**
 * @fileoverview This page displays stories that the user has saved to their device's local storage.
 * It uses the `usePastStories` hook to retrieve and render a list of past creative sessions,
 * allowing users to revisit their work.
 */
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { usePastStories } from '@/hooks/usePastStories';
import { logEvent } from '@/lib/analytics';
import type { PastStory } from '@/lib/types';
import { format } from 'date-fns';

export default function PastStoriesPage() {
  const { pastStories } = usePastStories();
  const [selectedStory, setSelectedStory] = useState<PastStory | null>(null);

  useEffect(() => {
    logEvent('screen_view', { screen_name: 'past_stories' });
  }, []);

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Past Stories</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Stories you've saved on this device. This data is not stored on our servers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pastStories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastStories.map((story) => (
                <Card key={story.id} className="bg-background/40 hover:bg-background/60 transition-colors flex flex-col">
                  <CardHeader>
                    <CardTitle className="font-headline text-lg">{story.trope}</CardTitle>
                    <CardDescription>
                      {format(new Date(story.timestamp), "MMMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex items-end">
                    <Button variant="outline" className="w-full" onClick={() => setSelectedStory(story)}>
                      View Story
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't saved any stories yet.</p>
              <p className="text-sm">When you quit a game, choose "Save and Quit" to see it here.</p>
            </div>
          )}
           <div className="text-center pt-8">
             <Link href="/" className="text-accent hover:underline">
                &larr; Back to the app
            </Link>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedStory} onOpenChange={(isOpen) => !isOpen && setSelectedStory(null)}>
        <DialogContent className="glassmorphism max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{selectedStory?.trope}</DialogTitle>
            <DialogDescription>
                {selectedStory && format(new Date(selectedStory.timestamp), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] rounded-md border bg-secondary/20 p-4 my-4">
             <div className="space-y-4 md:space-y-6">
              {selectedStory?.story.map((part, index) => (
                <div key={index} className={`flex flex-col animate-fade-in-up ${part.speaker === 'ai' ? 'items-start' : 'items-end'}`}>
                  <div className={`p-3 md:p-4 rounded-xl max-w-[85%] ${part.speaker === 'ai' ? 'bg-secondary rounded-bl-none' : 'bg-primary/90 text-primary-foreground rounded-br-none'}`}>
                    <p className="text-sm md:text-base">{part.line}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
