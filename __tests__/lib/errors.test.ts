import {
  EnhancedApiError,
  ErrorFactory,
  Logger,
  ErrorMessageMapper,
  ErrorMonitor,
  ErrorCategory,
  ErrorSeverity,
  LogLevel,
  NotionErrorCode,
} from '@/lib/errors';

describe('EnhancedApiError', () => {
  it('should create an error with all properties', () => {
    const error = new EnhancedApiError(
      'Test error',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      NotionErrorCode.UNAUTHORIZED,
      401,
      true,
      { userId: '123' },
      'req-123'
    );

    expect(error.message).toBe('Test error');
    expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.code).toBe(NotionErrorCode.UNAUTHORIZED);
    expect(error.status).toBe(401);
    expect(error.retryable).toBe(true);
    expect(error.context).toEqual({ userId: '123' });
    expect(error.requestId).toBe('req-123');
    expect(error.timestamp).toBeInstanceOf(Date);
    expect(error.name).toBe('EnhancedApiError');
  });

  it('should create an error with minimal properties', () => {
    const error = new EnhancedApiError(
      'Simple error',
      ErrorCategory.UNKNOWN,
      ErrorSeverity.LOW,
      NotionErrorCode.UNKNOWN
    );

    expect(error.message).toBe('Simple error');
    expect(error.category).toBe(ErrorCategory.UNKNOWN);
    expect(error.severity).toBe(ErrorSeverity.LOW);
    expect(error.code).toBe(NotionErrorCode.UNKNOWN);
    expect(error.status).toBeUndefined();
    expect(error.retryable).toBe(false);
    expect(error.context).toEqual({});
    expect(error.requestId).toBeUndefined();
  });
});

describe('ErrorFactory', () => {
  describe('fromHttpResponse', () => {
    it('should create authentication error for 401', () => {
      const response = {
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'x-request-id': 'req-123' }),
      } as Response;

      const error = ErrorFactory.fromHttpResponse(
        response,
        { error: 'Invalid token' },
        { userId: '123' }
      );

      expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.code).toBe(NotionErrorCode.UNAUTHORIZED);
      expect(error.status).toBe(401);
      expect(error.retryable).toBe(false);
      expect(error.requestId).toBe('req-123');
    });

    it('should create authorization error for 403', () => {
      const response = {
        status: 403,
        statusText: 'Forbidden',
        headers: new Headers(),
      } as Response;

      const error = ErrorFactory.fromHttpResponse(response, { error: 'Access denied' });

      expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(error.code).toBe(NotionErrorCode.FORBIDDEN);
      expect(error.retryable).toBe(false);
    });

    it('should create rate limit error for 429', () => {
      const response = {
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'retry-after': '60' }),
      } as Response;

      const error = ErrorFactory.fromHttpResponse(response, { error: 'Rate limited' });

      expect(error.category).toBe(ErrorCategory.RATE_LIMIT);
      expect(error.code).toBe(NotionErrorCode.RATE_LIMITED);
      expect(error.retryable).toBe(true);
      expect(error.context.retryAfter).toBe(60);
    });

    it('should create validation error for 400', () => {
      const response = {
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers(),
      } as Response;

      const error = ErrorFactory.fromHttpResponse(
        response,
        { error: 'Invalid input', details: { field: 'email' } }
      );

      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.code).toBe(NotionErrorCode.VALIDATION_ERROR);
      expect(error.retryable).toBe(false);
    });

    it('should create not found error for 404', () => {
      const response = {
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
      } as Response;

      const error = ErrorFactory.fromHttpResponse(response, { error: 'Resource not found' });

      expect(error.category).toBe(ErrorCategory.NOT_FOUND);
      expect(error.code).toBe(NotionErrorCode.OBJECT_NOT_FOUND);
      expect(error.retryable).toBe(false);
    });

    it('should create server error for 500', () => {
      const response = {
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
      } as Response;

      const error = ErrorFactory.fromHttpResponse(response, { error: 'Server error' });

      expect(error.category).toBe(ErrorCategory.SERVER_ERROR);
      expect(error.code).toBe(NotionErrorCode.INTERNAL_SERVER_ERROR);
      expect(error.retryable).toBe(false);
    });

    it('should create client error for other 4xx', () => {
      const response = {
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: new Headers(),
      } as Response;

      const error = ErrorFactory.fromHttpResponse(response, { error: 'Invalid data' });

      expect(error.category).toBe(ErrorCategory.CLIENT_ERROR);
      expect(error.code).toBe(NotionErrorCode.INVALID_REQUEST);
      expect(error.retryable).toBe(false);
    });
  });

  describe('fromNetworkError', () => {
    it('should create timeout error', () => {
      const networkError = new Error('Request timeout');
      const error = ErrorFactory.fromNetworkError(networkError, 'timeout', { endpoint: '/api/test' });

      expect(error.category).toBe(ErrorCategory.TIMEOUT);
      expect(error.code).toBe(NotionErrorCode.REQUEST_TIMEOUT);
      expect(error.retryable).toBe(true);
      expect(error.context.endpoint).toBe('/api/test');
    });

    it('should create network error', () => {
      const networkError = new Error('Network failure');
      const error = ErrorFactory.fromNetworkError(networkError, 'network');

      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.code).toBe(NotionErrorCode.NETWORK_ERROR);
      expect(error.retryable).toBe(true);
    });

    it('should create unknown error for unspecified type', () => {
      const networkError = new Error('Unknown failure');
      const error = ErrorFactory.fromNetworkError(networkError, 'unknown');

      expect(error.category).toBe(ErrorCategory.UNKNOWN);
      expect(error.code).toBe(NotionErrorCode.UNKNOWN);
      expect(error.retryable).toBe(false);
    });
  });
});

