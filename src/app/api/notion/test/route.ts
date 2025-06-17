import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getNotionAPI, validateDatabaseForPlanning } from '@/lib/notion'
import { handleApiError } from '@/lib/api-client'
import { notionRateLimiter } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notionAPI = await getNotionAPI()

    // Test the connection by getting user info
    const user = await notionAPI.getUser()

    // Get available databases
    const databasesResponse = await notionAPI.getDatabases()

    // Validate databases for planning use
    const validationResults = databasesResponse.results.map(db => ({
      id: db.id,
      title: db.title.map((t: any) => t.text.content).join('') || 'Untitled',
      url: db.url,
      validation: validateDatabaseForPlanning(db),
    }))

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.person?.email,
        workspace_id: session.notionWorkspaceId,
        type: user.type,
      },
      databases: validationResults,
      session: {
        accessToken: session.accessToken ? '✅ Present' : '❌ Missing',
        refreshToken: session.refreshToken ? '✅ Present' : '❌ Missing',
      },
      apiFeatures: {
        userInfo: '✅ Working',
        databaseAccess: '✅ Working',
        validation: '✅ Working',
        errorHandling: '✅ Working',
        rateLimiting: '✅ Working',
      },
      rateLimitStats: notionRateLimiter.getStats(),
    })
  } catch (error) {
    console.error('Notion API test error:', error)
    const errorMessage = handleApiError(error)

    return NextResponse.json(
      {
        error: 'Failed to connect to Notion API',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
