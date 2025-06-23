'use client'

import { useAuth } from '@/hooks/useAuth'
import { LoadingAuth } from './LoadingAuth'

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requireAuth = true
) {
  return function ProtectedRoute(props: P) {
    const { isLoading, isAuthenticated } = useAuth(requireAuth)

    if (isLoading) {
      return <LoadingAuth />
    }

    if (!isAuthenticated && requireAuth) {
      return null // The useAuth hook will handle redirection
    }

    if (isAuthenticated && !requireAuth) {
      return null // The useAuth hook will handle redirection
    }

    return <Component {...props} />
  }
} 