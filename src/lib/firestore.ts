/**
 * @fileoverview This file contains utility functions for interacting with Firestore.
 * It centralizes the logic for initializing Firebase and performing database
 * operations like saving stories and subscriber information.
 */
"use client";

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { StoryPart, GameAnalysis } from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

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
