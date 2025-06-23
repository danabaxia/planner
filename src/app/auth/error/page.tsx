'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'You do not have permission to sign in.'
      case 'Verification':
        return 'The verification link is no longer valid. Please request a new one.'
      case 'OAuthSignin':
        return 'Error signing in with the provider. Please try again.'
      case 'OAuthCallback':
        return 'Error receiving data from the provider. Please try again.'
      case 'OAuthCreateAccount':
        return 'Could not create an account with the provider.'
      case 'EmailCreateAccount':
        return 'Could not create an account with this email.'
      case 'Callback':
        return 'Error during the authentication callback.'
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account.'
      case 'EmailSignin':
        return 'The email sign-in link is no longer valid. Please request a new one.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      default:
        return 'An unexpected error occurred during authentication.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-red-600">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Sign In
          </Link>

          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
