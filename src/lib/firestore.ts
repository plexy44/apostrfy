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

interface StoryToSave {
    transcript: StoryPart[];
    analysis: Omit<GameAnalysis, 'storyId'>;
    trope: string;
    title: string;
}

export const saveStoryToFirestore = async (storyData: StoryToSave): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, "stories"), {
            ...storyData,
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
    email: string;
    storyId: string;
}

export const saveSubscriberToFirestore = async (subscriberData: SubscriberData) => {
    try {
        // This simulates getting user metadata. In a real app, you'd want a more
        // robust way to get this, potentially from a server-side context.
        const metadata = {
            ipAddress: '127.0.0.1', // Placeholder
            browserType: navigator.userAgent,
            operatingSystem: navigator.platform,
        };

        const docRef = await addDoc(collection(db, "subscribers"), {
            ...subscriberData,
            submissionTimestamp: serverTimestamp(),
            metadata: metadata
        });
        console.log("Subscriber saved with ID: ", docRef.id);
        return docRef;
    } catch (e) {
        console.error("Error adding subscriber document: ", e);
        throw new Error("Could not save subscriber to Firestore.");
    }
};

    