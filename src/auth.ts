import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import Google from 'next-auth/providers/google';
import type { DefaultSession } from 'next-auth';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      notionAccessToken?: string | null;
      notionWorkspaceId?: string | null;
      notionBotId?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    notionAccessToken?: string | null;
    notionWorkspaceId?: string | null;
    notionBotId?: string | null;
  }
}

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Add Notion-specific fields
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            notionAccessToken: true,
            notionWorkspaceId: true,
            notionBotId: true,
          },
        });
        session.user.notionAccessToken = dbUser?.notionAccessToken || null;
        session.user.notionWorkspaceId = dbUser?.notionWorkspaceId || null;
        session.user.notionBotId = dbUser?.notionBotId || null;
      }
      return session;
    },
  },
}); 