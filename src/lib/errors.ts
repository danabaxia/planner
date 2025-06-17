// Comprehensive error handling system for the Daily Activity Planner

// Base error types
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  NETWORK = 'network',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  CLIENT_ERROR = 'client_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Notion-specific error codes
export enum NotionErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'unauthorized',
  INVALID_TOKEN = 'invalid_token',
  TOKEN_EXPIRED = 'token_expired',
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
  FORBIDDEN = 'forbidden',

  // Rate limiting
  RATE_LIMITED = 'rate_limited',
  TOO_MANY_REQUESTS = 'too_many_requests',

  // Resource errors
  OBJECT_NOT_FOUND = 'object_not_found',
  DATABASE_NOT_FOUND = 'database_not_found',
  PAGE_NOT_FOUND = 'page_not_found',

  // Validation errors
  INVALID_JSON = 'invalid_json',
  INVALID_REQUEST_URL = 'invalid_request_url',
  INVALID_REQUEST = 'invalid_request',
  VALIDATION_ERROR = 'validation_error',

  // Service errors
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  BAD_GATEWAY = 'bad_gateway',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  GATEWAY_TIMEOUT = 'gateway_timeout',

  // Connection errors
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  CONNECTION_ERROR = 'connection_error',
  REQUEST_TIMEOUT = 'request_timeout',

  // Unknown
  UNKNOWN = 'unknown',
}

// Enhanced error class
export class EnhancedApiError extends Error {
  public category: ErrorCategory
  public severity: ErrorSeverity
  public code: NotionErrorCode | string
  public status?: number
  public details?: any
  public timestamp: Date
  public requestId?: string
  public retryable: boolean
  public retryAfter?: number
  public context: Record<string, any>

  constructor(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    code: NotionErrorCode | string,
    status?: number,
    retryable: boolean = false,
    context: Record<string, any> = {},
    requestId?: string
  ) {
    super(message)
    this.name = 'EnhancedApiError'
    this.category = category
    this.severity = severity
    this.code = code
    this.status = status
    this.retryable = retryable
    this.context = context
    this.requestId = requestId
    this.timestamp = new Date()
  }
}

// Error context for better debugging
export interface ErrorContext {
  endpoint?: string
  method?: string
  userId?: string
  sessionId?: string
  userAgent?: string
  requestBody?: any
  headers?: Record<string, string>
  metadata?: Record<string, any>
}

// Recovery strategy interface
export interface RecoveryStrategy {
  canRecover: (error: EnhancedApiError) => boolean
  recover: (error: EnhancedApiError, context?: ErrorContext) => Promise<any>
  maxAttempts: number
  backoffMs: number
}

// Error factory class
export class ErrorFactory {
  static fromHttpResponse(
    response: Response,
    responseData?: any,
    context?: ErrorContext
  ): EnhancedApiError {
    const status = response.status
    const statusText = response.statusText
    let category: ErrorCategory
    let code: NotionErrorCode
    let severity: ErrorSeverity
    let retryable = false
    let retryAfter: number | undefined

    // Extract retry-after header for rate limiting
    const retryAfterHeader = response.headers.get('retry-after')
    if (retryAfterHeader) {
      retryAfter = parseInt(retryAfterHeader, 10)
    }

    // Extract request ID
    const requestId = response.headers.get('x-request-id') || undefined

    switch (status) {
      case 400:
        category = ErrorCategory.VALIDATION
        code = NotionErrorCode.VALIDATION_ERROR
        severity = ErrorSeverity.MEDIUM
        break
      case 401:
        category = ErrorCategory.AUTHENTICATION
        code = NotionErrorCode.UNAUTHORIZED
        severity = ErrorSeverity.HIGH
        break
      case 403:
        category = ErrorCategory.AUTHORIZATION
        code = NotionErrorCode.FORBIDDEN
        severity = ErrorSeverity.HIGH
        break
      case 404:
        category = ErrorCategory.NOT_FOUND
        code = NotionErrorCode.OBJECT_NOT_FOUND
        severity = ErrorSeverity.MEDIUM
        break
      case 429:
        category = ErrorCategory.RATE_LIMIT
        code = NotionErrorCode.RATE_LIMITED
        severity = ErrorSeverity.MEDIUM
        retryable = true
        break
      case 500:
        category = ErrorCategory.SERVER_ERROR
        code = NotionErrorCode.INTERNAL_SERVER_ERROR
        severity = ErrorSeverity.CRITICAL
        break
      case 502:
        category = ErrorCategory.SERVER_ERROR
        code = NotionErrorCode.BAD_GATEWAY
        severity = ErrorSeverity.HIGH
        retryable = true
        break
      case 503:
        category = ErrorCategory.SERVER_ERROR
        code = NotionErrorCode.SERVICE_UNAVAILABLE
        severity = ErrorSeverity.HIGH
        retryable = true
        break
      case 504:
        category = ErrorCategory.TIMEOUT
        code = NotionErrorCode.GATEWAY_TIMEOUT
        severity = ErrorSeverity.MEDIUM
        retryable = true
        break
      default:
        if (status >= 500) {
          category = ErrorCategory.SERVER_ERROR
          code = NotionErrorCode.INTERNAL_SERVER_ERROR
          severity = ErrorSeverity.HIGH
          retryable = true
        } else {
          category = ErrorCategory.CLIENT_ERROR
          code = NotionErrorCode.INVALID_REQUEST
          severity = ErrorSeverity.MEDIUM
        }
    }

    const message = responseData?.error || statusText || `HTTP ${status} Error`
    const errorContext = {
      ...context,
      retryAfter,
      responseData,
    }

    return new EnhancedApiError(
      message,
      category,
      severity,
      code,
      status,
      retryable,
      errorContext,
      requestId
    )
  }

