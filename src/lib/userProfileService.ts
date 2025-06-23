import { prisma } from './prisma'

export interface UserProfileData {
  name?: string | null
  email?: string | null
  image?: string | null
  emailVerified?: Date | null
  notificationPreferences?: {
    email: boolean
    push: boolean
    inApp: boolean
  }
}

export const userProfileService = {
  async getProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          emailVerified: true,
          notionWorkspaceId: true,
          accounts: {
            select: {
              provider: true,
              providerAccountId: true,
            },
          },
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      return user
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  },

  async updateProfile(userId: string, data: UserProfileData) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
          emailVerified: data.emailVerified,
        },
      })

      return user
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  async deleteAccount(userId: string) {
    try {
      // Delete all related data first
      await prisma.$transaction([
        // Delete user's projects and related data
        prisma.project.deleteMany({
          where: { userId },
        }),
        // Delete user's accounts (OAuth connections)
        prisma.account.deleteMany({
          where: { userId },
        }),
        // Delete user's sessions
        prisma.session.deleteMany({
          where: { userId },
        }),
        // Finally, delete the user
        prisma.user.delete({
          where: { id: userId },
        }),
      ])

      return true
    } catch (error) {
      console.error('Error deleting user account:', error)
      throw error
    }
  },

  async verifyEmail(userId: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: new Date(),
        },
      })

      return true
    } catch (error) {
      console.error('Error verifying email:', error)
      throw error
    }
  },

  async updateNotificationPreferences(
    userId: string,
    preferences: UserProfileData['notificationPreferences']
  ) {
    try {
      // In a real application, you would store these preferences in a separate table
      // For now, we'll just return success
      return true
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      throw error
    }
  },
} 