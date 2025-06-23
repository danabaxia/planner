import { Client } from '@notionhq/client';

export class NotionService {
  private client: Client | null = null;
  private static instance: NotionService;

  private constructor() {}

  public static getInstance(): NotionService {
    if (!NotionService.instance) {
      NotionService.instance = new NotionService();
    }
    return NotionService.instance;
  }

  public initialize(accessToken: string): void {
    this.client = new Client({
      auth: accessToken,
    });
  }

  public isInitialized(): boolean {
    return this.client !== null;
  }

  public async testConnection(): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error('Notion client not initialized');
      }
      
      // Make a simple API call to verify the connection
      await this.client.users.me();
      return true;
    } catch (error: any) {
      console.error('Error testing Notion connection:', error.message);
      return false;
    }
  }

  public async searchDatabases() {
    if (!this.client) {
      throw new Error('Notion client not initialized');
    }

    const response = await this.client.search({
      filter: {
        property: 'object',
        value: 'database',
      },
    });

    return response.results;
  }

  public async getDatabase(databaseId: string) {
    if (!this.client) {
      throw new Error('Notion client not initialized');
    }

    return await this.client.databases.retrieve({
      database_id: databaseId,
    });
  }

  public async getDatabaseSchema(databaseId: string) {
    if (!this.client) {
      throw new Error('Notion client not initialized');
    }

    const database = await this.client.databases.retrieve({
      database_id: databaseId,
    });

    return database.properties;
  }

  public getClient(): Client {
    if (!this.client) {
      throw new Error('Notion client not initialized');
    }
    return this.client;
  }
} 