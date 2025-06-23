import { prisma } from '@/lib/prisma';
import { NotionService } from './notion';
import { notionToApp, appToNotion } from '@/lib/notionTransform';
import type { NotionDatabase, NotionPage } from '@/types/notion';
import type { Task, User } from '@prisma/client';

export class NotionSyncService {
  private static instance: NotionSyncService;
  private notionService: NotionService;

  private constructor() {
    this.notionService = NotionService.getInstance();
  }

  public static getInstance(): NotionSyncService {
    if (!NotionSyncService.instance) {
      NotionSyncService.instance = new NotionSyncService();
    }
    return NotionSyncService.instance;
  }

  /**
   * Detects changes between Notion and local database
   */
  private async detectChanges(
    userId: string,
    databaseId: string,
    notionPages: NotionPage[],
    localTasks: Task[]
  ): Promise<{
    toCreate: NotionPage[];
    toUpdate: { page: NotionPage; task: Task }[];
    toDelete: Task[];
    toSync: Task[];
  }> {
    const notionIds = new Set(notionPages.map(page => page.id));
    const localIds = new Set(localTasks.map(task => task.notionId));
    
    // Find items to create (in Notion but not local)
    const toCreate = notionPages.filter(page => !localIds.has(page.id));
    
    // Find items to update (in both but potentially different)
    const toUpdate = notionPages
      .map(page => {
        const task = localTasks.find(t => t.notionId === page.id);
        return task ? { page, task } : null;
      })
      .filter((item): item is { page: NotionPage; task: Task } => item !== null);
    
    // Find items to delete (in local but not Notion)
    const toDelete = localTasks.filter(task => task.notionId && !notionIds.has(task.notionId));
    
    // Find items to sync to Notion (local items without notionId)
    const toSync = localTasks.filter(task => !task.notionId);

    return { toCreate, toUpdate, toDelete, toSync };
  }

  /**
   * Syncs data bidirectionally between Notion and local database
   */
  public async syncDatabase(
    userId: string,
    databaseId: string,
    mapping: Record<string, string>
  ): Promise<{
    created: number;
    updated: number;
    deleted: number;
    synced: number;
    errors: string[];
  }> {
    const result = {
      created: 0,
      updated: 0,
      deleted: 0,
      synced: 0,
      errors: [] as string[],
    };

    try {
      // Get user and validate access
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { tasks: true },
      });

      if (!user?.notionAccessToken) {
        throw new Error('User not connected to Notion');
      }

      this.notionService.initialize(user.notionAccessToken);
      const database = await this.notionService.getDatabase(databaseId);

      // Get all pages from Notion database
      const pages = await this.fetchAllPages(databaseId);
      
      // Get existing tasks for this database
      const existingTasks = await prisma.task.findMany({
        where: {
          userId,
          notionDatabaseId: databaseId,
        },
      });

      // Detect changes
      const changes = await this.detectChanges(userId, databaseId, pages, existingTasks);

      // Process creations (Notion -> Local)
      for (const page of changes.toCreate) {
        try {
          const activity = notionToApp(page, database, mapping);
          await prisma.task.create({
            data: {
              userId,
              notionId: page.id,
              notionDatabaseId: databaseId,
              notionUrl: page.url,
              title: activity.title,
              description: activity.description,
              status: activity.status,
              priority: activity.priority,
              dueDate: activity.dueDate,
              category: activity.category,
              tags: activity.tags,
              lastSyncedAt: new Date(),
            },
          });
          result.created++;
        } catch (error) {
          result.errors.push(`Error creating task from page ${page.id}: ${error}`);
        }
      }

      // Process updates (Notion -> Local)
      for (const { page, task } of changes.toUpdate) {
        try {
          const activity = notionToApp(page, database, mapping);
          await prisma.task.update({
            where: { id: task.id },
            data: {
              title: activity.title,
              description: activity.description,
              status: activity.status,
              priority: activity.priority,
              dueDate: activity.dueDate,
              category: activity.category,
              tags: activity.tags,
              lastSyncedAt: new Date(),
            },
          });
          result.updated++;
        } catch (error) {
          result.errors.push(`Error updating task ${task.id} from page ${page.id}: ${error}`);
        }
      }

      // Process deletions (remove from local)
      if (changes.toDelete.length > 0) {
        await prisma.task.deleteMany({
          where: {
            id: { in: changes.toDelete.map(task => task.id) },
          },
        });
        result.deleted = changes.toDelete.length;
      }

      // Process local to Notion syncs
      for (const task of changes.toSync) {
        try {
          const properties = appToNotion(
            {
              title: task.title,
              description: task.description || undefined,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate || undefined,
              category: task.category || undefined,
              tags: task.tags,
            },
            mapping,
            database
          );

          const response = await this.notionService.getClient().pages.create({
            parent: { database_id: databaseId },
            properties,
          });

          await prisma.task.update({
            where: { id: task.id },
            data: {
              notionId: response.id,
              notionDatabaseId: databaseId,
              notionUrl: response.url,
              lastSyncedAt: new Date(),
            },
          });
          result.synced++;
        } catch (error) {
          result.errors.push(`Error syncing task ${task.id} to Notion: ${error}`);
        }
      }

      // Update user's last sync time
      await prisma.user.update({
        where: { id: userId },
        data: { lastSyncedAt: new Date() },
      });

      return result;
    } catch (error) {
      throw new Error(`Sync failed: ${error}`);
    }
  }

  private async fetchAllPages(databaseId: string): Promise<NotionPage[]> {
    const pages: NotionPage[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const response = await this.notionService.getClient().databases.query({
        database_id: databaseId,
        start_cursor: startCursor,
        page_size: 100,
      });

      pages.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    return pages;
  }

  public async syncTask(
    task: Task,
    mapping: Record<string, string>
  ): Promise<void> {
    if (!task.notionId || !task.notionDatabaseId) {
      throw new Error('Task is not linked to Notion');
    }

    const user = await prisma.user.findUnique({
      where: { id: task.userId },
    });

    if (!user?.notionAccessToken) {
      throw new Error('User not connected to Notion');
    }

    this.notionService.initialize(user.notionAccessToken);
    const database = await this.notionService.getDatabase(task.notionDatabaseId);

    const properties = appToNotion(
      {
        title: task.title,
        description: task.description || undefined,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || undefined,
        category: task.category || undefined,
        tags: task.tags,
      },
      mapping,
      database
    );

    await this.notionService.getClient().pages.update({
      page_id: task.notionId,
      properties,
    });

    await prisma.task.update({
      where: { id: task.id },
      data: { lastSyncedAt: new Date() },
    });
  }
} 