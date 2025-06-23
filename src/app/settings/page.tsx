'use client'

import { useEffect, useState } from 'react'
import { Bell, Database, Palette, Shield, User } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function Settings() {
  const router = useRouter()
  const { profile, loading, error, fetchProfile, updateProfile, deleteAccount } = useProfile()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
      })
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile({ name: formData.name })
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update profile:', err)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount()
      await signOut({ callbackUrl: '/auth/signin' })
    } catch (err) {
      console.error('Failed to delete account:', err)
    }
  }

  const handleVerifyEmail = async () => {
    if (!profile?.email) return

    setIsVerifying(true)
    try {
      const response = await fetch('/api/user/verify-email', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email')
      }

      // Show success message
      alert('Verification email sent. Please check your inbox.')
    } catch (err) {
      console.error('Failed to send verification email:', err)
      alert('Failed to send verification email. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and application preferences
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Settings Navigation */}
            <nav className="space-y-2">
              <a
                href="#profile"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
              >
                <User className="w-4 h-4" />
                Profile
              </a>
              <a
                href="#notion"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Database className="w-4 h-4" />
                Notion Integration
              </a>
              <a
                href="#notifications"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Bell className="w-4 h-4" />
                Notifications
              </a>
              <a
                href="#appearance"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Palette className="w-4 h-4" />
                Appearance
              </a>
              <a
                href="#privacy"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Shield className="w-4 h-4" />
                Privacy & Security
              </a>
            </nav>

            {/* Settings Content */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="space-y-6">
                  {/* Profile Section */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Profile Information
                    </h2>
                    {error && (
                      <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg">
                        {error}
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="name">
                          Display Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter your name"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="email">
                          Email
                        </label>
                        <div className="flex gap-3">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            disabled
                            placeholder="your.email@example.com"
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                          />
                          {!profile?.emailVerified && profile?.email && (
                            <button
                              type="button"
                              onClick={handleVerifyEmail}
                              disabled={isVerifying}
                              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                              {isVerifying ? 'Sending...' : 'Verify Email'}
                            </button>
                          )}
                        </div>
                        {profile?.emailVerified ? (
                          <p className="mt-1 text-sm text-success">Email verified</p>
                        ) : (
                          <p className="mt-1 text-sm text-warning">
                            {profile?.email
                              ? 'Email not verified - Please verify your email address'
                              : 'No email address associated with your account'}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="text-destructive hover:text-destructive/80 text-sm"
                        >
                          Delete Account
                        </button>
                        <div className="space-x-3">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditing(false)
                                  setFormData({
                                    name: profile?.name || '',
                                    email: profile?.email || '',
                                  })
                                }}
                                className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                              >
                                Save Changes
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsEditing(true)}
                              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                              Edit Profile
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Delete Account Confirmation */}
                  {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
                        <p className="text-muted-foreground mb-4">
                          Are you sure you want to delete your account? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium hover:bg-destructive/90 transition-colors"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notion Integration */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      Notion Integration
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center py-8">
                        <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">
                          Connect your Notion workspace
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Sync your activities and planning data with Notion
                        </p>
                        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                          Connect Notion
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
