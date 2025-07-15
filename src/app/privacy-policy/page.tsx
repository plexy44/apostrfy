/**
 * @fileoverview This page outlines the application's privacy policy.
 * It serves as a placeholder for official legal content.
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

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-foreground/80 space-y-4">
          <p className="text-muted-foreground text-sm text-center">Last Updated: [Date]</p>
          <p>
            This is a placeholder for your Privacy Policy. In a real application, this page would detail how you collect, use, and protect user data. It's crucial for legal compliance and building trust with your users.
          </p>
          <h3 className="font-headline text-xl text-foreground">1. Data Collection</h3>
          <p>
            Specify what data you collect (e.g., user-generated content like stories, usage analytics, device information).
          </p>
          <h3 className="font-headline text-xl text-foreground">2. Data Usage</h3>
          <p>
            Explain why you collect this data (e.g., to power AI features, improve the app, display personalized ads).
          </p>
          <h3 className="font-headline text-xl text-foreground">3. Data Storage and Security</h3>
          <p>
            Describe how and where you store data and the security measures in place to protect it.
          </p>
          <h3 className="font-headline text-xl text-foreground">4. Third-Party Services</h3>
          <p>
            Disclose any third-party services you use that may collect data (e.g., Google Analytics, Google AdMob).
          </p>
          <h3 className="font-headline text-xl text-foreground">5. User Rights</h3>
          <p>
            Inform users of their rights regarding their data (e.g., right to access, right to deletion).
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
