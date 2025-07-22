/**
 * @fileoverview This file contains utility functions for interacting with Firestore.
 * It centralizes the logic for performing database operations like saving
 * stories and subscriber information, using a shared Firebase app instance.
 */
"use client";

import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "./firebase"; // Import the initialized app
import type { StoryPart, GameAnalysis } from "./types";

const db = getFirestore(app);

// Helper function to sanitize data for Firestore
const sanitizeForFirestore = (data: any): any => {
  if (data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item));
  }
  if (typeof data === 'object' && data !== null && !(data instanceof Date) && Object.getPrototypeOf(data) === Object.prototype) {
    const sanitizedObject: { [key: string]: any } = {};
    for (const key in data) {
      // We only want to sanitize own properties, not properties from the prototype chain.
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        // Firestore cannot store 'undefined' values. We convert them to 'null'.
        if (value !== undefined) {
          sanitizedObject[key] = sanitizeForFirestore(value);
        }
      }
    }
    return sanitizedObject;
  }
  return data;
};

interface StoryToSave {
    transcript: StoryPart[];
    analysis: Omit<GameAnalysis, 'storyId'>;
    trope: string;
    title: string;
}

export const saveStoryToFirestore = async (storyData: StoryToSave): Promise<string> => {
    try {
        const sanitizedStoryData = sanitizeForFirestore(storyData);
        const docRef = await addDoc(collection(db, "stories"), {
            ...sanitizedStoryData,
            createdAt: serverTimestamp(),
        });
        console.log("Story saved with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Could not save story to Firestore.");
    }
};

interface SubscriberData {
    name: string;
    email: string;
    storyId: string;
}

export const saveSubscriberToFirestore = async (subscriberData: SubscriberData) => {
    try {
        const sanitizedSubscriberData = sanitizeForFirestore(subscriberData);
        const docRef = await addDoc(collection(db, "subscribers"), {
            ...sanitizedSubscriberData,
            submissionTimestamp: serverTimestamp()
        });
        console.log("Subscriber saved with ID: ", docRef.id);
        return docRef;
    } catch (e) {
        console.error("Error adding subscriber document: ", e);
        throw new Error("Could not save subscriber to Firestore.");
    }
};
