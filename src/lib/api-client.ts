import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import {
  EnhancedApiError,
  ErrorFactory,
  ErrorContext,
  logger,
  errorMonitor,
  ErrorMessageMapper,
} from './errors'

// Types for API responses and errors
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
  success: boolean
}

export interface ApiError extends Error {
  status?: number
  code?: string
  details?: any
}

export interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  skipAuth?: boolean
}

// Base API Client class
export class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private defaultTimeout: number = 30000
  private defaultRetries: number = 3
  private defaultRetryDelay: number = 1000

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    }
  }

  // Request interceptor
  private async beforeRequest(
    endpoint: string,
    config: RequestConfig
  ): Promise<[string, RequestConfig]> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint}`

    // Add authentication if not skipped
    if (!config.skipAuth) {
      const session = await getServerSession(authOptions)
      if (session?.accessToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${session.accessToken}`,
        }
      }
    }

    // Merge headers
    config.headers = {
      ...this.defaultHeaders,
      ...config.headers,
    }

    return [url, config]
  }

  // Response interceptor
  private async afterResponse<T>(
    response: Response,
    context?: ErrorContext
  ): Promise<ApiResponse<T>> {
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json')

    try {
      const data = isJson ? await response.json() : await response.text()

      if (!response.ok) {
        // Create enhanced error with proper categorization
        const enhancedError = ErrorFactory.fromHttpResponse(
          response,
          data,
          context
        )

        // Extract retry-after header for rate limiting
        const retryAfter = response.headers.get('retry-after')
        if (retryAfter) {
          enhancedError.retryAfter = parseInt(retryAfter) * 1000
        }

        // Record error for monitoring
        errorMonitor.recordError(enhancedError)

        throw enhancedError
      }

      return {
        data,
        status: response.status,
        success: true,
      }
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error
      }

      // Create enhanced error for parsing failures
      const enhancedError = ErrorFactory.fromHttpResponse(
        response,
        error,
        context
      )

      errorMonitor.recordError(enhancedError)
      throw enhancedError
    }
  }

  // Core request method with retry logic
  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {},
    context?: ErrorContext
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      ...requestConfig
    } = config

    const [url, finalConfig] = await this.beforeRequest(endpoint, requestConfig)

    let lastError: EnhancedApiError | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          ...finalConfig,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        return await this.afterResponse<T>(response, context)
      } catch (error) {
        // Handle timeout errors
        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutError = new Error('Request timeout')
          timeoutError.name = 'AbortError'
          lastError = ErrorFactory.fromNetworkError(timeoutError, 'timeout', context)
        } else if (error instanceof Error && 'category' in error) {
          lastError = error as EnhancedApiError
        } else {
          const networkError =
            error instanceof Error ? error : new Error('Network error')
          lastError = ErrorFactory.fromNetworkError(networkError, 'network', context)
        }

        // Record error for monitoring
        errorMonitor.recordError(lastError)

        // Check if error is retryable
        const isRetryable = lastError.retryable !== false

        // Don't retry on non-retryable errors
        if (!isRetryable) {
          logger.warn('Non-retryable error encountered', lastError, {
            endpoint,
            attempt: attempt + 1,
          })
          break
        }

        // Don't retry on last attempt
        if (attempt === retries) {
          logger.warn('Max retries reached', lastError, {
            endpoint,
            attempts: attempt + 1,
            maxRetries: retries,
          })
          break
        }

        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt)

        logger.warn('Retrying request', lastError, {
          endpoint,
          attempt: attempt + 1,
          maxRetries: retries,
          delay,
        })

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw (
      lastError ||
      ErrorFactory.fromNetworkError(
        new Error('Request failed after all retries'),
        'network',
        context
      )
    )
  }

  // HTTP Methods
  async get<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' })
  }

  // Utility methods
  setDefaultHeader(key: string, value: string) {
    this.defaultHeaders[key] = value
  }

  removeDefaultHeader(key: string) {
    delete this.defaultHeaders[key]
  }

  setDefaultTimeout(timeout: number) {
    this.defaultTimeout = timeout
  }

  setDefaultRetries(retries: number) {
    this.defaultRetries = retries
  }
}

// Create pre-configured API clients
export const notionApiClient = new ApiClient('https://api.notion.com/v1', {
  'Notion-Version': '2022-06-28',
})

export const internalApiClient = new ApiClient('/api', {})

// Helper function for handling API errors in components
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    const apiError = error as ApiError

    if (apiError.status === 401) {
      return 'Authentication required. Please sign in again.'
    }

    if (apiError.status === 403) {
      return 'Access denied. You do not have permission to perform this action.'
    }

    if (apiError.status === 404) {
      return 'The requested resource was not found.'
    }

    if (apiError.status === 429) {
      return 'Too many requests. Please try again later.'
    }

    if (apiError.status && apiError.status >= 500) {
      return 'Server error. Please try again later.'
    }

    return apiError.message || 'An unexpected error occurred.'
  }

  return 'An unexpected error occurred.'
}

// Helper function for safe API calls with error handling
export async function safeApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await apiCall()
    return { data: response.data || null, error: null }
  } catch (error) {
    return { data: null, error: handleApiError(error) }
  }
}
