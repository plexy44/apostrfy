/**
 * @fileoverview This custom hook manages the persistence of past stories.
 * It uses `localStorage` to save and retrieve a list of the user's most recent
 * creative sessions, enforcing a maximum limit on the number of stored stories.
 */
"use client";

import { useState, useEffect } from "react";
import type { PastStory, StoryPart, Trope } from "@/lib/types";

const PAST_STORIES_KEY = "apostrfy_past_stories_v1";
const MAX_STORIES = 5;

export const usePastStories = () => {
  const [pastStories, setPastStories] = useState<PastStory[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedStories = localStorage.getItem(PAST_STORIES_KEY);
        if (storedStories) {
          setPastStories(JSON.parse(storedStories));
        }
      } catch (error) {
        console.error("Failed to load past stories from local storage:", error);
        setPastStories([]);
      }
    }
  }, []);

  const saveStory = (storyToSave: { trope: Trope; duration: number; story: StoryPart[] }) => {
    if (typeof window !== 'undefined') {
      const newStory: PastStory = {
        ...storyToSave,
        id: new Date().toISOString(),
        timestamp: Date.now(),
      };

      const updatedStories = [newStory, ...pastStories].slice(0, MAX_STORIES);

      try {
        localStorage.setItem(PAST_STORIES_KEY, JSON.stringify(updatedStories));
        setPastStories(updatedStories);
      } catch (error) {
        console.error("Failed to save story to local storage:", error);
      }
    }
  };

  return { pastStories, saveStory };
};
