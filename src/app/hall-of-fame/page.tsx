/**
 * @fileoverview This page displays a gallery of recently created stories.
 * It fetches stories directly from the 'stories' collection in Firestore,
 * which are intended for public viewing and are automatically deleted after 24 hours via a TTL policy.
 */
import { getAdminDb } from '@/lib/firebaseAdmin';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  content: string;
  mood?: string;
  styleMatch?: string;
  createdAt: { toDate: () => Date };
}

export default async function HallOfFame() {
  const adminDb = getAdminDb();
  let stories: Story[] = [];
  try {
    const snapshot = await adminDb.collection('stories')
      .orderBy('createdAt', 'desc')
      .limit(21)
      .get();
    stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
  } catch (error) {
    console.error("Error fetching stories for Hall of Fame:", error);
    // Render the page with an empty state if Firestore fetch fails
  }

  return (
    <div className="p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2 text-foreground">Hall of Fame</h1>
        <p className="text-muted-foreground">Stories live here for 24 hours. Create one to add yours to the wall.</p>
      </div>
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
       <div className="text-center mt-12">
        <Link href="/" className="text-accent hover:underline text-lg">
          &larr; Create Your Own Story
        </Link>
      </div>
    </div>
  );
}
