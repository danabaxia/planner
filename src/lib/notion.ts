import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import {
  notionApiClient,
  ApiResponse,
  safeApiCall,
  handleApiError,
} from './api-client'
import {
  withRateLimit,
  withHighPriorityRateLimit,
  withLowPriorityRateLimit,
  notionRateLimiter,
} from './rate-limiter'
import {
  EnhancedApiError,
  ErrorContext,
  ErrorMessageMapper,
  logger,
  errorMonitor,
} from './errors'
import { withNotionErrorRecovery } from './error-recovery'

// Notion-specific types
export interface NotionUser {
  id: string
  name: string
  avatar_url?: string
  type: 'person' | 'bot'
  person?: {
    email: string
  }
  bot?: {
    owner: {
      type: 'workspace' | 'user'
      workspace?: boolean
    }
    workspace_name?: string
  }
}

export interface NotionDatabase {
  id: string
  title: Array<{
    type: 'text'
    text: {
      content: string
    }
  }>
  description: Array<any>
  properties: Record<string, any>
  url: string
  created_time: string
  last_edited_time: string
}

export interface NotionPage {
  id: string
  created_time: string
  last_edited_time: string
  properties: Record<string, any>
  url: string
  parent: {
    type: 'database_id' | 'page_id' | 'workspace'
    database_id?: string
    page_id?: string
  }
}

export interface NotionQueryFilter {
  property?: string
  title?: any
  rich_text?: any
  number?: any
  checkbox?: any
  select?: any
  multi_select?: any
  date?: any
  people?: any
  files?: any
  url?: any
  email?: any
  phone_number?: any
  relation?: any
  created_time?: any
  created_by?: any
  last_edited_time?: any
  last_edited_by?: any
  and?: NotionQueryFilter[]
  or?: NotionQueryFilter[]
}

export interface NotionSort {
  property?: string
  timestamp?: 'created_time' | 'last_edited_time'
  direction: 'ascending' | 'descending'
}

