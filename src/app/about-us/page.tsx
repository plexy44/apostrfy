/**
 * @fileoverview This page provides information about the Apostrfy application.
 * It serves as a placeholder for the "About Us" content.
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
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">About Apostrfy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-foreground/80 space-y-4">
          <p>
            Welcome to Apostrfy, a unique space for creative exploration and collaborative writing. Our mission is to provide a tool that acts as a mirror to your own imagination, a partner in the dance of storytelling.
          </p>
          <p>
            Apostrfy is more than just an app; it's a sanctuary for your thoughts. In a world of constant connection and performance, we offer a place to write not for an audience, but for yourself. It's a game of call and response, where you and your AI companion build worlds, one line at a time. There's no pressure, no judgment—just the pure flow of creation.
          </p>
          <p>
            Our AI is designed to be your creative partner, a reflection of your own style, subtly infused with the spirits of great literary figures. It listens, adapts, and helps you uncover the stories waiting within you.
          </p>
          <p>
            Whether you have a few seconds or a few minutes, we invite you to connect, co-create, and see what you discover.
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
