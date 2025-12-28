/**
 * @fileoverview Hall of Fame Page
 * This page displays the most recent stories created by users.
 * It fetches data directly from Firestore on the client-side to ensure
 * the list is always up-to-date and provides an interactive, expandable
 * view for each story.
 */
'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase'; // Correctly import the shared app instance
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MoodWheel from '@/components/app/MoodWheel';
import type { Emotion, GameMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { logEvent } from '@/lib/analytics';
import { User, Bot } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Initialize Firestore using the shared app instance
const db = getFirestore(app);

interface Story {
  id: string;
  title: string;
  content: string;
  mood?: Emotion;
  styleMatch?: string;
  createdAt: string;
  gameMode?: GameMode;
}

export default function HallOfFame() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  useEffect(() => {
    logEvent('screen_view', { screen_name: 'hall_of_fame' });
    async function fetchStories() {
      try {
        const storiesRef = collection(db, 'stories');
        const q = query(storiesRef, orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);

        const fetchedStories = snapshot.docs
          .map(doc => {
            const data = doc.data();
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
              createdAt: dateStr,
              gameMode: data.gameMode,
            } as Story;
          })
          .filter(story => story.content && story.content.trim() !== ''); // Filter out empty stories

        setStories(fetchedStories);
      } catch (error) {
        console.error("Error fetching Hall of Fame:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  const GameModeIcon = ({ mode }: { mode?: GameMode }) => {
    if (!mode) return null;
    const iconProps = { className: "h-4 w-4 text-muted-foreground" };
    if (mode === 'simulation') {
        return <Bot {...iconProps} />;
    }
    return <User {...iconProps} />;
  }

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
        stories.length > 0 ? (
          <Accordion 
            type="single" 
            collapsible 
            className="w-full max-w-2xl mx-auto space-y-3"
            onValueChange={(value) => setOpenAccordion(value)}
          >
            {stories.map((story) => (
              <AccordionItem value={story.id} key={story.id} className="border-0">
                <AccordionTrigger className="p-3 md:p-4 rounded-lg border-2 text-left transition-all w-full h-full hover:no-underline bg-card/60 backdrop-blur-lg border-border/20 hover:border-accent/50 [&[data-state=open]>svg]:text-accent data-[state=open]:border-accent data-[state=open]:bg-accent/10 data-[state=open]:shadow-lg data-[state=open]:shadow-accent/10">
                    <div className="flex flex-col gap-2 w-full pr-4">
                        <div className="flex justify-between items-center">
                            <h2 className={cn(
                              "text-xl font-bold font-headline text-foreground",
                              openAccordion === story.id && "text-shimmer"
                            )}>
                              {story.title}
                            </h2>
                            <GameModeIcon mode={story.gameMode} />
                        </div>
                        <AnimatePresence initial={false}>
                          {openAccordion !== story.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 'auto' }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {story.content}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                               {story.mood && <Badge variant="secondary">{story.mood}</Badge>}
                               {story.styleMatch && <Badge variant="secondary">{story.styleMatch}</Badge>}
                             </div>
                           </motion.div>
                          )}
                        </AnimatePresence>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-1 py-4 md:px-4 md:pb-4">
                    <div className="mt-4 flex flex-col gap-4 border-t border-border/20 pt-6">
                        <p className="whitespace-pre-wrap font-code leading-relaxed text-foreground/80 text-left text-sm md:text-base">
                            {story.content}
                        </p>
                        {story.mood && (
                             <motion.div 
                                className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mt-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <MoodWheel mood={story.mood} score={1} />
                            </motion.div>
                        )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-center text-muted-foreground col-span-full mt-8">
            The Hall of Fame is currently empty. Be the first to create a story!
          </p>
        )
      )}

       <div className="text-center mt-12">
        <Link href="/" className="text-accent hover:underline text-lg">
          &larr; Create Your Own Story
        </Link>
      </div>
    </div>
  );
}
