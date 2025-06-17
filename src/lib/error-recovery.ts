// Error recovery strategies for the Daily Activity Planner

import { signIn } from 'next-auth/react'
import {
  EnhancedApiError,
  ErrorContext,
  RecoveryStrategy,
  ErrorCategory,
  ErrorSeverity,
  NotionErrorCode,
  ErrorFactory,
  logger,
  errorMonitor,
} from './errors'

// Mock function for testing
const refreshToken = async (userId: string) => {
  // In tests, this will be mocked
  return signIn('notion', { redirect: false })
}

// Token refresh recovery strategy
export class TokenRefreshRecovery implements RecoveryStrategy {
  maxAttempts = 1
  backoffMs = 1000
  private attempts = 0

  canRecover(error: EnhancedApiError): boolean {
    return (
      error.category === ErrorCategory.AUTHENTICATION &&
      (error.code === NotionErrorCode.UNAUTHORIZED ||
        error.code === NotionErrorCode.TOKEN_EXPIRED ||
        error.code === NotionErrorCode.INVALID_TOKEN ||
        error.code === 'unauthorized')
    )
  }

  async recover(error: EnhancedApiError, context?: ErrorContext): Promise<any> {
    if (this.attempts >= this.maxAttempts) {
      return {
        success: false,
        shouldRetry: false,
        reason: `Maximum recovery attempts (${this.maxAttempts}) exceeded for token refresh`
      }
    }

    this.attempts++
    logger.info('Attempting token refresh recovery', {
      errorCode: error.code,
      context,
    })

    try {
      const userId = context?.userId
      if (!userId) {
        return {
          success: false,
          shouldRetry: false,
          reason: 'No user ID provided for token refresh'
        }
      }

      await refreshToken(userId)
      logger.info('Token refresh successful')
      return { success: true, shouldRetry: true, refreshed: true }
    } catch (refreshError) {
      logger.error(
        'Token refresh failed',
        refreshError as EnhancedApiError,
        context
      )
      return {
        success: false,
        shouldRetry: false,
        reason: 'Token refresh failed'
      }
    }
  }

  reset(): void {
    this.attempts = 0
  }
}

// Rate limit recovery strategy
export class RateLimitRecovery implements RecoveryStrategy {
  maxAttempts = 3
  backoffMs = 1000
  private attempts = 0

  canRecover(error: EnhancedApiError): boolean {
    return (
      error.category === ErrorCategory.RATE_LIMIT ||
      error.code === 'rate_limited' ||
      error.code === NotionErrorCode.RATE_LIMITED
    ) && error.retryable !== false
  }

  async recover(error: EnhancedApiError, context?: ErrorContext): Promise<any> {
    if (this.attempts >= this.maxAttempts) {
      return {
        success: false,
        shouldRetry: false,
        reason: `Maximum recovery attempts (${this.maxAttempts}) exceeded for rate limit`
      }
    }

    this.attempts++
    const retryAfter = error.retryAfter || this.backoffMs * Math.pow(2, this.attempts - 1)

    logger.info(`Rate limit recovery: waiting ${retryAfter}ms`, {
      errorCode: error.code,
      retryAfter,
      context,
    })

    await new Promise(resolve => setTimeout(resolve, retryAfter))

    return { success: true, shouldRetry: true, retryAfter }
  }

  reset(): void {
    this.attempts = 0
  }
}

// Network error recovery strategy
export class NetworkErrorRecovery implements RecoveryStrategy {
  maxAttempts = 3
  backoffMs = 2000
  private attempts = 0

  canRecover(error: EnhancedApiError): boolean {
    return (
      (error.category === ErrorCategory.NETWORK ||
        error.category === ErrorCategory.TIMEOUT ||
        error.code === 'network_error' ||
        error.code === 'timeout') &&
      error.retryable !== false
    )
  }

