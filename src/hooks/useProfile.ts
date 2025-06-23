import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { handleApiError } from '@/lib/api-client'

interface ProfileData {
  id: string
  name: string | null
  email: string | null
  image: string | null
  emailVerified: Date | null
  notionWorkspaceId: string | null
  createdAt: Date
  updatedAt: Date
}

interface UpdateProfileData {
  name?: string
  image?: string
}

export function useProfile() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile')
      }

      setProfile(data)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  const updateProfile = async (data: UpdateProfileData) => {
    if (!session?.user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile')
      }

      setProfile(result)
      return result
    } catch (err) {
      setError(handleApiError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async () => {
    if (!session?.user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      return true
    } catch (err) {
      setError(handleApiError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    deleteAccount,
  }
} 