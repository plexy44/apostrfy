/**
 * @fileoverview This custom hook determines if a user is visiting for the first time.
 * It checks for a specific key in the browser's `localStorage`.
 * To facilitate easier testing and development, it includes a special condition
 * to always treat a visit as the "first visit" when in a development environment,
 * ensuring the onboarding flow is always shown.
 */

"use client";

import { useState, useEffect } from "react";

const VISIT_KEY = "apostrfy_has_visited_prod_v1_final_final";

export const useIsFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // In development, we always want to show the onboarding for testing purposes.
    if (process.env.NODE_ENV === 'development') {
      setIsFirstVisit(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem(VISIT_KEY);
      setIsFirstVisit(hasVisited !== "true");
    }
  }, []);

  const setHasVisited = () => {
    // In development, this just updates the state for the current session.
    if (process.env.NODE_ENV === 'development') {
        setIsFirstVisit(false);
        return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(VISIT_KEY, "true");
      setIsFirstVisit(false);
    }
  };

  return { isFirstVisit, setHasVisited };
};
