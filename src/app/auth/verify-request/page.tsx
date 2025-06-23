'use client'

import Link from 'next/link'

export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            A sign in link has been sent to your email address.
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Click the link to complete your sign in.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
} 