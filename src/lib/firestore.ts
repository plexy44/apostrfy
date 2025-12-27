/**
 * @fileoverview This file contains utility functions for interacting with Firestore.
 * It centralizes the logic for performing database operations like saving
 * stories and subscriber information, using a shared Firebase app instance.
 */
"use client";

import { getFirestore, collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

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
