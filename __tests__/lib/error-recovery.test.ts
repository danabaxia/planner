import {
  TokenRefreshRecovery,
  RateLimitRecovery,
  NetworkErrorRecovery,
  ServerErrorRecovery,
  RecoveryManager,
  withErrorRecovery,
  withNotionErrorRecovery,
  globalRecoveryManager,
} from '@/lib/error-recovery';
import {
  EnhancedApiError,
  ErrorCategory,
  ErrorSeverity,
  NotionErrorCode,
} from '@/lib/errors';

// Mock the NextAuth module
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('TokenRefreshRecovery', () => {
  let recovery: TokenRefreshRecovery;
  const mockSignIn = require('next-auth/react').signIn;

  beforeEach(() => {
    recovery = new TokenRefreshRecovery();
    mockSignIn.mockClear();
    recovery.reset();
  });

  it('should handle authentication errors', () => {
    const error = new EnhancedApiError(
      'Unauthorized',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      NotionErrorCode.UNAUTHORIZED,
      401
    );

    expect(recovery.canRecover(error)).toBe(true);
  });

  it('should not handle non-authentication errors', () => {
    const error = new EnhancedApiError(
      'Not found',
      ErrorCategory.NOT_FOUND,
      ErrorSeverity.MEDIUM,
      NotionErrorCode.OBJECT_NOT_FOUND,
      404
    );

    expect(recovery.canRecover(error)).toBe(false);
  });

  it('should attempt token refresh on recovery', async () => {
    const error = new EnhancedApiError(
      'Unauthorized',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      NotionErrorCode.UNAUTHORIZED,
      401
    );

    mockSignIn.mockResolvedValueOnce({ ok: true });

    const result = await recovery.recover(error, { userId: '123' });

    expect(result.success).toBe(true);
    expect(result.shouldRetry).toBe(true);
    expect(mockSignIn).toHaveBeenCalledWith('notion', { redirect: false });
  });

  it('should fail recovery when token refresh fails', async () => {
    const error = new EnhancedApiError(
      'Unauthorized',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      NotionErrorCode.UNAUTHORIZED,
      401
    );

    mockSignIn.mockRejectedValueOnce(new Error('Refresh failed'));

    const result = await recovery.recover(error, { userId: '123' });

    expect(result.success).toBe(false);
    expect(result.shouldRetry).toBe(false);
  });

  it('should respect max attempts', async () => {
    const error = new EnhancedApiError(
      'Unauthorized',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      NotionErrorCode.UNAUTHORIZED,
      401
    );

    // First attempt should work
    mockSignIn.mockResolvedValueOnce({ ok: true });
    let result = await recovery.recover(error, { userId: '123' });
    expect(result.success).toBe(true);

    // Second attempt should be rejected (max attempts = 1)
    result = await recovery.recover(error, { userId: '123' });
    expect(result.success).toBe(false);
    expect(result.reason).toContain('Maximum recovery attempts');
  });
});

describe('RateLimitRecovery', () => {
  let recovery: RateLimitRecovery;

  beforeEach(() => {
    recovery = new RateLimitRecovery();
    recovery.reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should handle rate limit errors', () => {
    const error = new EnhancedApiError(
      'Rate limited',
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      NotionErrorCode.RATE_LIMITED,
      429,
      true // retryable
    );

    expect(recovery.canRecover(error)).toBe(true);
  });

  it('should not handle non-rate-limit errors', () => {
    const error = new EnhancedApiError(
      'Server error',
      ErrorCategory.SERVER_ERROR,
      ErrorSeverity.HIGH,
      NotionErrorCode.INTERNAL_SERVER_ERROR,
      500
    );

    expect(recovery.canRecover(error)).toBe(false);
  });

  it('should calculate delay from retry-after header', async () => {
    const error = new EnhancedApiError(
      'Rate limited',
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      NotionErrorCode.RATE_LIMITED,
      429,
      true,
      { retryAfter: 1000 }
    );

    const recoveryPromise = recovery.recover(error, {});
    
    // Fast-forward time
    jest.advanceTimersByTime(1000);
    
    const result = await recoveryPromise;
    expect(result.success).toBe(true);
    expect(result.shouldRetry).toBe(true);
  });

  it('should use exponential backoff when no retry-after header', async () => {
    const error = new EnhancedApiError(
      'Rate limited',
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      NotionErrorCode.RATE_LIMITED,
      429,
      true // retryable
    );

    const recoveryPromise = recovery.recover(error, {});
    
    // First attempt should use base delay (1000ms)
    jest.advanceTimersByTime(1000);
    
    const result = await recoveryPromise;
    expect(result.success).toBe(true);
    expect(result.shouldRetry).toBe(true);
  });

  it('should respect max attempts', async () => {
    const error = new EnhancedApiError(
      'Rate limited',
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      NotionErrorCode.RATE_LIMITED,
      429,
      true // retryable
    );

    // Exhaust all attempts
    for (let i = 0; i < 3; i++) {
      const recoveryPromise = recovery.recover(error, {});
      jest.advanceTimersByTime(1000 * Math.pow(2, i));
      const result = await recoveryPromise;
      expect(result.success).toBe(true);
    }

    // Fourth attempt should fail
    const result = await recovery.recover(error, {});
    expect(result.success).toBe(false);
    expect(result.reason).toContain('Maximum recovery attempts');
  }, 10000);
});

