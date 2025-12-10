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
        <CardContent className="prose prose-invert max-w-none text-foreground/80 space-y-4 text-base md:text-lg">
          <p>
            Welcome to Scriblox. We believe AI can never replace writers, but it can help you write. Our mission is to provide a tool that acts not as an author, but as a mirror to your own imagination and a partner in the dance of storytelling.
          </p>
          <p>
            Scriblox is more than just an app; it's a sanctuary for your thoughts. In a world of constant connection and performance, we offer a place to write not for an audience, but for yourself. It's a game of call and response, where you and your AI companion build worlds, one line at a time. There's no pressure and no judgment, just the pure flow of creation.
          </p>
          <p>
            Our AI is designed to be your creative companion, a reflection of your own style that is subtly infused with the spirits of great literary figures. It listens, adapts, and helps you uncover the stories waiting within you.
          </p>
          <p>
            Whether you have a few seconds or a few minutes, we invite you to co-create and see what you discover.
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
