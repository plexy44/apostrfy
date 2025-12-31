/**
 * @fileoverview This file defines the Next.js server actions for the application.
 * Server actions provide a secure way for the client to trigger backend-only
 * operations, such as writing to Firestore with Admin privileges, without
 * exposing sensitive credentials to the client.
 */
'use server';

import { getAdminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import type { GameMode, Trope } from '@/lib/types';

interface StoryData {
  title: string;
  content: string; // Client sends 'content'
  creatorId: string;
  mood?: string;
  styleMatch?: string;
  gameMode: GameMode;
  trope: Trope | string | null; // Allow nulls
}

export async function saveStory(storyData: StoryData) {
  // 1. Validate User
  if (!storyData.creatorId) {
    console.error("Server Action: Missing creatorId");
    return { success: false, error: 'A user ID is required to save a story.' };
  }

  console.log("Server Action: Saving story for user:", storyData.creatorId);

  try {
    const adminDb = getAdminDb();
    const now = Timestamp.now();
    const expireAt = new Timestamp(now.seconds + 24 * 60 * 60, now.nanoseconds);

    // 2. SANITIZE DATA (Critical Fix)
    // Firestore throws error on 'undefined', so we fallback to null or defaults.
    const cleanStory = {
      title: storyData.title || "Untitled Story",
      
      // MAP 'content' -> 'finalScript' (Matches your DB screenshots)
      finalScript: storyData.content || "", 
      
      // Safe Fallbacks
      mood: storyData.mood || "Neutral",
      styleMatch: storyData.styleMatch || "Freeform", 
      gameMode: storyData.gameMode || "interactive",
      trope: storyData.trope || "General",
      
      creatorId: storyData.creatorId,
      createdAt: now,
      expireAt: expireAt,
      
      // Add these for debugging/future use
      isSimulated: storyData.gameMode === 'simulation'
    };
    
    // 3. Save to Firestore
    const docRef = await adminDb.collection('stories').add(cleanStory);
    
    console.log("Server Action: Success! Saved ID:", docRef.id);
    return { success: true, id: docRef.id };

  } catch (error: any) {
    // Log the REAL error to your terminal so you can see it
    console.error("CRITICAL SAVE ERROR:", error);
    
    // Return a generic error to the client
    return { 
        success: false, 
        error: `Server Error: ${error.message || 'Unknown save failure'}` 
    };
  }
}