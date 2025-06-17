import { NotionAPI, NotionPropertyHelpers } from '../../src/lib/notion';
import { notionApiClient } from '../../src/lib/api-client';

// Mock the API client
jest.mock('../../src/lib/api-client', () => ({
  notionApiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    setDefaultHeader: jest.fn(),
    removeDefaultHeader: jest.fn(),
    defaultHeaders: { Authorization: '' },
  },
}));

// Mock error recovery
jest.mock('../../src/lib/error-recovery', () => ({
  withNotionErrorRecovery: jest.fn((fn) => fn()),
}));

// Mock rate limiting
jest.mock('../../src/lib/rate-limiter', () => ({
  withRateLimit: jest.fn((fn) => fn()),
  withHighPriorityRateLimit: jest.fn((fn) => fn()),
  withLowPriorityRateLimit: jest.fn((fn) => fn()),
}));

// Mock logger and error handling
jest.mock('../../src/lib/errors', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
  ErrorMessageMapper: {
    getUserFriendlyMessage: jest.fn((error) => error.message),
  },
}));

const mockApiClient = notionApiClient as jest.Mocked<typeof notionApiClient>;

describe('NotionAPI', () => {
  let notionAPI: NotionAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    notionAPI = new NotionAPI('test-token');
  });

  describe('constructor', () => {
    it('should create an instance with access token', () => {
      expect(notionAPI).toBeInstanceOf(NotionAPI);
    });
  });

  describe('getUser', () => {
    it('should fetch user information', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        type: 'person' as const,
        person: { email: 'test@example.com' },
      };

      mockApiClient.get.mockResolvedValue({ data: mockUser, status: 200, success: true });

      const result = await notionAPI.getUser();

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUser);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockApiClient.get.mockRejectedValue(error);

      await expect(notionAPI.getUser()).rejects.toThrow('API Error');
    });
  });

  describe('getDatabases', () => {
    it('should fetch databases', async () => {
      const mockResponse = {
        results: [
          {
            id: 'db-123',
            title: [{ text: { content: 'Test Database' } }],
            properties: {},
          },
        ],
        has_more: false,
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse, status: 200, success: true });

      const result = await notionAPI.getDatabases();

      expect(mockApiClient.post).toHaveBeenCalledWith('/search', {
        filter: { value: 'database', property: 'object' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDatabase', () => {
    it('should fetch a specific database', async () => {
      const mockDatabase = {
        id: 'db-123',
        title: [{ text: { content: 'Test Database' } }],
        properties: {},
      };

      mockApiClient.get.mockResolvedValue({ data: mockDatabase, status: 200, success: true });

      const result = await notionAPI.getDatabase('db-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/databases/db-123');
      expect(result).toEqual(mockDatabase);
    });
  });

  describe('queryDatabase', () => {
    it('should query database with filters', async () => {
      const mockResponse = {
        results: [
          {
            id: 'page-123',
            properties: { Name: { title: [{ text: { content: 'Test Page' } }] } },
          },
        ],
        has_more: false,
      };

      const query = {
        filter: { property: 'Status', select: { equals: 'Active' } },
        sorts: [{ property: 'Name', direction: 'ascending' as const }],
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse, status: 200, success: true });

      const result = await notionAPI.queryDatabase('db-123', query);

      expect(mockApiClient.post).toHaveBeenCalledWith('/databases/db-123/query', {
        filter: query.filter,
        sorts: query.sorts,
        start_cursor: undefined,
        page_size: 100,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty query', async () => {
      const mockResponse = {
        results: [],
        has_more: false,
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse, status: 200, success: true });

      const result = await notionAPI.queryDatabase('db-123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/databases/db-123/query', {
        filter: undefined,
        sorts: undefined,
        start_cursor: undefined,
        page_size: 100,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPage', () => {
    it('should fetch a specific page', async () => {
      const mockPage = {
        id: 'page-123',
        properties: { Name: { title: [{ text: { content: 'Test Page' } }] } },
      };

      mockApiClient.get.mockResolvedValue({ data: mockPage, status: 200, success: true });

      const result = await notionAPI.getPage('page-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/pages/page-123');
      expect(result).toEqual(mockPage);
    });
  });

  describe('createPage', () => {
    it('should create a new page', async () => {
      const pageData = {
        Name: { title: [{ text: { content: 'New Page' } }] },
      };
      const mockCreatedPage = {
        id: 'page-456',
        properties: pageData,
      };

      mockApiClient.post.mockResolvedValue({ data: mockCreatedPage, status: 200, success: true });

      const result = await notionAPI.createPage('db-123', pageData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/pages', {
        parent: { database_id: 'db-123' },
        properties: pageData,
      });
      expect(result).toEqual(mockCreatedPage);
    });
  });

  describe('updatePage', () => {
    it('should update an existing page', async () => {
      const updates = {
        Status: { select: { name: 'Completed' } },
      };
      const mockUpdatedPage = {
        id: 'page-123',
        properties: updates,
      };

      mockApiClient.patch.mockResolvedValue({ data: mockUpdatedPage, status: 200, success: true });

      const result = await notionAPI.updatePage('page-123', updates);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/pages/page-123', {
        properties: updates,
      });
      expect(result).toEqual(mockUpdatedPage);
    });
  });

  describe('getPageBlocks', () => {
    it('should fetch blocks for a page', async () => {
      const mockResponse = {
        results: [
          {
            id: 'block-123',
            type: 'paragraph',
            paragraph: { rich_text: [{ text: { content: 'Test content' } }] },
          },
        ],
        has_more: false,
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse, status: 200, success: true });

      const result = await notionAPI.getPageBlocks('page-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/blocks/page-123/children');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('appendBlocks', () => {
    it('should append blocks to a page', async () => {
      const blocks = [
        {
          type: 'paragraph',
          paragraph: { rich_text: [{ text: { content: 'New paragraph' } }] },
        },
      ];
      const mockResponse = { results: blocks };

      mockApiClient.patch.mockResolvedValue({ data: mockResponse, status: 200, success: true });

      const result = await notionAPI.appendBlocks('page-123', blocks);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/blocks/page-123/children', {
        children: blocks,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('search', () => {
    it('should search with query', async () => {
      const mockResponse = {
        results: [
          {
            id: 'page-123',
            object: 'page',
            properties: {},
          },
        ],
        has_more: false,
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse, status: 200, success: true });

      const result = await notionAPI.search('test query');

      expect(mockApiClient.post).toHaveBeenCalledWith('/search', {
        query: 'test query',
        filter: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should search with filters', async () => {
      const mockResponse = {
        results: [],
        has_more: false,
      };
      const filter = { property: 'object', value: 'page' };

      mockApiClient.post.mockResolvedValue({ data: mockResponse, status: 200, success: true });

      const result = await notionAPI.search('test', filter);

      expect(mockApiClient.post).toHaveBeenCalledWith('/search', {
        query: 'test',
        filter,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Property helpers', () => {
    describe('getRichText', () => {
      it('should extract plain text from rich text array', () => {
        const richText = [
          { plain_text: 'Hello ' },
          { plain_text: 'world!' },
        ];

        const result = NotionPropertyHelpers.getRichText({ rich_text: richText });
        expect(result).toBe('Hello world!');
      });

      it('should handle empty array', () => {
        const result = NotionPropertyHelpers.getRichText({ rich_text: [] });
        expect(result).toBe('');
      });

      it('should handle null/undefined', () => {
        expect(NotionPropertyHelpers.getRichText({ rich_text: null })).toBe('');
        expect(NotionPropertyHelpers.getRichText({ rich_text: undefined })).toBe('');
      });
    });

    describe('getTitle', () => {
      it('should extract title property', () => {
        const property = {
          title: [{ plain_text: 'Test Title' }],
        };

        const result = NotionPropertyHelpers.getTitle(property);
        expect(result).toBe('Test Title');
      });
    });

    describe('getSelect', () => {
      it('should extract select property', () => {
        const property = {
          select: { name: 'Option 1' },
        };

        const result = NotionPropertyHelpers.getSelect(property);
        expect(result).toBe('Option 1');
      });
    });

    describe('getNumber', () => {
      it('should extract number property', () => {
        const property = {
          number: 42,
        };

        const result = NotionPropertyHelpers.getNumber(property);
        expect(result).toBe(42);
      });
    });

    describe('getDate', () => {
      it('should extract date property', () => {
        const property = {
          date: { start: '2023-12-01' },
        };

        const result = NotionPropertyHelpers.getDate(property);
        expect(result).toEqual({ start: '2023-12-01', end: undefined });
      });
    });

    describe('getCheckbox', () => {
      it('should extract checkbox property', () => {
        const property = {
          checkbox: true,
        };

        const result = NotionPropertyHelpers.getCheckbox(property);
        expect(result).toBe(true);
      });
    });
  });
}); 