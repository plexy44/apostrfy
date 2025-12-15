import { Metadata } from 'next';
import { adminDb } from '@/lib/firebaseAdmin';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


// --- 1. Dynamic SEO Metadata ---
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const doc = await adminDb.collection('public_stories').doc(params.id).get();
  if (!doc.exists) return { title: 'Story Not Found | Scriblox' };
  
  const data = doc.data();

  if (!data) return { title: 'Story Not Found | Scriblox' };

  return {
    title: `${data.title} | A Scriblox Story`,
    description: data.tagline,
    keywords: data.keywords,
    openGraph: {
      title: data.title,
      description: data.tagline,
      siteName: 'Scriblox',
    }
  };
}

// --- 2. The Page Layout ---
export default async function ReadPage({ params }: { params: { id: string } }) {
  // Fetch data on the server
  const doc = await adminDb.collection('public_stories').doc(params.id).get();
  if (!doc.exists) return notFound();

  const story = doc.data();

  if (!story) return notFound();


  return (
    <main className="w-full bg-background min-h-screen text-foreground">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* AdSense Slot 1: Top Leaderboard */}
            <div className="w-full h-24 bg-card rounded-lg flex items-center justify-center text-xs text-muted-foreground mb-8 border border-border/20">
                [AdSense Slot: Leaderboard]
            </div>

            <article>
                {/* Header */}
                <header className="mb-8 md:mb-12 text-center">
                    <div className="flex justify-center gap-2 mb-4">
                        <Badge variant="secondary">{story.styleMatch}</Badge>
                        <Badge variant="secondary">{story.mood}</Badge>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{story.title}</h1>
                    <p className="text-lg md:text-xl text-muted-foreground italic max-w-2xl mx-auto">
                        &ldquo;{story.tagline}&rdquo;
                    </p>
                </header>

                {/* Main Content (Semantic HTML for Crawlers) */}
                <div className="prose prose-lg prose-invert mx-auto whitespace-pre-wrap font-code leading-loose text-foreground/90">
                {story.content}
                </div>
            </article>

            {/* Engagement / Footer */}
            <div className="mt-12 pt-8 border-t border-border/20 text-center">
                <h3 className="text-xl font-bold font-headline mb-4">Analysis</h3>
                <div className="flex flex-wrap justify-center gap-2">
                    {story.keywords.map((keyword: string) => (
                        <Badge key={keyword} variant="outline">{keyword}</Badge>
                    ))}
                </div>
                 <Button asChild variant="link" className="mt-8">
                    <Link href="/hall-of-fame">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hall of Fame
                    </Link>
                </Button>
            </div>

            {/* AdSense Slot 2: Bottom Rect */}
            <div className="w-full max-w-[300px] h-[250px] mx-auto bg-card rounded-lg flex items-center justify-center text-xs text-muted-foreground mt-12 border border-border/20">
                [AdSense Slot: Rect]
            </div>
        </div>
    </main>
  );
}
