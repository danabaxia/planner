import 'next-auth'
import 'next-auth/jwt'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    notionWorkspaceId?: string
    notionBotId?: string
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface User {
    notionWorkspaceId?: string
  }

  interface Account {
    bot_id?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    notionWorkspaceId?: string
    notionBotId?: string
    id: string
  }
}
