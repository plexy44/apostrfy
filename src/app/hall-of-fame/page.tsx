import { adminDb } from '@/lib/firebaseAdmin';
import Link from 'next/link';

export default async function HallOfFame() {
  const snapshot = await adminDb.collection('public_stories')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();

  const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-6 text-center text-foreground">Scriblox Hall of Fame</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {stories.map((story: any) => (
          <Link href={`/read/${story.id}`} key={story.id} className="block group">
            <div className="border border-border/20 rounded-lg p-6 hover:shadow-lg transition-shadow glassmorphism h-full flex flex-col">
              <h2 className="text-xl font-bold font-headline group-hover:text-accent transition-colors">{story.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 flex-grow">"{story.tagline}"</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{story.mood}</span>
                 <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{story.styleMatch}</span>
              </div>
            </div>
          </Link>
        ))}
         {stories.length === 0 && (
          <p className="text-center text-muted-foreground col-span-full">The Hall of Fame is empty. Be the first to publish a story!</p>
        )}
      </div>
    </div>
  );
}
