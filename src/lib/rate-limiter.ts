// Rate limiter for Notion API
// Notion API has a rate limit of 3 requests per second per integration

export interface RateLimitConfig {
  maxRequestsPerSecond: number
  maxConcurrentRequests: number
  queueTimeout: number
  backoffMultiplier: number
  maxBackoffDelay: number
}

export interface QueuedRequest {
  id: string
  timestamp: number
  resolve: (value: any) => void
  reject: (error: any) => void
  request: () => Promise<any>
  priority: number
}

export interface RateLimitStats {
  requestsInLastSecond: number
  queueLength: number
  averageWaitTime: number
  totalRequests: number
  totalErrors: number
  lastRequestTime: number
}

export class NotionRateLimiter {
  private config: RateLimitConfig
  private requestQueue: QueuedRequest[] = []
  private requestTimes: number[] = []
  private activeRequests: number = 0
  private isProcessing: boolean = false
  private stats: RateLimitStats = {
    requestsInLastSecond: 0,
    queueLength: 0,
    averageWaitTime: 0,
    totalRequests: 0,
    totalErrors: 0,
    lastRequestTime: 0,
  }

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequestsPerSecond: 3, // Notion's limit
      maxConcurrentRequests: 10,
      queueTimeout: 30000, // 30 seconds
      backoffMultiplier: 2,
      maxBackoffDelay: 10000, // 10 seconds
      ...config,
    }
  }

  // Add request to queue with priority
  async enqueue<T>(
    request: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        resolve,
        reject,
        request,
        priority,
      }

      // Insert request in priority order (higher priority first)
      const insertIndex = this.requestQueue.findIndex(
        req => req.priority < priority
      )
      if (insertIndex === -1) {
        this.requestQueue.push(queuedRequest)
      } else {
        this.requestQueue.splice(insertIndex, 0, queuedRequest)
      }

      this.updateStats()

      // Set timeout for queued request
      setTimeout(() => {
        const index = this.requestQueue.findIndex(
          req => req.id === queuedRequest.id
        )
        if (index !== -1) {
          this.requestQueue.splice(index, 1)
          reject(new Error('Request timeout: exceeded queue timeout'))
        }
      }, this.config.queueTimeout)

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue()
      }
    })
  }

  // Process the request queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return
    }
    this.isProcessing = true

    while (this.requestQueue.length > 0) {
      // Check if we can make a request
      if (!this.canMakeRequest()) {
        await this.waitForSlot()
        continue
      }

      const queuedRequest = this.requestQueue.shift()
      if (!queuedRequest) {
        continue
      }

      this.activeRequests++
      this.stats.totalRequests++

      try {
        const startTime = Date.now()
        const result = await queuedRequest.request()

        // Track successful request
        this.requestTimes.push(Date.now())
        this.cleanupOldRequestTimes()
        this.stats.lastRequestTime = Date.now()

        // Calculate average wait time
        const waitTime = Date.now() - queuedRequest.timestamp
        this.updateAverageWaitTime(waitTime)

        queuedRequest.resolve(result)
      } catch (error) {
        this.stats.totalErrors++

        // Handle rate limit errors with backoff
        if (this.isRateLimitError(error)) {
          await this.handleRateLimitError(error)
          // Re-queue the request with lower priority
          queuedRequest.priority = Math.max(queuedRequest.priority - 1, -10)
          this.requestQueue.unshift(queuedRequest)
        } else {
          queuedRequest.reject(error)
        }
      } finally {
        this.activeRequests--
        this.updateStats()
      }
    }

    this.isProcessing = false
  }

  // Check if we can make a request based on rate limits
  private canMakeRequest(): boolean {
    this.cleanupOldRequestTimes()

    const requestsInLastSecond = this.requestTimes.length
    const hasRateCapacity =
      requestsInLastSecond < this.config.maxRequestsPerSecond
    const hasConcurrencyCapacity =
      this.activeRequests < this.config.maxConcurrentRequests

    return hasRateCapacity && hasConcurrencyCapacity
  }

  // Wait for a slot to become available
  private async waitForSlot(): Promise<void> {
    const oldestRequest = this.requestTimes[0]
    if (oldestRequest) {
      const timeToWait = 1000 - (Date.now() - oldestRequest)
      if (timeToWait > 0) {
        await new Promise(resolve => setTimeout(resolve, timeToWait))
      }
    } else {
      // No recent requests, wait a minimal amount
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Clean up old request times (older than 1 second)
  private cleanupOldRequestTimes(): void {
    const oneSecondAgo = Date.now() - 1000
    this.requestTimes = this.requestTimes.filter(time => time > oneSecondAgo)
  }

  // Check if error is a rate limit error
  private isRateLimitError(error: any): boolean {
    return (
      error?.status === 429 ||
      error?.code === 'rate_limited' ||
      error?.message?.toLowerCase().includes('rate limit')
    )
  }

  // Handle rate limit errors with exponential backoff
  private async handleRateLimitError(error: any): Promise<void> {
    // Extract retry-after header if available
    const retryAfter = error?.headers?.['retry-after']
    let delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000

    // Apply exponential backoff
    delay = Math.min(
      delay * this.config.backoffMultiplier,
      this.config.maxBackoffDelay
    )

    console.warn(`Rate limit hit, waiting ${delay}ms before retry`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // Update average wait time
  private updateAverageWaitTime(newWaitTime: number): void {
    const alpha = 0.1 // Smoothing factor for exponential moving average
    this.stats.averageWaitTime =
      this.stats.averageWaitTime * (1 - alpha) + newWaitTime * alpha
  }

  // Update stats
  private updateStats(): void {
    this.cleanupOldRequestTimes()
    this.stats.requestsInLastSecond = this.requestTimes.length
    this.stats.queueLength = this.requestQueue.length
  }

  // Get current stats
  getStats(): RateLimitStats {
    this.updateStats()
    return { ...this.stats }
  }

  // Clear the queue (useful for cleanup)
  clearQueue(): void {
    this.requestQueue.forEach(req => req.reject(new Error('Queue cleared')))
    this.requestQueue = []
    this.updateStats()
  }

  // Adjust rate limit dynamically
  updateConfig(newConfig: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Global instance for Notion API
export const notionRateLimiter = new NotionRateLimiter()

// Helper function to wrap API calls with rate limiting
export async function withRateLimit<T>(
  apiCall: () => Promise<T>,
  priority: number = 0
): Promise<T> {
  return notionRateLimiter.enqueue(apiCall, priority)
}

// Higher-level wrapper for critical requests
export async function withHighPriorityRateLimit<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  return withRateLimit(apiCall, 10)
}

// Wrapper for background/low-priority requests
export async function withLowPriorityRateLimit<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  return withRateLimit(apiCall, -5)
}
