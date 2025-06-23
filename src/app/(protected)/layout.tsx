'use client'

import { useAuth } from '@/hooks/useAuth'
import { LoadingAuth } from '@/components/auth/LoadingAuth'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <LoadingAuth />
  }

  if (!isAuthenticated) {
    return null // useAuth hook will handle redirection
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Add navigation items here */}
            </div>
            <div className="flex items-center">
              {/* Add user menu here */}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
} 