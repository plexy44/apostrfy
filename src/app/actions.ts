/**
 * @fileoverview This file defines the Next.js server actions for the application.
 * Server actions provide a secure way for the client to trigger backend-only
 * operations, such as writing to Firestore with Admin privileges, without
 * exposing sensitive credentials to the client.
 */
'use server';

import { getAdminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import type { GameMode } from '@/lib/types';

interface StoryData {
  title: string;
  content: string;
  creatorId: string;
  mood?: string;
  styleMatch?: string;
  gameMode: GameMode;
}

/**
 * Saves a completed story to the public 'stories' collection in Firestore.
 * This action uses the Firebase Admin SDK, which bypasses all security rules,
 * allowing it to write to a collection that is read-only for clients. It also
 * enforces a 24-hour expiration time on the server.
 * @param storyData - The story data sent from the client.
 * @returns An object indicating success and the new document ID, or an error.
 */
export async function saveStory(storyData: StoryData) {
  if (!storyData.creatorId) {
    return { success: false, error: 'A user ID is required to save a story.' };
  }

  console.log("Server Action: Attempting to save story for user:", storyData.creatorId);

  try {
    const adminDb = getAdminDb();
    const now = Timestamp.now();
    // Expire documents after 24 hours
    const expireAt = new Timestamp(now.seconds + 24 * 60 * 60, now.nanoseconds);

    const storyToSave = {
      ...storyData,
      createdAt: now,
      expireAt: expireAt,
    };
    
    const docRef = await adminDb.collection('stories').add(storyToSave);
    
    console.log("Server Action: Success! Saved story with ID:", docRef.id);
    return { success: true, id: docRef.id };

  } catch (error) {
    console.error("Error in saveStory Server Action:", error);
    return { success: false, error: 'The story could not be saved to the Hall of Fame.' };
  }
}
