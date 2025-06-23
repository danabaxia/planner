'use client'

import { useAuth } from '@/hooks/useAuth'
import { LoadingAuth } from '@/components/auth/LoadingAuth'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading } = useAuth(false)

  if (isLoading) {
    return <LoadingAuth />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Add navigation items here */}
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/auth/signin"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Sign In
              </a>
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