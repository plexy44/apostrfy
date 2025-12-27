/**
 * @fileoverview This server action provides a secure way to save a story to the
 * public 'stories' collection in Firestore. It uses the Firebase Admin SDK,
 * which bypasses all security rules, making it a trusted environment for writes.
 * The client calls this action to persist story data without having direct
 * write access to the public collection.
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

export async function saveStory(storyData: StoryData) {
    if (!storyData.creatorId) {
        return { error: 'A user ID is required to save a story.' };
    }

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
        console.log('Story saved via Server Action with ID:', docRef.id);
        
        return { id: docRef.id };

    } catch (error) {
        console.error('Error in saveStory Server Action:', error);
        return { error: 'The story could not be saved to the Hall of Fame.' };
    }
}
