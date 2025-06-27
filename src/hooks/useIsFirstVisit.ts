/**
 * @fileoverview This custom hook determines if a user is visiting for the first time
 * by checking for a specific key in the browser's `localStorage`.
 */
"use client";

import { useState, useEffect } from "react";

const VISIT_KEY = "apostrfy_has_visited";

export const useIsFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem(VISIT_KEY);
      setIsFirstVisit(hasVisited !== "true");
    }
  }, []);

  const setHasVisited = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VISIT_KEY, "true");
      setIsFirstVisit(false);
    }
  };

  return { isFirstVisit, setHasVisited };
};