describe('Logger', () => {
  let logger: Logger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger(LogLevel.DEBUG);
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should log debug messages when level is DEBUG', () => {
    logger.debug('Debug message', { extra: 'data' });
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/"level":"debug".*"message":"Debug message".*"extra":"data"/)
    );
  });

  it('should not log debug messages when level is INFO', () => {
    logger = new Logger(LogLevel.INFO);
    logger.debug('Debug message');
    
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should log info messages', () => {
    logger.info('Info message');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/"level":"info".*"message":"Info message"/)
    );
  });

  it('should log warn messages', () => {
    logger.warn('Warning message');
    
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/"level":"warn".*"message":"Warning message"/)
    );
  });

  it('should log error messages', () => {
    const error = new EnhancedApiError(
      'Test error',
      ErrorCategory.UNKNOWN,
      ErrorSeverity.LOW,
      NotionErrorCode.UNKNOWN
    );
    logger.error('Error message', error);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/"level":"error".*"message":"Error message".*"error"/)
    );
  });

  it('should log fatal messages', () => {
    logger.fatal('Fatal message');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/"level":"fatal".*"message":"Fatal message"/)
    );
  });

  it('should include timestamp in log entries', () => {
    logger.info('Test message');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('"timestamp"')
    );
  });
});

describe('ErrorMessageMapper', () => {
  it('should return specific message for known error codes', () => {
    const message = ErrorMessageMapper.getMessage(NotionErrorCode.UNAUTHORIZED);
    expect(message).toContain('sign in');
    expect(message).toContain('Notion workspace');
  });

  it('should return rate limit message with retry info', () => {
    const message = ErrorMessageMapper.getMessage(
      NotionErrorCode.RATE_LIMITED,
      { retryAfter: 60 }
    );
    expect(message).toContain('Too many requests');
    expect(message).toContain('60 seconds');
  });

  it('should return validation message with field info', () => {
    const message = ErrorMessageMapper.getMessage(
      NotionErrorCode.VALIDATION_ERROR,
      { field: 'email', details: 'Invalid format' }
    );
    expect(message).toContain('Validation error for email');
    expect(message).toContain('email');
  });

  it('should return generic message for unknown error codes', () => {
    const message = ErrorMessageMapper.getMessage('UNKNOWN_CODE' as NotionErrorCode);
    expect(message).toContain('unexpected error');
  });

  it('should handle missing context gracefully', () => {
    const message = ErrorMessageMapper.getMessage(NotionErrorCode.RATE_LIMITED);
    expect(message).toContain('Too many requests');
    expect(message).not.toContain('undefined');
  });
});

describe('ErrorMonitor', () => {
  let monitor: ErrorMonitor;

  beforeEach(() => {
    monitor = new ErrorMonitor();
  });

  it('should record error statistics', () => {
    const error = new EnhancedApiError(
      'Test error',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      NotionErrorCode.UNAUTHORIZED
    );

    monitor.recordError(error);
    const stats = monitor.getErrorStats();

    expect(stats.total).toBe(1);
    expect(stats.byCategory[ErrorCategory.AUTHENTICATION]).toBe(1);
    expect(stats.bySeverity[ErrorSeverity.HIGH]).toBe(1);
    expect(stats.byCode[NotionErrorCode.UNAUTHORIZED]).toBe(1);
  });

  it('should track error trends', () => {
    const error1 = new EnhancedApiError(
      'Error 1',
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      NotionErrorCode.NETWORK_ERROR
    );
    const error2 = new EnhancedApiError(
      'Error 2',
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      NotionErrorCode.NETWORK_ERROR
    );

    monitor.recordError(error1);
    monitor.recordError(error2);

    const trends = monitor.getErrorTrends();
    expect(trends.length).toBeGreaterThan(0);
    expect(trends[0].category).toBe(ErrorCategory.NETWORK);
    expect(trends[0].count).toBe(2);
  });

  it('should maintain recent errors list', () => {
    const error = new EnhancedApiError(
      'Recent error',
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      NotionErrorCode.VALIDATION_ERROR
    );

    monitor.recordError(error);
    const recent = monitor.getRecentErrors();

    expect(recent).toHaveLength(1);
    expect(recent[0]).toBe(error);
  });

  it('should limit recent errors to maximum count', () => {
    // Record more than the maximum (100) errors
    for (let i = 0; i < 150; i++) {
      const error = new EnhancedApiError(
        `Error ${i}`,
        ErrorCategory.UNKNOWN,
        ErrorSeverity.LOW,
        NotionErrorCode.UNKNOWN
      );
      monitor.recordError(error);
    }

    const recent = monitor.getRecentErrors();
    expect(recent).toHaveLength(100);
  });

  it('should reset statistics', () => {
    const error = new EnhancedApiError(
      'Test error',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      NotionErrorCode.UNAUTHORIZED
    );

    monitor.recordError(error);
    expect(monitor.getErrorStats().total).toBe(1);

    monitor.reset();
    expect(monitor.getErrorStats().total).toBe(0);
    expect(monitor.getRecentErrors()).toHaveLength(0);
  });
}); 