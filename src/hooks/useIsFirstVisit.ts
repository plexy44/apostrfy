/**
 * @fileoverview This custom hook determines if a user is visiting for the first time.
 * FOR TESTING: This has been modified to ALWAYS show the onboarding flow on every visit.
 */
"use client";

import { useState, useEffect } from "react";

export const useIsFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Always trigger onboarding for testing purposes.
    // The initial `undefined` state is important to prevent hydration mismatches.
    setIsFirstVisit(true);
  }, []);

  const setHasVisited = () => {
    // This function is called when onboarding completes, but we do nothing here
    // to ensure onboarding appears again on the next visit.
  };

  return { isFirstVisit, setHasVisited };
};
