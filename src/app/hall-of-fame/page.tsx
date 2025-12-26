/**
 * @fileoverview Hall of Fame Page
 * This page displays the most recent stories created by users.
 * It fetches data directly from Firestore on the client-side to ensure
 * the list is always up-to-date.
 */
'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase client-side, only if it hasn't been already.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

interface Story {
  id: string;
  title: string;
  content: string;
  mood?: string;
  styleMatch?: string;
  createdAt: string;
}

export default function HallOfFame() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      try {
        const storiesRef = collection(db, 'stories');
        // Fetch top 100 newest stories, ordered by creation date
        const q = query(storiesRef, orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);

        const fetchedStories = snapshot.docs.map(doc => {
          const data = doc.data();
          // Safely convert Firestore timestamp to a string
          let dateStr = new Date().toISOString();
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            dateStr = data.createdAt.toDate().toISOString();
          }

          return {
            id: doc.id,
            title: data.title || 'Untitled Story',
            content: data.content || '',
            mood: data.mood,
            styleMatch: data.styleMatch,
            createdAt: dateStr
          } as Story;
        });

        setStories(fetchedStories);
      } catch (error) {
        console.error("Error fetching Hall of Fame:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2 text-foreground">Hall of Fame</h1>
        <p className="text-muted-foreground">The 100 most recent stories live here for 24 hours.</p>
      </div>

      {loading ? (
        <div className="flex justify-center mt-12">
          <p className="text-muted-foreground animate-pulse">Loading stories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {stories.length > 0 ? (
            stories.map((story) => (
              <div key={story.id} className="border border-border/20 rounded-lg p-6 glassmorphism h-full flex flex-col hover:border-accent/50 transition-colors">
                <h2 className="text-xl font-bold font-headline text-accent">{story.title}</h2>
                <p className="text-sm text-muted-foreground mt-2 flex-grow line-clamp-3">
                  {story.content}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {story.mood && <Badge variant="secondary">{story.mood}</Badge>}
                  {story.styleMatch && <Badge variant="secondary">{story.styleMatch}</Badge>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground col-span-full mt-8">
              The Hall of Fame is currently empty. Be the first to create a story!
            </p>
          )}
        </div>
      )}

       <div className="text-center mt-12">
        <Link href="/" className="text-accent hover:underline text-lg">
          &larr; Create Your Own Story
        </Link>
      </div>
    </div>
  );
}