  async recover(error: EnhancedApiError, context?: ErrorContext): Promise<any> {
    if (this.attempts >= this.maxAttempts) {
      return {
        success: false,
        shouldRetry: false,
        reason: `Maximum recovery attempts (${this.maxAttempts}) exceeded for network error`
      }
    }

    this.attempts++
    const backoffMs = this.backoffMs * Math.pow(2, this.attempts - 1)

    logger.info('Network error recovery: retrying request', {
      errorCode: error.code,
      backoffMs,
      context,
    })

    await new Promise(resolve => setTimeout(resolve, backoffMs))

    return { success: true, shouldRetry: true, retried: true }
  }

  reset(): void {
    this.attempts = 0
  }
}

// Server error recovery strategy
export class ServerErrorRecovery implements RecoveryStrategy {
  maxAttempts = 2
  backoffMs = 5000
  private attempts = 0

  canRecover(error: EnhancedApiError): boolean {
    return (
      error.category === ErrorCategory.SERVER_ERROR &&
      error.retryable !== false &&
      error.status !== 500 // Don't retry internal server errors
    )
  }

  async recover(error: EnhancedApiError, context?: ErrorContext): Promise<any> {
    if (this.attempts >= this.maxAttempts) {
      return {
        success: false,
        shouldRetry: false,
        reason: `Maximum recovery attempts (${this.maxAttempts}) exceeded for server error`
      }
    }

    this.attempts++

    logger.info('Server error recovery: retrying request', {
      errorCode: error.code,
      status: error.status,
      backoffMs: this.backoffMs,
      context,
    })

    await new Promise(resolve => setTimeout(resolve, this.backoffMs))

    return { success: true, shouldRetry: true, retried: true }
  }

  reset(): void {
    this.attempts = 0
  }
}

// Recovery manager to coordinate all recovery strategies
export class RecoveryManager {
  private strategies: RecoveryStrategy[]
  private attemptCounts = new Map<string, number>()

  constructor(strategies?: RecoveryStrategy[]) {
    this.strategies = strategies || [
      new TokenRefreshRecovery(),
      new RateLimitRecovery(),
      new NetworkErrorRecovery(),
      new ServerErrorRecovery(),
    ]
  }

  addStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy)
  }

  removeStrategy(strategyType: new () => RecoveryStrategy): void {
    this.strategies = this.strategies.filter(
      strategy => !(strategy instanceof strategyType)
    )
  }

  async attemptRecovery<T>(
    error: EnhancedApiError,
    originalOperation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T>
  async attemptRecovery(
    error: EnhancedApiError,
    context?: ErrorContext
  ): Promise<{ success: boolean; shouldRetry: boolean; reason?: string }>
  async attemptRecovery<T>(
    error: EnhancedApiError,
    originalOperationOrContext?: (() => Promise<T>) | ErrorContext,
    context?: ErrorContext
  ): Promise<T | { success: boolean; shouldRetry: boolean; reason?: string }> {
    // Determine if this is the testing version (no operation) or the full version
    const isTestingCall = typeof originalOperationOrContext !== 'function'
    const actualContext = isTestingCall 
      ? (originalOperationOrContext as ErrorContext) 
      : context
    const originalOperation = isTestingCall 
      ? undefined 
      : (originalOperationOrContext as () => Promise<T>)

    const errorKey = `${error.category}-${error.code}`
    const currentAttempts = this.attemptCounts.get(errorKey) || 0

    // Find applicable recovery strategy
    const strategy = this.strategies.find(s => s.canRecover(error))

    if (!strategy) {
      logger.warn('No recovery strategy found for error', error, actualContext)
      if (isTestingCall) {
        return { success: false, shouldRetry: false, reason: 'No recovery strategy found for error' }
      }
      throw error
    }

    if (currentAttempts >= strategy.maxAttempts) {
      logger.error('Max recovery attempts exceeded', error, {
        attempts: currentAttempts,
        maxAttempts: strategy.maxAttempts,
        ...actualContext,
      })
      
      if (isTestingCall) {
        return { 
          success: false, 
          shouldRetry: false, 
          reason: `Max recovery attempts exceeded (${currentAttempts}/${strategy.maxAttempts})` 
        }
      }
      throw error
    }

    try {
      // Increment attempt count
      this.attemptCounts.set(errorKey, currentAttempts + 1)

      // Attempt recovery
      const recoveryResult = await strategy.recover(error, actualContext)
      
      logger.info('Recovery successful', {
        strategy: strategy.constructor.name,
        attempts: currentAttempts + 1,
        result: recoveryResult,
        ...actualContext,
      })

      // Record successful recovery
      errorMonitor.recordError(error)

      if (isTestingCall) {
        return { success: true, shouldRetry: true }
      }

      // If we have an original operation, retry it
      if (originalOperation) {
        try {
          const result = await originalOperation()
          // Clear attempt count on success
          this.attemptCounts.delete(errorKey)
          return result
        } catch (retryError) {
          // If retry fails, recursively attempt recovery
          return this.attemptRecovery(retryError as EnhancedApiError, originalOperation, actualContext)
        }
      }

      throw new Error('No original operation provided for recovery')
    } catch (recoveryError) {
      logger.error('Recovery failed', recoveryError as EnhancedApiError, {
        strategy: strategy.constructor.name,
        attempts: currentAttempts + 1,
        ...actualContext,
      })

      if (isTestingCall) {
        return { 
          success: false, 
          shouldRetry: false, 
          reason: `Recovery failed: ${(recoveryError as Error).message}` 
        }
      }
      throw recoveryError
    }
  }

  reset(): void {
    this.attemptCounts.clear()
    // Reset individual strategies if they have a reset method
    this.strategies.forEach(strategy => {
      if ('reset' in strategy && typeof strategy.reset === 'function') {
        strategy.reset()
      }
    })
  }

  clearAttemptCounts(): void {
    this.attemptCounts.clear()
  }

  getAttemptCounts(): Record<string, number> {
    return Object.fromEntries(this.attemptCounts)
  }
}

