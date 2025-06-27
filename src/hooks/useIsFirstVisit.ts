/**
 * @fileoverview This custom hook determines if a user is visiting for the first time
 * by checking for a specific key in the browser's `localStorage`.
 */
"use client";

import { useState, useEffect } from "react";

const VISIT_KEY = "apostrfy_has_visited";

export const useIsFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | undefined>(undefined);

  // This effect runs only once on the client-side after the component mounts,
  // which is the correct way to access browser-only APIs like localStorage to avoid hydration errors.
  useEffect(() => {
    // Check if running in a browser environment before accessing localStorage.
    if (typeof window === 'undefined') {
      return;
    }
    
    const hasVisited = window.localStorage.getItem(VISIT_KEY);
    
    // If the key is explicitly "true", the user has visited before.
    // In any other case (null or some other value), it's their first visit.
    setIsFirstVisit(hasVisited !== "true");
  }, []);

  const setHasVisited = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VISIT_KEY, "true");
      setIsFirstVisit(false);
    }
  };

  return { isFirstVisit, setHasVisited };
};
