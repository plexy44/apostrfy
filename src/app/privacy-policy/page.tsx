/**
 * @fileoverview This page outlines the application's privacy policy, detailing data collection, usage, and user rights.
 */
"use client";

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { logEvent } from '@/lib/analytics';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    logEvent('screen_view', { screen_name: 'privacy_policy' });
  }, []);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 md:py-12 px-4">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-headline text-center">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-foreground/80 space-y-4 text-sm md:text-base">
          <p className="text-muted-foreground text-sm text-center">Last Updated: {getCurrentDate()}</p>
          <p>
            Welcome to Apostrfy. We are committed to protecting your privacy and providing a transparent experience. This policy outlines how we handle your information.
          </p>
          <h3 className="font-headline text-lg md:text-xl text-foreground">1. Information We Collect</h3>
          <p>
            <strong>User-Generated Content:</strong> We store the stories you create during your sessions, including your contributions and the AI's responses. This is essential for the core functionality of the app and for features like the end-of-game analysis.
          </p>
          <p>
            <strong>Email Address (Optional):</strong> We only collect your email address if you voluntarily provide it through the "Email Story" feature. Its sole purpose is to send you a copy of your completed story.
          </p>
           <p>
            <strong>Usage Analytics:</strong> We use Google Analytics to collect anonymous data about how you interact with our app (e.g., which features are used, session durations). This helps us understand what's working and how to improve the experience. This data is aggregated and does not personally identify you.
          </p>

          <h3 className="font-headline text-lg md:text-xl text-foreground">2. How We Use Your Information</h3>
           <p>
            Your information is used to:
          </p>
          <ul>
            <li>Power the collaborative writing experience.</li>
            <li>Generate your end-of-session analysis.</li>
            <li>Send your story to your email address, upon your request.</li>
            <li>Improve and optimize the application based on usage patterns.</li>
          </ul>

          <h3 className="font-headline text-lg md:text-xl text-foreground">3. Third-Party Services & Advertising</h3>
          <p>
            Apostrfy displays advertisements from third-party networks, such as Google AdSense. These services may use cookies and other technologies to collect information and serve ads they deem relevant. We do not share your user-generated stories or email address with our ad partners. Please be aware that we are not responsible for the privacy practices of these third-party services.
          </p>

          <h3 className="font-headline text-lg md:text-xl text-foreground">4. Data Storage and Security</h3>
          <p>
            Your story data and any provided email address are stored on secure servers managed by Google Firebase. We take reasonable measures to protect your information, but no online service is 100% secure.
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