// Enhanced API call wrapper with automatic recovery
export function withErrorRecovery<T>(
  operation: () => Promise<T>,
  customRecoveryManager?: RecoveryManager
): (context?: ErrorContext) => Promise<T> {
  return async (context?: ErrorContext): Promise<T> => {
    const recoveryManager = customRecoveryManager || globalRecoveryManager

    try {
      return await operation()
    } catch (error) {
      // Convert to enhanced error if needed
      let enhancedError: EnhancedApiError

      if (error instanceof Error && 'category' in error) {
        enhancedError = error as EnhancedApiError
      } else if (error instanceof Error && 'status' in error) {
        // Convert API error to enhanced error
        const apiError = error as any
        const mockResponse = {
          status: apiError.status,
          statusText: apiError.message,
          headers: new Headers()
        } as Response
        enhancedError = ErrorFactory.fromHttpResponse(
          mockResponse,
          { error: apiError.message },
          context
        )
      } else if (error instanceof Error) {
        // Convert network/generic error
        enhancedError = ErrorFactory.fromNetworkError(error, 'unknown', context)
      } else {
        // Unknown error type
        enhancedError = new EnhancedApiError(
          'Unknown error occurred',
          ErrorCategory.UNKNOWN,
          ErrorSeverity.MEDIUM,
          'unknown_error',
          undefined,
          false,
          { details: error, ...context }
        )
      }

      // Record the error for monitoring
      errorMonitor.recordError(enhancedError)

      // Attempt recovery
      return await recoveryManager.attemptRecovery(
        enhancedError,
        operation,
        context
      )
    }
  }
}

// Specialized recovery for Notion API calls
export function withNotionErrorRecovery<T>(
  operation: () => Promise<T>
): (endpoint?: string, method?: string) => Promise<T> {
  return async (endpoint?: string, method?: string): Promise<T> => {
    const context: ErrorContext = {
      endpoint,
      method,
      metadata: {
        service: 'notion',
        timestamp: new Date().toISOString(),
      },
    }

    return withErrorRecovery(operation, globalRecoveryManager)(context)
  }
}

// Global recovery manager instance
export const globalRecoveryManager = new RecoveryManager()
