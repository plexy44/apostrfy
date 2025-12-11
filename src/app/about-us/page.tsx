/**
 * @fileoverview This page contains information about the Scriblox application,
 * explaining its purpose and mission.
 *
 * - AboutUsPage - The component that renders the about us page.
 */
"use client";

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { logEvent } from '@/lib/analytics';
import { Separator } from '@/components/ui/separator';

export default function AboutUsPage() {
  useEffect(() => {
    logEvent('screen_view', { screen_name: 'about_us' });
  }, []);

  return (
    <div className="container mx-auto max-w-3xl md:max-w-4xl py-8 md:py-12 px-4">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl md:text-4xl font-headline text-center">About Scriblox</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-foreground/80 space-y-4 text-sm md:text-lg">
          <p>
            Welcome to Scriblox. We believe AI can never replace writers, but it can help you write. Our mission is to provide a tool that acts not as an author, but as a mirror to your own imagination and a partner in the dance of storytelling.
          </p>
          <p>
            Scriblox is more than just an app; it's a sanctuary for your thoughts. In a world of constant connection and performance, we offer a place to write not for an audience, but for yourself. It's a game of call and response, where you and your AI companion build worlds, one line at a time. There's no pressure and no judgment, just the pure flow of creation.
          </p>
          <p>
            Our AI is designed to be your creative companion, a reflection of your own style that is subtly infused with the spirits of great literary figures. It listens, adapts, and helps you uncover the stories waiting within you.
          </p>

          <Separator className="my-6 bg-border/20" />

          <h3 className="font-headline text-xl md:text-3xl text-foreground text-center">Game Rules</h3>

          <h4 className="font-headline text-lg md:text-2xl text-foreground">The Gameplay</h4>
          <p>
            The core of Scriblox is a simple exchange. The AI provides an opening line, and you reply to continue the story. The AI will then respond to your line, and this back-and-forth continues until the timer runs out. Your goal is simply to create, to follow your intuition, and to see where the narrative takes you.
          </p>

          <h4 className="font-headline text-lg md:text-2xl text-foreground">Gameplay Modes</h4>
          <ul className="space-y-2">
            <li><strong>Lightning (30s):</strong> A quick burst of creativity. Perfect for a single, powerful exchange of ideas.</li>
            <li><strong>Minute (60s):</strong> The standard mode. Enough time to develop a small scene or a potent moment.</li>
            <li><strong>Dragon Chasing (120s):</strong> A challenge of endurance. In this mode, the timer constantly depletes, but you can add time back by writing. Quick, thoughtful responses of more than a few words will restore your "flow" and keep the session going.</li>
            <li><strong>Simulate:</strong> Not a game, but an observation. Watch two AI personas, inspired by literary figures, write a story together based on a chosen style.</li>
          </ul>

          <h4 className="font-headline text-lg md:text-2xl text-foreground">The Analysis</h4>
          <p>
            When your session ends, Scriblox analyzes your writing. You'll be presented with an end screen that includes:
          </p>
          <ul className="space-y-2">
            <li><strong>Mood Analysis:</strong> A "mood wheel" that identifies the primary emotion of your story.</li>
            <li><strong>Style Match:</strong> An identification of which two inspirational figures your writing style most closely resembles.</li>
            <li><strong>Thematic Keywords:</strong> A set of conceptual keywords that capture the essence of your narrative.</li>
            <li><strong>Final Script:</strong> A polished, combined version of your story, corrected for grammar and formatted like a novel excerpt.</li>
            <li><strong>Transcript:</strong> The raw, turn-by-turn chat log of your session.</li>
          </ul>
          <p>
            From here, you have the ability to have the story emailed to you or share it with others.
          </p>

          <div className="text-center pt-4">
             <Link href="/" className="text-accent hover:underline">
                &larr; Back to the app
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
