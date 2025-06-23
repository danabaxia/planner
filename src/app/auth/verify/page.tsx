'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setError('No verification token provided')
        return
      }

      try {
        const response = await fetch(`/api/user/verify-email?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify email')
        }

        setStatus('success')
        // Redirect to settings page after 3 seconds
        setTimeout(() => {
          router.push('/settings')
        }, 3000)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to verify email')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl border border-border p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Verifying Email</h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
              <p className="text-muted-foreground mb-4">
                Your email has been successfully verified. You will be redirected to
                your settings page in a few seconds.
              </p>
              <Link
                href="/settings"
                className="text-primary hover:text-primary/80"
              >
                Click here if you are not redirected
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
              <p className="text-destructive mb-4">{error}</p>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Please try requesting a new verification email from your settings
                  page.
                </p>
                <Link
                  href="/settings"
                  className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Go to Settings
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 