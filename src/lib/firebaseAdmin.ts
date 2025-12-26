import * as admin from 'firebase-admin';

let app: admin.app.App;

// --- CLEANER FUNCTION ---
// Strips accidental quotes and fixes newlines from .env variables
const formatKey = (key: string | undefined) => {
  if (!key) return undefined;
  
  // 1. Remove surrounding double quotes if present (common paste error)
  let cleanKey = key.replace(/^"|"$/g, '');

  // 2. Replace literal "\n" characters with real newlines
  cleanKey = cleanKey.replace(/\\n/g, '\n');

  // 3. Remove invisible Carriage Returns (\r) which break crypto
  cleanKey = cleanKey.replace(/\r/g, '');
  
  return cleanKey.trim();
};

const cleanVar = (value: string | undefined) => {
  if (!value) return undefined;
  return value.replace(/^"|"$/g, '').trim();
}

function getAdminApp() {
  if (app) return app;

  const privateKey = formatKey(process.env.FIREBASE_PRIVATE_KEY);
  const clientEmail = cleanVar(process.env.FIREBASE_CLIENT_EMAIL);
  const projectId = cleanVar(process.env.FIREBASE_PROJECT_ID);

  if (!privateKey || !clientEmail || !projectId) {
     throw new Error('CRITICAL: Missing Firebase Admin environment variables. Check .env.local');
  }

  // Safety Check: Verify key format before initializing
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('CRITICAL: Invalid Private Key format. Missing header.');
  }

  if (!admin.apps.length) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey
        })
      });
      console.log('[Firebase Admin] SDK initialized successfully via Environment Variables.');
    } catch (error: any) {
      console.error('[Firebase Admin] Initialization Error:', error);
      throw error;
    }
  } else {
    app = admin.app();
  }

  return app;
}

export function getAdminDb() {
  return getAdminApp().firestore();
}

export function getAdminAuth() {
  return getAdminApp().auth();
}