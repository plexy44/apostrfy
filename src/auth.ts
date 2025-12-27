/**
 * @fileoverview This file configures NextAuth.js for authentication.
 * It currently sets up an anonymous user session by default if no other
 * provider is used, which is useful for allowing users to interact with
 * the app before fully signing up.
 */
import NextAuth from 'next-auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // This is a custom provider to create anonymous sessions
    {
      id: 'anonymous',
      name: 'Anonymous',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        try {
          // This simulates creating a user record or token for an anonymous guest.
          // In a real scenario, you might create a temporary user in your database.
          const tempId = `anon_${Date.now()}`;
          const user = { 
            id: tempId, 
            name: 'Anonymous Scribbler', 
            email: null 
          };
          return user;
        } catch (error) {
          console.error("Anonymous auth error:", error);
          return null;
        }
      }
    }
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token.uid) {
        session.user.id = token.uid as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    }
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Here you could add logic to create a corresponding user in Firestore
        // if you need to persist anonymous user data.
      }
    }
  }
});
