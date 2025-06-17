import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  NotionDatabase,
  NotionPage,
  NotionUser,
  safeGetNotionUser,
  safeGetNotionDatabases,
  safeQueryDatabase,
  validateDatabaseForPlanning,
} from '@/lib/notion'
import { handleApiError } from '@/lib/api-client'

// Hook for getting user info
export function useNotionUser() {
  const { data: session } = useSession()
  const [user, setUser] = useState<NotionUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    if (!session?.accessToken) {
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: apiError } = await safeGetNotionUser()

    if (apiError) {
      setError(apiError)
    } else if (data) {
      const userData = await data
      setUser(userData)
    }

    setLoading(false)
  }, [session?.accessToken])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { user, loading, error, refetch: fetchUser }
}

// Hook for getting databases
export function useNotionDatabases() {
  const { data: session } = useSession()
  const [databases, setDatabases] = useState<NotionDatabase[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDatabases = useCallback(async () => {
    if (!session?.accessToken) {
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: apiError } = await safeGetNotionDatabases()

    if (apiError) {
      setError(apiError)
    } else if (data) {
      const databaseData = await data
      setDatabases(databaseData?.results || [])
    }

    setLoading(false)
  }, [session?.accessToken])

  useEffect(() => {
    fetchDatabases()
  }, [fetchDatabases])

  return { databases, loading, error, refetch: fetchDatabases }
}

// Hook for querying a specific database
export function useNotionDatabase(databaseId: string | null, options?: any) {
  const { data: session } = useSession()
  const [pages, setPages] = useState<NotionPage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | undefined>()

  const fetchPages = useCallback(
    async (cursor?: string) => {
      if (!session?.accessToken || !databaseId) {
        return
      }

      setLoading(true)
      setError(null)

      const { data, error: apiError } = await safeQueryDatabase(databaseId, {
        ...options,
        start_cursor: cursor,
      })

      if (apiError) {
        setError(apiError)
      } else if (data) {
        const pageData = await data
        if (cursor) {
          // Append to existing pages for pagination
          setPages(prev => [...prev, ...(pageData?.results || [])])
        } else {
          // Replace pages for fresh fetch
          setPages(pageData?.results || [])
        }
        setHasMore(pageData?.has_more || false)
        setNextCursor(pageData?.next_cursor)
      }

      setLoading(false)
    },
    [session?.accessToken, databaseId, options]
  )

  const loadMore = useCallback(() => {
    if (hasMore && nextCursor && !loading) {
      fetchPages(nextCursor)
    }
  }, [hasMore, nextCursor, loading, fetchPages])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  return {
    pages,
    loading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchPages(),
  }
}

// Hook for validating databases for planning use
export function useNotionDatabaseValidation(databases: NotionDatabase[]) {
  const [validationResults, setValidationResults] = useState<
    Record<string, ReturnType<typeof validateDatabaseForPlanning>>
  >({})

  useEffect(() => {
    const results: Record<
      string,
      ReturnType<typeof validateDatabaseForPlanning>
    > = {}

    databases.forEach(database => {
      results[database.id] = validateDatabaseForPlanning(database)
    })

    setValidationResults(results)
  }, [databases])

  const getValidDatabases = useCallback(() => {
    return databases.filter(db => validationResults[db.id]?.isValid)
  }, [databases, validationResults])

  const getInvalidDatabases = useCallback(() => {
    return databases.filter(db => !validationResults[db.id]?.isValid)
  }, [databases, validationResults])

  return {
    validationResults,
    getValidDatabases,
    getInvalidDatabases,
  }
}

// Hook for making custom Notion API calls
export function useNotionAPI() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const makeApiCall = useCallback(
    async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
      if (!session?.accessToken) {
        setError('No authentication token available')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const result = await apiCall()
        return result
      } catch (err) {
        const errorMessage = handleApiError(err)
        setError(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [session?.accessToken]
  )

  return { makeApiCall, loading, error }
}
