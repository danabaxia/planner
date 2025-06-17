'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Container, Grid, GridItem, Stack, Flex } from '@/components/ui'

interface NotionTestData {
  success: boolean
  user: {
    id: string
    name: string
    email: string
    workspace_id: string
  }
  databases: Array<{
    id: string
    title: string
    url: string
  }>
  session: {
    accessToken: string
    refreshToken: string
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notionData, setNotionData] = useState<NotionTestData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const testNotionConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notion/test')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test connection')
      }

      setNotionData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  if (status === 'loading') {
    return (
      <Container size="full" className="min-h-screen bg-background">
        <Flex align="center" justify="center" className="min-h-screen">
          <Stack spacing="md" align="center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading...</p>
          </Stack>
        </Flex>
      </Container>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Container size="xl" padding="lg" className="min-h-screen bg-background">
      <Stack spacing="lg">
        <Flex justify="between" align="center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleSignOut} variant="secondary">
            Sign Out
          </Button>
        </Flex>

        <Card>
          <CardHeader>
            <CardTitle>Welcome, {session.user?.name || 'User'}!</CardTitle>
            <CardDescription>
              Your Notion OAuth integration is active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Stack spacing="lg">
              <Grid cols={1} responsive={{ md: 2 }} gap="lg">
                <GridItem>
                  <Stack spacing="md">
                    <h3 className="font-semibold">Session Info</h3>
                    <Stack spacing="xs" className="text-sm">
                      <p>
                        <strong>Email:</strong> {session.user?.email}
                      </p>
                      <p>
                        <strong>Workspace ID:</strong>{' '}
                        {session.notionWorkspaceId || 'Not available'}
                      </p>
                      <p>
                        <strong>Access Token:</strong>{' '}
                        {session.accessToken ? '✅ Present' : '❌ Missing'}
                      </p>
                    </Stack>
                  </Stack>
                </GridItem>

                <GridItem>
                  <Stack spacing="md">
                    <h3 className="font-semibold">Test Connection</h3>
                    <Button
                      onClick={testNotionConnection}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Testing...' : 'Test Notion API'}
                    </Button>
                  </Stack>
                </GridItem>
              </Grid>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <Stack spacing="xs">
                    <p className="text-destructive font-semibold">Error:</p>
                    <p className="text-destructive text-sm">{error}</p>
                  </Stack>
                </div>
              )}

              {notionData && (
                <Stack spacing="lg">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Stack spacing="md">
                      <h3 className="font-semibold text-green-800">
                        ✅ Connection Successful!
                      </h3>
                      <Stack spacing="xs" className="text-sm">
                        <div>
                          <strong>User:</strong> {notionData.user.name} (
                          {notionData.user.email})
                        </div>
                        <div>
                          <strong>Workspace:</strong> {notionData.user.workspace_id}
                        </div>
                        <div>
                          <strong>Databases Found:</strong>{' '}
                          {notionData.databases.length}
                        </div>
                      </Stack>
                    </Stack>
                  </div>

                  {notionData.databases.length > 0 && (
                    <Stack spacing="md">
                      <h3 className="font-semibold">Available Databases</h3>
                      <Stack spacing="sm">
                        {notionData.databases.map(db => (
                          <div key={db.id} className="p-3 border rounded-lg">
                            <Stack spacing="xs">
                              <div className="font-medium">{db.title}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {db.id}
                              </div>
                            </Stack>
                          </div>
                        ))}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  )
}
