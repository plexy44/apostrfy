/**
 * @fileoverview This custom hook determines if a user is visiting the application for the first time
 * by checking for a specific key in the browser's localStorage. It helps in deciding
 * whether to show an onboarding flow or proceed directly to the main content.
 */
"use client";

import { useState, useEffect } from "react";

const VISIT_KEY = "scriblox_has_visited_v1";

export const useIsFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // This effect runs only on the client-side
    if (typeof window !== "undefined") {
        try {
            const hasVisited = localStorage.getItem(VISIT_KEY);
            setIsFirstVisit(hasVisited === null);
        } catch (error) {
            console.error("Could not access localStorage:", error);
            // Fallback for environments where localStorage is blocked
            setIsFirstVisit(true);
        }
    }
  }, []);

  const setHasVisited = () => {
    if (typeof window !== "undefined") {
        try {
            localStorage.setItem(VISIT_KEY, "true");
            setIsFirstVisit(false); // Update state to reflect the change immediately
        } catch (error) {
            console.error("Could not set localStorage item:", error);
        }
    }
  };

  return { isFirstVisit, setHasVisited };
};
