/**
 * @fileoverview This file contains utility functions for interacting with Firestore.
 * It centralizes the logic for performing database operations like saving
 * stories and subscriber information, using a shared Firebase app instance.
 */
"use client";

import { getFirestore, collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { app } from "./firebase";
import type { GameMode } from "./types";

const db = getFirestore(app);

interface StoryToSave {
    title: string;
    content: string;
    creatorId: string;
    mood?: string;
    styleMatch?: string;
    gameMode: GameMode;
}

export const saveStoryToFirestore = async (storyData: StoryToSave): Promise<string> => {
    try {
        const now = Timestamp.now();
        // Expire documents after 24 hours
        const expireAt = new Timestamp(now.seconds + 24 * 60 * 60, now.nanoseconds);

        const storyToSave = {
            ...storyData,
            createdAt: now,
            expireAt: expireAt,
        };
        
        const docRef = await addDoc(collection(db, "stories"), storyToSave);
        console.log("Story saved to Hall of Fame with ID: ", docRef.id);
        
        return docRef.id;
    } catch (e) {
        console.error("Error adding document to Hall of Fame: ", e);
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
        const docRef = await addDoc(collection(db, "subscribers"), {
            ...subscriberData,
            submissionTimestamp: serverTimestamp()
        });
        console.log("Subscriber saved with ID: ", docRef.id);
        return docRef;
    } catch (e) {
        console.error("Error adding subscriber document: ", e);
        throw new Error("Could not save subscriber to Firestore.");
    }
};
