/**
 * @fileoverview This page serves as a fallback for the client-side `/analysis`
 * route. If a user refreshes the page or navigates here directly, it redirects
 * them to the main menu to prevent a 404 error, as the analysis data exists
 * only in the client's state during an active session.
 */
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/app/LoadingScreen';

export default function AnalysisRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect the user to the main menu immediately.
    router.replace('/');
  }, [router]);

  // Show a loading screen while the redirect is happening.
  return <LoadingScreen />;
}
