'use server'
import { adminDb } from '@/lib/firebaseAdmin'; 
import { auth } from '@/auth'; 

export async function publishStory(storyId: string) {
  // 1. Verify User Session
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("You must be logged in to publish.");
  }

  // 2. Fetch Original Private Story
  const privateRef = adminDb.collection('stories').doc(storyId);
  const snap = await privateRef.get();
  
  if (!snap.exists) throw new Error("Story not found.");
  const data = snap.data();

  if (!data) throw new Error("Story data is missing.");

  // 3. Ownership Check (Critical Security)
  // This assumes the original creator's ID is saved on the story document.
  // The 'creatorId' field needs to be added when saving stories in `lib/firestore.ts`.
  if (data.creatorId !== session.user.id) {
    throw new Error("Unauthorized: You do not own this story.");
  }

  // 4. Bad Word Filter (AdSense Requirement)
  const forbidden = ['badword1', 'badword2']; // Expand this list
  const storyText = data.analysis?.finalScript || '';
  if (forbidden.some(word => storyText.toLowerCase().includes(word))) {
    throw new Error("Story contains flagged content and cannot be published.");
  }

  // 5. Write to Public Collection
  await adminDb.collection('public_stories').doc(storyId).set({
    title: data.title || "Untitled Story",
    content: storyText,
    tagline: data.analysis?.quoteBanner || "A story from Scriblox.",
    mood: data.analysis?.mood?.primaryEmotion || "Unknown",
    styleMatch: data.analysis?.style?.primaryMatch || "Unknown",
    keywords: data.analysis?.keywords || [],
    originalCreatorId: session.user.id,
    authorName: session.user.name || "Scriblox Writer",
    createdAt: new Date(),
    views: 0,
    likes: 0
  });

  // 6. Return Success Path
  return { success: true, url: `/read/${storyId}` };
}
