/**
 * @fileoverview This file initializes the Firebase Admin SDK for server-side
 * operations. It ensures that the admin app is initialized only once (singleton pattern)
 * and exports the Firestore database instance for use in server components and API routes.
 * It fetches service account credentials securely from environment variables.
 */
import * as admin from 'firebase-admin';

// Ensure the service account details are available in the environment
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

// Initialize the admin app if it hasn't been already
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
  }
}

// Export the initialized Firestore instance
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