describe('NetworkErrorRecovery', () => {
  let recovery: NetworkErrorRecovery;

  beforeEach(() => {
    recovery = new NetworkErrorRecovery();
    recovery.reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should handle network errors', () => {
    const error = new EnhancedApiError(
      'Network error',
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      NotionErrorCode.NETWORK_ERROR,
      undefined,
      true // retryable
    );

    expect(recovery.canRecover(error)).toBe(true);
  });

  it('should handle timeout errors', () => {
    const error = new EnhancedApiError(
      'Timeout',
      ErrorCategory.TIMEOUT,
      ErrorSeverity.HIGH,
      NotionErrorCode.REQUEST_TIMEOUT,
      undefined,
      true // retryable
    );

    expect(recovery.canRecover(error)).toBe(true);
  });

  it('should not handle other error types', () => {
    const error = new EnhancedApiError(
      'Validation error',
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      NotionErrorCode.VALIDATION_ERROR,
      400
    );

    expect(recovery.canRecover(error)).toBe(false);
  });

  it('should use exponential backoff for recovery', async () => {
    const error = new EnhancedApiError(
      'Network error',
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      NotionErrorCode.NETWORK_ERROR,
      undefined,
      true // retryable
    );

    // First attempt: 2000ms
    const recoveryPromise1 = recovery.recover(error, {});
    jest.advanceTimersByTime(2000);
    const result1 = await recoveryPromise1;
    expect(result1.success).toBe(true);

    // Second attempt: 4000ms (2000 * 2^1)
    const recoveryPromise2 = recovery.recover(error, {});
    jest.advanceTimersByTime(4000);
    const result2 = await recoveryPromise2;
    expect(result2.success).toBe(true);

    // Third attempt: 8000ms (2000 * 2^2)
    const recoveryPromise3 = recovery.recover(error, {});
    jest.advanceTimersByTime(8000);
    const result3 = await recoveryPromise3;
    expect(result3.success).toBe(true);

    // Fourth attempt should fail (max attempts = 3)
    const result4 = await recovery.recover(error, {});
    expect(result4.success).toBe(false);
    expect(result4.reason).toContain('Maximum recovery attempts');
  }, 10000);
});

describe('ServerErrorRecovery', () => {
  let recovery: ServerErrorRecovery;

  beforeEach(() => {
    recovery = new ServerErrorRecovery();
    recovery.reset();
  });

  it('should handle server errors except 500', () => {
    const error502 = new EnhancedApiError(
      'Bad Gateway',
      ErrorCategory.SERVER_ERROR,
      ErrorSeverity.HIGH,
      NotionErrorCode.BAD_GATEWAY,
      502,
      true // retryable
    );

    const error503 = new EnhancedApiError(
      'Service Unavailable',
      ErrorCategory.SERVER_ERROR,
      ErrorSeverity.HIGH,
      NotionErrorCode.SERVICE_UNAVAILABLE,
      503,
      true // retryable
    );

    expect(recovery.canRecover(error502)).toBe(true);
    expect(recovery.canRecover(error503)).toBe(true);
  });

  it('should not handle 500 errors', () => {
    const error = new EnhancedApiError(
      'Internal Server Error',
      ErrorCategory.SERVER_ERROR,
      ErrorSeverity.CRITICAL,
      NotionErrorCode.INTERNAL_SERVER_ERROR,
      500,
      true // retryable
    );

    expect(recovery.canRecover(error)).toBe(false);
  });

  it('should not handle non-server errors', () => {
    const error = new EnhancedApiError(
      'Not found',
      ErrorCategory.NOT_FOUND,
      ErrorSeverity.MEDIUM,
      NotionErrorCode.OBJECT_NOT_FOUND,
      404,
      false // not retryable
    );

    expect(recovery.canRecover(error)).toBe(false);
  });
});

