import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

// Custom Notion OAuth provider
const NotionProvider = {
  id: 'notion',
  name: 'Notion',
  type: 'oauth' as const,
  version: '2.0',
  authorization: {
    url: 'https://api.notion.com/v1/oauth/authorize',
    params: {
      response_type: 'code',
      owner: 'user',
    },
  },
  token: {
    url: 'https://api.notion.com/v1/oauth/token',
    async request({ params, provider }: any) {
      const response = await fetch(provider.token?.url!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${provider.clientId}:${provider.clientSecret}`
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: params.code,
          redirect_uri: params.redirect_uri,
        }),
      })

      const tokens = await response.json()
      return { tokens }
    },
  },
  userinfo: {
    async request({ tokens }: any) {
      // Get user info from Notion API
      const response = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'Notion-Version': '2022-06-28',
        },
      })

      const user = await response.json()
      return user
    },
  },
  profile(profile: any) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.person?.email || null,
      image: profile.avatar_url || null,
      notionWorkspaceId: profile.workspace_id,
    }
  },
  clientId: process.env.NOTION_CLIENT_ID,
  clientSecret: process.env.NOTION_CLIENT_SECRET,
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [NotionProvider],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.notionWorkspaceId = (profile as any)?.workspace_id
        token.notionBotId = account.bot_id
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.notionWorkspaceId = token.notionWorkspaceId as string
      session.notionBotId = token.notionBotId as string
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('User signed in:', { user, account, profile })
    },
    async signOut({ session, token }) {
      console.log('User signed out:', { session, token })
    },
  },
}

export default authOptions
