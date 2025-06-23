'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return

    if (!session && requireAuth) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`)
    } else if (session && !requireAuth) {
      router.push('/dashboard')
    }
  }, [session, status, requireAuth, router, pathname])

  return {
    session,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
  }
} 