describe('RecoveryManager', () => {
  let manager: RecoveryManager;
  let mockStrategy: any;

  beforeEach(() => {
    mockStrategy = {
      canRecover: jest.fn(),
      recover: jest.fn(),
      reset: jest.fn(),
      maxAttempts: 3,
    };
    manager = new RecoveryManager([mockStrategy]);
  });

  it('should attempt recovery with matching strategy', async () => {
    const error = new EnhancedApiError(
      'Test error',
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      NotionErrorCode.NETWORK_ERROR,
      undefined,
      true // retryable
    );

    mockStrategy.canRecover.mockReturnValue(true);
    mockStrategy.recover.mockResolvedValue({
      success: true,
      shouldRetry: true,
    });

    const result = await manager.attemptRecovery(error, {});

    expect(result.success).toBe(true);
    expect(result.shouldRetry).toBe(true);
    expect(mockStrategy.canRecover).toHaveBeenCalledWith(error);
    expect(mockStrategy.recover).toHaveBeenCalledWith(error, {});
  });

  it('should return failure when no strategy can recover', async () => {
    const error = new EnhancedApiError(
      'Test error',
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      NotionErrorCode.VALIDATION_ERROR,
      undefined,
      false // not retryable
    );

    mockStrategy.canRecover.mockReturnValue(false);

    const result = await manager.attemptRecovery(error, {});

    expect(result.success).toBe(false);
    expect(result.shouldRetry).toBe(false);
    expect(result.reason).toContain('No recovery strategy');
  });

  it('should reset all strategies', () => {
    manager.reset();
    expect(mockStrategy.reset).toHaveBeenCalled();
  });
});

describe('withErrorRecovery', () => {
  let mockFn: jest.Mock;
  let mockRecoveryManager: any;

  beforeEach(() => {
    mockFn = jest.fn();
    mockRecoveryManager = {
      attemptRecovery: jest.fn(),
    };
  });

  it('should return result on successful call', async () => {
    const expectedResult = { data: 'success' };
    mockFn.mockResolvedValue(expectedResult);

    const wrappedFn = withErrorRecovery(mockFn, mockRecoveryManager);
    const result = await wrappedFn();

    expect(result).toBe(expectedResult);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockRecoveryManager.attemptRecovery).not.toHaveBeenCalled();
  });

  it('should attempt recovery on error and retry', async () => {
    const error = new EnhancedApiError(
      'Test error',
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      NotionErrorCode.NETWORK_ERROR
    );
    const expectedResult = { data: 'success' };

    mockFn
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(expectedResult);

    mockRecoveryManager.attemptRecovery.mockResolvedValue(expectedResult);

    const wrappedFn = withErrorRecovery(mockFn, mockRecoveryManager);
    const result = await wrappedFn();

    expect(result).toBe(expectedResult);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockRecoveryManager.attemptRecovery).toHaveBeenCalledWith(error, mockFn, undefined);
  });

  it('should throw error when recovery fails', async () => {
    const error = new EnhancedApiError(
      'Test error',
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      NotionErrorCode.VALIDATION_ERROR
    );

    mockFn.mockRejectedValue(error);
    mockRecoveryManager.attemptRecovery.mockRejectedValue(error);

    const wrappedFn = withErrorRecovery(mockFn, mockRecoveryManager);

    await expect(wrappedFn()).rejects.toBe(error);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe('withNotionErrorRecovery', () => {
  it('should use global recovery manager', async () => {
    const mockFn = jest.fn().mockResolvedValue({ data: 'success' });
    const wrappedFn = withNotionErrorRecovery(mockFn);
    
    const result = await wrappedFn();
    expect(result).toEqual({ data: 'success' });
  });
});

describe('globalRecoveryManager', () => {
  it('should be an instance of RecoveryManager', () => {
    expect(globalRecoveryManager).toBeInstanceOf(RecoveryManager);
  });

  it('should have all recovery strategies', async () => {
    // Reset all strategies before testing
    globalRecoveryManager.reset();
    
    // Test that it can handle different error types
    const authError = new EnhancedApiError(
      'Unauthorized',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      'unauthorized',
      401,
      true // retryable
    );

    const rateLimitError = new EnhancedApiError(
      'Rate limited',
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      'rate_limited',
      429,
      true // retryable
    );

    const networkError = new EnhancedApiError(
      'Network error',
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      'network_error',
      undefined,
      true // retryable
    );

    // These should return results, not throw - the manager should have strategies for these
    const authResult = await globalRecoveryManager.attemptRecovery(authError, { userId: 'test' });
    expect(authResult.success).toBe(true);
    expect(authResult.shouldRetry).toBe(true);

    const rateLimitResult = await globalRecoveryManager.attemptRecovery(rateLimitError, {});
    expect(rateLimitResult.success).toBe(true);
    expect(rateLimitResult.shouldRetry).toBe(true);

    const networkResult = await globalRecoveryManager.attemptRecovery(networkError, {});
    expect(networkResult.success).toBe(true);
    expect(networkResult.shouldRetry).toBe(true);
  }, 10000);
}); 