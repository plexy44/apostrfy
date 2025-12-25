'use server'
import { saveStoryToFirestore } from '@/lib/firestore';
import { auth } from '@/auth'; 
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function publishStory(storyData: any) {
  // 1. Verify User Session
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error("You must be logged in to publish.");
  }
  
  const adminDb = getAdminDb();

  // 2. Fetch Original Private Story
  const privateRef = adminDb.collection('stories').doc(storyData.storyId);
  const snap = await privateRef.get();
  
  if (!snap.exists) throw new Error("Story not found.");
  const data = snap.data();

  if (!data) throw new Error("Story data is missing.");

  // 3. Ownership Check (Critical Security)
  if (data.creatorId !== session.user.id) {
    throw new Error("Unauthorized: You do not own this story.");
  }

  // 4. Bad Word Filter (AdSense Requirement)
  const forbidden = ['badword1', 'badword2']; // Expand this list
  const storyText = storyData.analysis?.finalScript || '';
  if (forbidden.some(word => storyText.toLowerCase().includes(word))) {
    throw new Error("Story contains flagged content and cannot be published.");
  }

  // 5. Write to Public Collection
  const publicStoryRef = await adminDb.collection('public_stories').doc(storyData.storyId).set({
    title: storyData.title || "Untitled Story",
    content: storyText,
    tagline: storyData.analysis?.quoteBanner || "A story from Scriblox.",
    mood: storyData.analysis?.mood?.primaryEmotion || "Unknown",
    styleMatch: storyData.analysis?.style?.primaryMatch || "Unknown",
    keywords: storyData.analysis?.keywords || [],
    originalCreatorId: session.user.id,
    authorName: session.user.name || "Scriblox Writer",
    createdAt: new Date(),
    views: 0,
    likes: 0
  });

  // 6. Return Success Path
  return { success: true, url: `/read/${storyData.storyId}` };
}
