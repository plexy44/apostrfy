"use client";

import { useState, useEffect } from "react";

const VISIT_KEY = "apostrfy_has_visited_prod_v1";

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
