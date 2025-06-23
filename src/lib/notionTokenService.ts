import { prisma } from './prisma'
import { encryptToken, decryptToken, hashToken, isTokenValid } from './encryption'

export interface NotionTokenData {
  accessToken: string
  workspaceId: string
  workspaceName?: string
  botId?: string
}

export const notionTokenService = {
  async storeToken(userId: string, tokenData: NotionTokenData) {
    const encryptedToken = encryptToken(tokenData.accessToken)
    const tokenHash = hashToken(tokenData.accessToken)

    try {
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: 'notion',
            providerAccountId: tokenData.workspaceId,
          },
        },
        update: {
          access_token: encryptedToken,
          token_type: 'bearer',
          scope: 'workspace',
          bot_id: tokenData.botId,
          userId,
        },
        create: {
          provider: 'notion',
          providerAccountId: tokenData.workspaceId,
          type: 'oauth',
          access_token: encryptedToken,
          token_type: 'bearer',
          scope: 'workspace',
          bot_id: tokenData.botId,
          userId,
        },
      })

      // Update user's Notion workspace info
      await prisma.user.update({
        where: { id: userId },
        data: {
          notionWorkspaceId: tokenData.workspaceId,
        },
      })

      return true
    } catch (error) {
      console.error('Error storing Notion token:', error)
      throw new Error('Failed to store Notion token')
    }
  },

  async getToken(userId: string): Promise<string | null> {
    try {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          provider: 'notion',
        },
      })

      if (!account?.access_token) {
        return null
      }

      const decryptedToken = decryptToken(account.access_token)
      
      if (!isTokenValid(decryptedToken)) {
        await this.revokeToken(userId)
        return null
      }

      return decryptedToken
    } catch (error) {
      console.error('Error getting Notion token:', error)
      return null
    }
  },

  async revokeToken(userId: string): Promise<boolean> {
    try {
      await prisma.account.deleteMany({
        where: {
          userId,
          provider: 'notion',
        },
      })

      await prisma.user.update({
        where: { id: userId },
        data: {
          notionWorkspaceId: null,
        },
      })

      return true
    } catch (error) {
      console.error('Error revoking Notion token:', error)
      return false
    }
  },

  async updateToken(userId: string, tokenData: NotionTokenData): Promise<boolean> {
    return this.storeToken(userId, tokenData)
  },

  async hasValidToken(userId: string): Promise<boolean> {
    const token = await this.getToken(userId)
    return token !== null && isTokenValid(token)
  },
} 