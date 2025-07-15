/**
 * @fileoverview This page outlines the application's terms of service, covering user rights, content ownership, and disclaimers.
 */
"use client";

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { logEvent } from '@/lib/analytics';

export default function TermsOfServicePage() {
  useEffect(() => {
    logEvent('screen_view', { screen_name: 'terms_of_service' });
  }, []);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 md:py-12 px-4">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-headline text-center">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-foreground/80 space-y-4 text-sm md:text-base">
            <p className="text-muted-foreground text-sm text-center">Last Updated: {getCurrentDate()}</p>
            <p>
                By using the Apostrfy application ("the app"), you agree to be bound by these Terms of Service. Please read them carefully.
            </p>
            <h3 className="font-headline text-lg md:text-xl text-foreground">1. The Service</h3>
            <p>
                Apostrfy provides a collaborative creative writing experience. It is designed for entertainment, inspiration, and personal exploration. And most importantly, to have fun.
            </p>
            <h3 className="font-headline text-lg md:text-xl text-foreground">2. User-Generated Content</h3>
            <p>
                You retain all ownership rights to the original content you create within the app. By using the service, you grant Apostrfy a license to use, store, and modify your content to provide the app's features (such as generating AI responses and creating your final story analysis).
            </p>
            <h3 className="font-headline text-lg md:text-xl text-foreground">3. Email Communications</h3>
            <p>
                If you choose to provide your email address to receive your story, you consent to us sending you that email. We will not use your email for marketing purposes unless you explicitly opt-in to such communications in the future.
            </p>
            <h3 className="font-headline text-lg md:text-xl text-foreground">4. Third-Party Advertisements</h3>
            <p>
                The app is supported by advertising. We display ads from third-party networks. We are not responsible for the content of these advertisements or the practices of the advertisers. Your interactions with any ads are solely between you and the advertiser.
            </p>
            <h3 className="font-headline text-lg md:text-xl text-foreground">5. Disclaimers and Limitation of Liability</h3>
            <p>
                The app is provided "as is" without any warranties. We do not guarantee that it will always be secure, error-free, or function without disruptions. To the fullest extent permitted by law, Apostrfy shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.
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