export class NotionAPI {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async makeRequest<T>(
    endpoint: string,
    data?: any,
    method: string = 'GET'
  ): Promise<T> {
    // Create error context for better debugging
    const context: ErrorContext = {
      endpoint,
      method,
      requestBody: data,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    }

    // Set the authorization header for this specific request
    const originalHeader = notionApiClient['defaultHeaders']['Authorization']
    notionApiClient.setDefaultHeader(
      'Authorization',
      `Bearer ${this.accessToken}`
    )

    try {
      // Wrap the API call with error recovery
      return await withNotionErrorRecovery(
        async () => {
          let response: ApiResponse<T>

          switch (method.toUpperCase()) {
            case 'GET':
              response = await notionApiClient.get<T>(endpoint)
              break
            case 'POST':
              response = await notionApiClient.post<T>(endpoint, data)
              break
            case 'PATCH':
              response = await notionApiClient.patch<T>(endpoint, data)
              break
            case 'DELETE':
              response = await notionApiClient.delete<T>(endpoint)
              break
            default:
              throw new Error(`Unsupported HTTP method: ${method}`)
          }

          // Log successful requests for monitoring
          logger.debug('Notion API request successful', {
            endpoint,
            method,
            status: response.status,
          })

          return response.data as T
        },
        endpoint,
        method
      )
    } catch (error) {
      // Enhanced error handling with user-friendly messages
      if (error instanceof Error && 'category' in error) {
        const enhancedError = error as EnhancedApiError
        const userMessage =
          ErrorMessageMapper.getUserFriendlyMessage(enhancedError)

        logger.error('Notion API request failed', enhancedError, {
          endpoint,
          method,
          userMessage,
        })

        // Re-throw with user-friendly message for UI consumption
        const userError = new Error(userMessage)
        ;(userError as any).originalError = enhancedError
        ;(userError as any).category = enhancedError.category
        ;(userError as any).retryable = enhancedError.retryable
        throw userError
      }

      // Fallback for unexpected errors
      logger.error('Unexpected error in Notion API', undefined, {
        endpoint,
        method,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    } finally {
      // Restore original header
      if (originalHeader) {
        notionApiClient.setDefaultHeader('Authorization', originalHeader)
      } else {
        notionApiClient.removeDefaultHeader('Authorization')
      }
    }
  }

  // User methods
  async getUser(): Promise<NotionUser> {
    return withHighPriorityRateLimit(async () => {
      return this.makeRequest<NotionUser>('/users/me')
    })
  }

  // Database methods
  async getDatabases(): Promise<{ results: NotionDatabase[] }> {
    return withRateLimit(async () => {
      return this.makeRequest<{ results: NotionDatabase[] }>(
        '/search',
        {
          filter: {
            value: 'database',
            property: 'object',
          },
        },
        'POST'
      )
    })
  }

  async getDatabase(databaseId: string): Promise<NotionDatabase> {
    return withRateLimit(async () => {
      return this.makeRequest<NotionDatabase>(`/databases/${databaseId}`)
    })
  }

  async queryDatabase(
    databaseId: string,
    options: {
      filter?: NotionQueryFilter
      sorts?: NotionSort[]
      start_cursor?: string
      page_size?: number
    } = {}
  ): Promise<{
    results: NotionPage[]
    next_cursor?: string
    has_more: boolean
  }> {
    return withRateLimit(async () => {
      return this.makeRequest<{
        results: NotionPage[]
        next_cursor?: string
        has_more: boolean
      }>(
        `/databases/${databaseId}/query`,
        {
          filter: options.filter,
          sorts: options.sorts,
          start_cursor: options.start_cursor,
          page_size: options.page_size || 100,
        },
        'POST'
      )
    })
  }

  // Page methods
  async getPage(pageId: string): Promise<NotionPage> {
    return withRateLimit(async () => {
      return this.makeRequest<NotionPage>(`/pages/${pageId}`)
    })
  }

  async createPage(
    databaseId: string,
    properties: Record<string, any>
  ): Promise<NotionPage> {
    return withHighPriorityRateLimit(async () => {
      return this.makeRequest<NotionPage>(
        '/pages',
        {
          parent: {
            database_id: databaseId,
          },
          properties,
        },
        'POST'
      )
    })
  }

  async updatePage(
    pageId: string,
    properties: Record<string, any>
  ): Promise<NotionPage> {
    return withHighPriorityRateLimit(async () => {
      return this.makeRequest<NotionPage>(
        `/pages/${pageId}`,
        {
          properties,
        },
        'PATCH'
      )
    })
  }

  async deletePage(pageId: string): Promise<NotionPage> {
    return withHighPriorityRateLimit(async () => {
      return this.makeRequest<NotionPage>(
        `/pages/${pageId}`,
        {
          archived: true,
        },
        'PATCH'
      )
    })
  }

  // Block methods (for page content)
  async getPageBlocks(
    pageId: string,
    startCursor?: string
  ): Promise<{
    results: any[]
    next_cursor?: string
    has_more: boolean
  }> {
    const endpoint = `/blocks/${pageId}/children${startCursor ? `?start_cursor=${startCursor}` : ''}`
    return this.makeRequest(endpoint)
  }

  async appendBlocks(
    pageId: string,
    blocks: any[]
  ): Promise<{
    results: any[]
  }> {
    return this.makeRequest(
      `/blocks/${pageId}/children`,
      {
        children: blocks,
      },
      'PATCH'
    )
  }

  // Search methods
  async search(
    query?: string,
    filter?: { property: string; value: string }
  ): Promise<{
    results: (NotionPage | NotionDatabase)[]
    next_cursor?: string
    has_more: boolean
  }> {
    return withLowPriorityRateLimit(async () => {
      return this.makeRequest(
        '/search',
        {
          query,
          filter,
        },
        'POST'
      )
    })
  }

  // Utility methods for common operations
  async getAllDatabasePages(
    databaseId: string,
    filter?: NotionQueryFilter
  ): Promise<NotionPage[]> {
    const allPages: NotionPage[] = []
    let hasMore = true
    let startCursor: string | undefined

    while (hasMore) {
      const response = await this.queryDatabase(databaseId, {
        filter,
        start_cursor: startCursor,
        page_size: 100,
      })

      allPages.push(...response.results)
      hasMore = response.has_more
      startCursor = response.next_cursor
    }

    return allPages
  }

  async getDatabaseSchema(databaseId: string): Promise<{
    title: string
    properties: Record<string, any>
  }> {
    const database = await this.getDatabase(databaseId)
    return {
      title: database.title.map(t => t.text.content).join(''),
      properties: database.properties,
    }
  }
}

// Helper function to get authenticated Notion API instance
export async function getNotionAPI() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    throw new Error('No valid session or access token found')
  }

  return new NotionAPI(session.accessToken)
}

// Safe wrapper functions using the safeApiCall utility
export async function safeGetNotionUser() {
  const api = await getNotionAPI()
  return safeApiCall(() =>
    Promise.resolve({ data: api.getUser(), status: 200, success: true })
  )
}

