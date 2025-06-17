import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notionRateLimiter } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current rate limiting stats
    const stats = notionRateLimiter.getStats()

    return NextResponse.json({
      success: true,
      rateLimitStats: {
        ...stats,
        timestamp: new Date().toISOString(),
      },
      config: {
        maxRequestsPerSecond: 3,
        maxConcurrentRequests: 10,
        queueTimeout: 30000,
      },
      status: {
        healthy: stats.queueLength < 50 && stats.averageWaitTime < 5000,
        queueStatus:
          stats.queueLength === 0
            ? 'empty'
            : stats.queueLength < 10
              ? 'normal'
              : stats.queueLength < 50
                ? 'busy'
                : 'overloaded',
        performanceStatus:
          stats.averageWaitTime < 1000
            ? 'excellent'
            : stats.averageWaitTime < 3000
              ? 'good'
              : stats.averageWaitTime < 5000
                ? 'fair'
                : 'poor',
      },
    })
  } catch (error) {
    console.error('Rate limit stats error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get rate limit stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST endpoint to clear the queue (for emergency situations)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (body.action === 'clear_queue') {
      notionRateLimiter.clearQueue()
      return NextResponse.json({
        success: true,
        message: 'Rate limit queue cleared',
        timestamp: new Date().toISOString(),
      })
    }

    if (body.action === 'update_config' && body.config) {
      notionRateLimiter.updateConfig(body.config)
      return NextResponse.json({
        success: true,
        message: 'Rate limit configuration updated',
        newConfig: body.config,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "clear_queue" or "update_config"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Rate limit control error:', error)
    return NextResponse.json(
      {
        error: 'Failed to control rate limiter',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
