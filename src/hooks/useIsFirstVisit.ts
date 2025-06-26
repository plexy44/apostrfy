"use client";

import { useState, useEffect } from "react";

const VISIT_KEY = "apostrfy_has_visited_v2";

export const useIsFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const hasVisited = localStorage.getItem(VISIT_KEY);
    setIsFirstVisit(hasVisited !== "true");
  }, []);

  const setHasVisited = () => {
    localStorage.setItem(VISIT_KEY, "true");
    setIsFirstVisit(false);
  };

  return { isFirstVisit, setHasVisited };
};
