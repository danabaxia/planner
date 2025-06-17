import { ApiClient, handleApiError, safeApiCall } from '@/lib/api-client';
import { EnhancedApiError, ErrorCategory, ErrorSeverity, NotionErrorCode } from '@/lib/errors';

// Mock fetch globally
global.fetch = jest.fn();

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('ApiClient', () => {
  let apiClient: ApiClient;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    apiClient = new ApiClient('https://api.example.com');
    // Set lower retry values for faster tests
    apiClient.setDefaultRetries(1);
    apiClient.setDefaultTimeout(1000);
    mockFetch.mockClear();
  });

  describe('constructor', () => {
    it('should create an instance with default options', () => {
      expect(apiClient).toBeInstanceOf(ApiClient);
    });

    it('should create an instance with custom headers', () => {
      const customClient = new ApiClient('https://api.example.com', {
        'X-Custom-Header': 'test',
      });
      expect(customClient).toBeInstanceOf(ApiClient);
    });
  });

  describe('HTTP methods', () => {
    it('should make a successful GET request', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await apiClient.get('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          signal: expect.any(AbortSignal),
        })
      );
      expect(result.data).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    });

    it('should make a successful POST request with data', async () => {
      const mockResponse = { id: 1 };
      const postData = { name: 'test' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await apiClient.post('/test', postData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result.data).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.status).toBe(201);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource not found' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow(EnhancedApiError);
    });

    it('should retry on retryable errors', async () => {
      // First call fails with 502 (retryable)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: async () => ({ message: 'Server error' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ data: 'success' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await apiClient.get('/test');
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ data: 'success' });
    });

    it('should not retry on non-retryable errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid request' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow(EnhancedApiError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow(EnhancedApiError);
    });

    it('should handle timeout', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );

      await expect(apiClient.get('/test', { timeout: 100 })).rejects.toThrow(EnhancedApiError);
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ data: 'test' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    });

    it('should make GET request', async () => {
      await apiClient.get('/test');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should make POST request', async () => {
      const data = { name: 'test' };
      await apiClient.post('/test', data);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ 
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });

    it('should make PUT request', async () => {
      const data = { name: 'updated' };
      await apiClient.put('/test', data);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ 
          method: 'PUT',
          body: JSON.stringify(data),
        })
      );
    });

    it('should make PATCH request', async () => {
      const data = { name: 'patched' };
      await apiClient.patch('/test', data);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ 
          method: 'PATCH',
          body: JSON.stringify(data),
        })
      );
    });

    it('should make DELETE request', async () => {
      await apiClient.delete('/test');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('configuration methods', () => {
    it('should set default header', () => {
      apiClient.setDefaultHeader('X-Custom', 'value');
      // This is a private method test, so we can't directly verify
      // but we can test that it doesn't throw
      expect(() => apiClient.setDefaultHeader('X-Custom', 'value')).not.toThrow();
    });

    it('should remove default header', () => {
      apiClient.removeDefaultHeader('X-Custom');
      expect(() => apiClient.removeDefaultHeader('X-Custom')).not.toThrow();
    });

    it('should set default timeout', () => {
      apiClient.setDefaultTimeout(5000);
      expect(() => apiClient.setDefaultTimeout(5000)).not.toThrow();
    });

    it('should set default retries', () => {
      apiClient.setDefaultRetries(5);
      expect(() => apiClient.setDefaultRetries(5)).not.toThrow();
    });
  });
});

describe('handleApiError', () => {
  it('should return user-friendly message for EnhancedApiError', () => {
    const error = new EnhancedApiError(
      'Test error',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      NotionErrorCode.UNAUTHORIZED,
      401
    );
    const message = handleApiError(error);
    expect(message).toBe('Authentication required. Please sign in again.');
  });

  it('should return generic message for unknown errors', () => {
    const error = new Error('Unknown error');
    const message = handleApiError(error);
    expect(message).toBe('Unknown error');
  });

  it('should handle EnhancedApiError with validation category', () => {
    const error = new EnhancedApiError(
      'Validation failed',
      ErrorCategory.VALIDATION,
      ErrorSeverity.MEDIUM,
      NotionErrorCode.VALIDATION_ERROR,
      400
    );
    const message = handleApiError(error);
    expect(message).toBe('Validation failed');
  });
});

describe('safeApiCall', () => {
  it('should return success result for successful call', async () => {
    const mockApiResponse = { data: 'success', status: 200, success: true };
    const mockFn = jest.fn().mockResolvedValue(mockApiResponse);
    const result = await safeApiCall(mockFn);
    
    expect(result.data).toEqual('success');
    expect(result.error).toBeNull();
  });

  it('should return error result for failed call', async () => {
    const error = new EnhancedApiError(
      'Test error',
      ErrorCategory.SERVER_ERROR,
      ErrorSeverity.CRITICAL,
      NotionErrorCode.INTERNAL_SERVER_ERROR,
      500
    );
    const mockFn = jest.fn().mockRejectedValue(error);
    const result = await safeApiCall(mockFn);
    
    expect(result.data).toBeNull();
    expect(result.error).toBe('Server error. Please try again later.');
  });

  it('should handle non-EnhancedApiError exceptions', async () => {
    const error = new Error('Generic error');
    const mockFn = jest.fn().mockRejectedValue(error);
    const result = await safeApiCall(mockFn);
    
    expect(result.data).toBeNull();
    expect(result.error).toBe('Generic error');
  });
}); 