export async function safeGetNotionDatabases() {
  const api = await getNotionAPI()
  return safeApiCall(() =>
    Promise.resolve({ data: api.getDatabases(), status: 200, success: true })
  )
}

export async function safeQueryDatabase(databaseId: string, options?: any) {
  const api = await getNotionAPI()
  return safeApiCall(() =>
    Promise.resolve({
      data: api.queryDatabase(databaseId, options),
      status: 200,
      success: true,
    })
  )
}

// Property helper functions for Notion data structures
export const NotionPropertyHelpers = {
  // Extract text from rich text property
  getRichText(property: any): string {
    if (!property?.rich_text) {
      return ''
    }
    return property.rich_text.map((text: any) => text.plain_text).join('')
  },

  // Extract title text
  getTitle(property: any): string {
    if (!property?.title) {
      return ''
    }
    return property.title.map((text: any) => text.plain_text).join('')
  },

  // Extract number value
  getNumber(property: any): number | null {
    return property?.number ?? null
  },

  // Extract checkbox value
  getCheckbox(property: any): boolean {
    return property?.checkbox ?? false
  },

  // Extract select value
  getSelect(property: any): string | null {
    return property?.select?.name ?? null
  },

  // Extract multi-select values
  getMultiSelect(property: any): string[] {
    if (!property?.multi_select) {
      return []
    }
    return property.multi_select.map((item: any) => item.name)
  },

  // Extract date value
  getDate(property: any): { start: string | null; end?: string | null } | null {
    if (!property?.date) {
      return null
    }
    return {
      start: property.date.start,
      end: property.date.end,
    }
  },

  // Extract people
  getPeople(
    property: any
  ): Array<{ id: string; name: string; email?: string }> {
    if (!property?.people) {
      return []
    }
    return property.people.map((person: any) => ({
      id: person.id,
      name: person.name,
      email: person.person?.email,
    }))
  },

  // Extract URL
  getUrl(property: any): string | null {
    return property?.url ?? null
  },

  // Extract email
  getEmail(property: any): string | null {
    return property?.email ?? null
  },

  // Extract phone number
  getPhoneNumber(property: any): string | null {
    return property?.phone_number ?? null
  },

  // Create property objects for page creation/updates
  createRichText(text: string) {
    return {
      rich_text: [
        {
          type: 'text',
          text: { content: text },
        },
      ],
    }
  },

  createTitle(text: string) {
    return {
      title: [
        {
          type: 'text',
          text: { content: text },
        },
      ],
    }
  },

  createNumber(value: number) {
    return { number: value }
  },

  createCheckbox(checked: boolean) {
    return { checkbox: checked }
  },

  createSelect(name: string) {
    return { select: { name } }
  },

  createMultiSelect(names: string[]) {
    return {
      multi_select: names.map(name => ({ name })),
    }
  },

  createDate(start: string, end?: string) {
    return {
      date: {
        start,
        ...(end && { end }),
      },
    }
  },

  createUrl(url: string) {
    return { url }
  },

  createEmail(email: string) {
    return { email }
  },

  createPhoneNumber(phoneNumber: string) {
    return { phone_number: phoneNumber }
  },
}

// Helper function to refresh access token if needed
export async function refreshNotionToken(refreshToken: string) {
  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(
        `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  return response.json()
}

// Database schema validation helpers
export function validateDatabaseForPlanning(database: NotionDatabase): {
  isValid: boolean
  missingProperties: string[]
  suggestions: string[]
} {
  const requiredProperties = ['Name', 'Date', 'Status', 'Priority']
  const optionalProperties = ['Description', 'Category', 'Duration', 'Location']

  const existingProperties = Object.keys(database.properties)
  const missingRequired = requiredProperties.filter(
    prop =>
      !existingProperties.some(existing =>
        existing.toLowerCase().includes(prop.toLowerCase())
      )
  )

  const suggestions = []
  if (missingRequired.length > 0) {
    suggestions.push(`Add required properties: ${missingRequired.join(', ')}`)
  }

  const hasOptional = optionalProperties.some(prop =>
    existingProperties.some(existing =>
      existing.toLowerCase().includes(prop.toLowerCase())
    )
  )

  if (!hasOptional) {
    suggestions.push(
      `Consider adding optional properties: ${optionalProperties.join(', ')}`
    )
  }

  return {
    isValid: missingRequired.length === 0,
    missingProperties: missingRequired,
    suggestions,
  }
}
