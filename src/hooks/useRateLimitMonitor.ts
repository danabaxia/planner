import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface RateLimitStats {
  requestsInLastSecond: number
  queueLength: number
  averageWaitTime: number
  totalRequests: number
  totalErrors: number
  lastRequestTime: number
  timestamp: string
  healthy: boolean
  queueStatus: 'empty' | 'normal' | 'busy' | 'overloaded'
  performanceStatus: 'excellent' | 'good' | 'fair' | 'poor'
}

export function useRateLimitMonitor(refreshInterval: number = 5000) {
  const { data: session } = useSession()
  const [stats, setStats] = useState<RateLimitStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!session?.accessToken) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notion/rate-limit-stats')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setStats({
          ...data.rateLimitStats,
          ...data.status,
        })
      } else {
        throw new Error(data.error || 'Failed to fetch stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [session?.accessToken])

  const clearQueue = useCallback(async () => {
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const response = await fetch('/api/notion/rate-limit-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'clear_queue' }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh stats after clearing
        await fetchStats()
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  }, [session?.accessToken, fetchStats])

  const updateConfig = useCallback(
    async (newConfig: any) => {
      if (!session?.accessToken) {
        return { success: false, error: 'Not authenticated' }
      }

      try {
        const response = await fetch('/api/notion/rate-limit-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update_config',
            config: newConfig,
          }),
        })

        const data = await response.json()

        if (data.success) {
          // Refresh stats after updating config
          await fetchStats()
          return { success: true }
        } else {
          return { success: false, error: data.error }
        }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }
      }
    },
    [session?.accessToken, fetchStats]
  )

  // Auto-refresh stats
  useEffect(() => {
    if (!session?.accessToken) {
      return
    }

    // Initial fetch
    fetchStats()

    // Set up interval for auto-refresh
    const interval = setInterval(fetchStats, refreshInterval)

    return () => clearInterval(interval)
  }, [session?.accessToken, refreshInterval, fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    clearQueue,
    updateConfig,
  }
}

// Helper hook for getting rate limit status indicators
export function useRateLimitStatus() {
  const { stats } = useRateLimitMonitor()

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'excellent':
      case 'empty':
        return 'green'
      case 'good':
      case 'normal':
        return 'blue'
      case 'fair':
      case 'busy':
        return 'yellow'
      case 'poor':
      case 'overloaded':
        return 'red'
      default:
        return 'gray'
    }
  }, [])

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'excellent':
      case 'empty':
        return '✅'
      case 'good':
      case 'normal':
        return '🟢'
      case 'fair':
      case 'busy':
        return '🟡'
      case 'poor':
      case 'overloaded':
        return '🔴'
      default:
        return '⚪'
    }
  }, [])

  return {
    stats,
    getStatusColor,
    getStatusIcon,
    isHealthy: stats?.healthy ?? false,
    queueStatus: stats?.queueStatus ?? 'empty',
    performanceStatus: stats?.performanceStatus ?? 'excellent',
  }
}
