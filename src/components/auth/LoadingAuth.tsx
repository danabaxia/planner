'use client'

export function LoadingAuth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
          <h2 className="mt-6 text-center text-xl font-medium text-gray-900">
            Loading...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we verify your authentication status
          </p>
        </div>
      </div>
    </div>
  )
} 