/**
 * @fileoverview Hall of Fame Page
 * Displays stories using robust data mapping.
 * FIXES:
 * 1. Correctly maps 'personaName' to credit the AI Co-Author (e.g. Albert Einstein).
 * 2. Joins full transcript text.
 * 3. Shows rich metadata sidebar.
 */
'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MoodWheel from '@/components/app/MoodWheel';
import type { Emotion, GameMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { logEvent } from '@/lib/analytics';
import { User, Bot, Calendar, Feather, UserCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Initialize Firestore
const db = getFirestore(app);

interface Story {
  id: string;
  title: string;
  content: string;     // The short preview
  fullContent: string; // The ACTUAL full text
  mood?: Emotion;
  styleMatch?: string;
  createdAt: string;
  gameMode?: GameMode;
  trope?: string;
  authorName?: string; // The AI Persona Name
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
            
            // === 1. CONTENT MAPPING ===
            let foundContent = data.finalScript || data.content;
            
            // Handle Transcripts (Simulations)
            if (!foundContent) {
                if (Array.isArray(data.transcript)) {
                    foundContent = data.transcript.map((t: any) => t.line).join('\n\n'); 
                } else if (Array.isArray(data.story)) {
                    foundContent = data.story.map((s: any) => s.line).join('\n\n');
                }
            }
            if (!foundContent) foundContent = "No full script available.";
            
            const previewContent = foundContent.length > 150 
                ? foundContent.substring(0, 150) + '...' 
                : foundContent;

            // === 2. MOOD MAPPING ===
            let mood: Emotion | undefined = undefined;
            if (data.mood) {
                if (typeof data.mood === 'string') {
                    mood = data.mood as Emotion;
                } else if (data.mood.primaryEmotion) {
                    mood = data.mood.primaryEmotion as Emotion;
                }
            }

            // === 3. STYLE MAPPING ===
            let styleMatch = data.styleMatch;
            if (!styleMatch && data.style) {
                 if (typeof data.style === 'string') styleMatch = data.style;
                 else if (data.style.primaryMatch) styleMatch = data.style.primaryMatch;
            }

            // === 4. PERSONA MAPPING (FIXED) ===
            // Goal: Find the AI's name (e.g., "Albert Einstein")
            let authorName = data.personaName; 

            // If not at top level, look inside the transcript/story for the AI speaker
            if (!authorName && Array.isArray(data.transcript)) {
                 const aiTurn = data.transcript.find((t: any) => t.personaName && t.personaName !== 'User');
                 if (aiTurn) authorName = aiTurn.personaName;
            }
            if (!authorName && Array.isArray(data.story)) {
                 const aiTurn = data.story.find((s: any) => s.personaName && s.personaName !== 'User');
                 if (aiTurn) authorName = aiTurn.personaName;
            }

            // Fallback
            if (!authorName) authorName = "AI Co-Author";

            // === 5. DATE MAPPING ===
            let dateStr = new Date().toISOString();
            if (data.createdAt) {
                if (typeof data.createdAt.toDate === 'function') {
                  dateStr = data.createdAt.toDate().toISOString();
                } else {
                  dateStr = data.createdAt;
                }
            }

            return {
              id: doc.id,
              title: data.title || 'Untitled Story',
              content: previewContent,
              fullContent: foundContent,
              mood: mood,
              styleMatch: styleMatch,
              createdAt: dateStr,
              gameMode: data.gameMode || (data.transcript ? 'simulation' : 'interactive'),
              trope: data.trope || data.tropeName,
              authorName: authorName
            } as Story;
          })
          .filter(story => story.fullContent && story.fullContent !== "No full script available.");

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
        return <Bot {...iconProps} title="AI Simulation" />;
    }
    return <User {...iconProps} title="User Story" />;
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
                              key="preview"
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
                               {story.trope && <Badge variant="secondary">{story.trope}</Badge>}
                               {story.styleMatch && <Badge variant="secondary">{story.styleMatch}</Badge>}
                             </div>
                           </motion.div>
                          )}
                        </AnimatePresence>
                    </div>
                </AccordionTrigger>
                
                <AccordionContent>
                  <div className="px-1 py-4 md:px-4 md:pb-4">
                    <div className="mt-4 border-t border-border/20 pt-6 flex flex-col md:flex-row gap-6">
                        
                        {/* 1. Full Script */}
                        <div className="flex-1">
                            <p className="whitespace-pre-wrap font-code leading-relaxed text-foreground/90 text-left text-sm md:text-base">
                                {story.fullContent}
                            </p>
                        </div>

                        {/* 2. Metadata Sidebar */}
                        <div className="w-full md:w-48 flex-shrink-0 flex flex-col gap-6 p-4 rounded-lg bg-black/20 border border-white/5 h-fit">
                            
                            {story.mood && (
                                <div className="flex flex-col items-center">
                                    <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Mood</span>
                                    <div className="w-24 h-24">
                                        <MoodWheel mood={story.mood} score={1} />
                                    </div>
                                    <span className="mt-2 text-sm font-bold text-accent">{story.mood}</span>
                                </div>
                            )}

                            <div className="space-y-3 text-sm">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                                        <UserCircle className="w-3 h-3" /> Co-Author
                                    </div>
                                    <span className="font-medium text-foreground">{story.authorName}</span>
                                </div>

                                {story.styleMatch && (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                                            <Feather className="w-3 h-3" /> Style
                                        </div>
                                        <span className="font-medium text-foreground">{story.styleMatch}</span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                                        <Calendar className="w-3 h-3" /> Date
                                    </div>
                                    <span className="text-muted-foreground">
                                        {new Date(story.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                        </div>
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
