/**
 * @fileoverview This file initializes the Firebase Admin SDK for server-side
 * operations. It ensures that the admin app is initialized only once (singleton pattern)
 * and exports functions to get the Firestore and Auth instances.
 */
import * as admin from 'firebase-admin';

let app: admin.app.App;

function getAdminApp() {
  if (app) {
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin SDK environment variables. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.');
  }

  const serviceAccount: admin.ServiceAccount = {
    projectId,
    clientEmail,
    privateKey,
  };

  if (!admin.apps.length) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('Firebase Admin SDK initialization error:', error.message);
      // Re-throw a more specific error to make debugging easier
      throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
    }
  } else {
    app = admin.app();
  }

  return app;
}

// Getter for the Firestore instance
export function getAdminDb() {
  return getAdminApp().firestore();
}

// Getter for the Auth instance
export function getAdminAuth() {
  return getAdminApp().auth();
}