  static fromNetworkError(
    originalError: Error,
    type: 'timeout' | 'network' | 'unknown' = 'network',
    context?: ErrorContext
  ): EnhancedApiError {
    let category: ErrorCategory
    let code: NotionErrorCode
    let severity: ErrorSeverity
    let retryable = true

    switch (type) {
      case 'timeout':
        category = ErrorCategory.TIMEOUT
        code = NotionErrorCode.REQUEST_TIMEOUT
        severity = ErrorSeverity.MEDIUM
        break
      case 'network':
        category = ErrorCategory.NETWORK
        code = NotionErrorCode.NETWORK_ERROR
        severity = ErrorSeverity.HIGH
        break
      default:
        category = ErrorCategory.UNKNOWN
        code = NotionErrorCode.UNKNOWN
        severity = ErrorSeverity.MEDIUM
        retryable = false
    }

    return new EnhancedApiError(
      originalError.message,
      category,
      severity,
      code,
      undefined,
      retryable,
      context || {}
    )
  }
}

// Logger class
export class Logger {
  private static instance: Logger
  private logLevel: LogLevel = LogLevel.INFO

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    error?: EnhancedApiError,
    context?: Record<string, any>
  ): string {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(error && { error: { 
        name: error.name,
        message: error.message,
        category: error.category,
        code: error.code,
        status: error.status,
      }}),
      ...context,
    }

    return JSON.stringify(logEntry)
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message, undefined, context)
      console.log(formatted)
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage(LogLevel.INFO, message, undefined, context)
      console.log(formatted)
    }
  }

  warn(
    message: string,
    error?: EnhancedApiError,
    context?: Record<string, any>
  ): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage(LogLevel.WARN, message, error, context)
      console.warn(formatted)
    }
  }

  error(
    message: string,
    error?: EnhancedApiError,
    context?: Record<string, any>
  ): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage(LogLevel.ERROR, message, error, context)
      console.error(formatted)
    }
  }

  fatal(
    message: string,
    error?: EnhancedApiError,
    context?: Record<string, any>
  ): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      const formatted = this.formatMessage(LogLevel.FATAL, message, error, context)
      console.error(this.formatMessage(LogLevel.FATAL, message, error, context))
    }
  }

  logError(error: EnhancedApiError, context?: Record<string, any>): void {
    const level =
      error.severity === ErrorSeverity.CRITICAL
        ? LogLevel.FATAL
        : LogLevel.ERROR
    const message = `${error.category.toUpperCase()}: ${error.message}`

    if (level === LogLevel.FATAL) {
      this.fatal(message, error, context)
    } else {
      this.error(message, error, context)
    }
  }
}

