"use client";

import { useState, useEffect } from "react";

const VISIT_KEY = "apostrfy_has_visited_v4";

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
