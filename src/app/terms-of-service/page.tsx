/**
 * @fileoverview This page outlines the application's terms of service.
 * It serves as a placeholder for official legal content.
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

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-foreground/80 space-y-4">
            <p className="text-muted-foreground text-sm text-center">Last Updated: [Date]</p>
            <p>
                This is a placeholder for your Terms of Service agreement. This document is a legally binding contract between you and your users. It should be drafted by a legal professional.
            </p>
            <h3 className="font-headline text-xl text-foreground">1. Acceptance of Terms</h3>
            <p>
                By using Apostrfy, users agree to be bound by these terms.
            </p>
            <h3 className="font-headline text-xl text-foreground">2. User-Generated Content</h3>
            <p>
                Define ownership of the stories created. Typically, users retain rights to their original contributions.
            </p>
            <h3 className="font-headline text-xl text-foreground">3. Prohibited Conduct</h3>
            <p>
                Outline what users are not allowed to do (e.g., reverse-engineer the app, input harmful or illegal content).
            </p>
            <h3 className="font-headline text-xl text-foreground">4. Disclaimers and Limitation of Liability</h3>
            <p>
                Standard legal clauses to limit your liability for any issues that may arise from the use of the app.
            </p>
            <h3 className="font-headline text-xl text-foreground">5. Termination</h3>
            <p>
                Explain the conditions under which you or the user can terminate the agreement.
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
