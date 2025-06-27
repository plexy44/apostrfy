/**
 * @fileoverview This is the root loading boundary for the Next.js application.
 * It ensures that the initial load screen is consistent with the in-app loading screens
 * by using the standardized `LoadingScreen` component.
 */
"use client";
import LoadingScreen from '@/components/app/LoadingScreen';

export default function Loading() {
  return <LoadingScreen />;
}