// User-friendly error messages
export class ErrorMessageMapper {
  private static messages: Record<string, string> = {
    // Authentication errors
    [NotionErrorCode.UNAUTHORIZED]:
      'Please sign in to access your Notion workspace.',
    [NotionErrorCode.INVALID_TOKEN]:
      'Your session has expired. Please sign in again.',
    [NotionErrorCode.TOKEN_EXPIRED]:
      'Your session has expired. Please sign in again.',
    [NotionErrorCode.INSUFFICIENT_PERMISSIONS]:
      "You don't have permission to access this resource. Please check your Notion workspace permissions.",
    [NotionErrorCode.FORBIDDEN]:
      "You don't have permission to access this resource.",

    // Rate limiting
    [NotionErrorCode.RATE_LIMITED]:
      'Too many requests. Please wait a moment and try again.',
    [NotionErrorCode.TOO_MANY_REQUESTS]:
      'Too many requests. Please wait a moment and try again.',

    // Resource errors
    [NotionErrorCode.OBJECT_NOT_FOUND]:
      'The requested item could not be found.',
    [NotionErrorCode.DATABASE_NOT_FOUND]:
      'The database could not be found. Please check if it still exists in your Notion workspace.',
    [NotionErrorCode.PAGE_NOT_FOUND]:
      'The page could not be found. It may have been deleted or moved.',

    // Validation errors
    [NotionErrorCode.INVALID_JSON]: 'Invalid data format. Please try again.',
    [NotionErrorCode.INVALID_REQUEST_URL]: 'Invalid request. Please try again.',
    [NotionErrorCode.INVALID_REQUEST]:
      'Invalid request. Please check your input and try again.',
    [NotionErrorCode.VALIDATION_ERROR]:
      'Please check your input and try again.',

    // Service errors
    [NotionErrorCode.INTERNAL_SERVER_ERROR]:
      'A server error occurred. Please try again later.',
    [NotionErrorCode.BAD_GATEWAY]:
      'Service temporarily unavailable. Please try again later.',
    [NotionErrorCode.SERVICE_UNAVAILABLE]:
      'Service temporarily unavailable. Please try again later.',
    [NotionErrorCode.GATEWAY_TIMEOUT]: 'Request timed out. Please try again.',

    // Connection errors
    [NotionErrorCode.NETWORK_ERROR]:
      'Network connection error. Please check your internet connection and try again.',
    [NotionErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
    [NotionErrorCode.CONNECTION_ERROR]:
      'Connection error. Please check your internet connection and try again.',
    [NotionErrorCode.REQUEST_TIMEOUT]: 'Request timed out. Please try again.',

    // Unknown
    [NotionErrorCode.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  }

  static getMessage(code: NotionErrorCode | string, context?: Record<string, any>): string {
    let message = this.messages[code]
    
    if (message && context) {
      // Handle rate limiting with retry info
      if (code === NotionErrorCode.RATE_LIMITED && context.retryAfter) {
        message = `Too many requests. Please wait ${context.retryAfter} seconds and try again.`
      }
      
      // Handle validation errors with field info
      if (code === NotionErrorCode.VALIDATION_ERROR && context.field) {
        message = `Validation error for ${context.field}. Please check your input and try again.`
      }
    }

    if (!message) {
      message = 'An unexpected error occurred. Please try again.'
    }

    return message
  }

  static getUserFriendlyMessage(error: EnhancedApiError): string {
    return this.getMessage(error.code, error.context)
  }

  static addCustomMessage(code: string, message: string): void {
    this.messages[code] = message
  }
}

// Error statistics and monitoring
export interface ErrorStats {
  total: number
  byCategory: Record<ErrorCategory, number>
  bySeverity: Record<ErrorSeverity, number>
  byCode: Record<string, number>
}

export interface ErrorTrend {
  category: ErrorCategory
  count: number
  percentage: number
}

export class ErrorMonitor {
  private stats: ErrorStats = {
    total: 0,
    byCategory: {} as Record<ErrorCategory, number>,
    bySeverity: {} as Record<ErrorSeverity, number>,
    byCode: {},
  }
  private recentErrors: EnhancedApiError[] = []
  private maxRecentErrors = 100

  recordError(error: EnhancedApiError): void {
    this.stats.total++

    // Update category stats
    this.stats.byCategory[error.category] =
      (this.stats.byCategory[error.category] || 0) + 1

    // Update severity stats
    this.stats.bySeverity[error.severity] =
      (this.stats.bySeverity[error.severity] || 0) + 1

    // Update code stats
    this.stats.byCode[error.code] =
      (this.stats.byCode[error.code] || 0) + 1

    // Add to recent errors
    this.recentErrors.unshift(error)
    if (this.recentErrors.length > this.maxRecentErrors) {
      this.recentErrors = this.recentErrors.slice(0, this.maxRecentErrors)
    }
  }

  getErrorStats(): ErrorStats {
    return { ...this.stats }
  }

  getRecentErrors(): EnhancedApiError[] {
    return [...this.recentErrors]
  }

  getErrorTrends(): ErrorTrend[] {
    const trends: ErrorTrend[] = []
    
    for (const [category, count] of Object.entries(this.stats.byCategory)) {
      trends.push({
        category: category as ErrorCategory,
        count,
        percentage: (count / this.stats.total) * 100,
      })
    }

    return trends.sort((a, b) => b.count - a.count)
  }

  reset(): void {
    this.stats = {
      total: 0,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      byCode: {},
    }
    this.recentErrors = []
  }
}

// Global error handler instance
export const logger = Logger.getInstance()
export const errorMonitor = new ErrorMonitor()
