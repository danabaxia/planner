import { prisma } from '@/lib/prisma';
import { NotionSyncService } from '@/services/notionSync';
import { NotionMappingService } from '@/services/NotionMappingService';

export interface SyncSchedule {
  userId: string;
  databaseId: string;
  interval: number; // in minutes
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

class SyncScheduler {
  private static instance: SyncScheduler;
  private schedules: Map<string, NodeJS.Timeout>;
  private syncService: NotionSyncService;

  private constructor() {
    this.schedules = new Map();
    this.syncService = NotionSyncService.getInstance();
  }

  public static getInstance(): SyncScheduler {
    if (!SyncScheduler.instance) {
      SyncScheduler.instance = new SyncScheduler();
    }
    return SyncScheduler.instance;
  }

  /**
   * Schedules a sync operation for a database
   */
  public async scheduleSync(
    userId: string,
    databaseId: string,
    interval: number = 15 // default 15 minutes
  ): Promise<void> {
    const key = `${userId}:${databaseId}`;
    
    // Clear existing schedule if any
    if (this.schedules.has(key)) {
      clearInterval(this.schedules.get(key));
      this.schedules.delete(key);
    }

    // Create new schedule
    const schedule = setInterval(async () => {
      await this.runSync(userId, databaseId);
    }, interval * 60 * 1000);

    this.schedules.set(key, schedule);

    // Save schedule to database
    await prisma.notionSync.update({
      where: {
        userId_databaseId: {
          userId,
          databaseId,
        },
      },
      data: {
        syncInterval: interval,
        nextSyncAt: new Date(Date.now() + interval * 60 * 1000),
        enabled: true,
      },
    });
  }

  /**
   * Stops scheduled sync for a database
   */
  public async stopSync(userId: string, databaseId: string): Promise<void> {
    const key = `${userId}:${databaseId}`;
    
    if (this.schedules.has(key)) {
      clearInterval(this.schedules.get(key));
      this.schedules.delete(key);
    }

    await prisma.notionSync.update({
      where: {
        userId_databaseId: {
          userId,
          databaseId,
        },
      },
      data: {
        enabled: false,
        nextSyncAt: null,
      },
    });
  }

  /**
   * Runs a sync operation for a database
   */
  private async runSync(userId: string, databaseId: string): Promise<void> {
    try {
      // Get mapping
      const mapping = await NotionMappingService.getMapping(userId, databaseId);
      if (!mapping) {
        throw new Error('Schema mapping not found');
      }

      // Update sync status
      await NotionMappingService.updateSyncStatus(userId, databaseId, 'syncing');

      // Run sync
      const result = await this.syncService.syncDatabase(
        userId,
        databaseId,
        mapping.defaultMappings
      );

      // Update sync status and log results
      await prisma.notionSync.update({
        where: {
          userId_databaseId: {
            userId,
            databaseId,
          },
        },
        data: {
          status: 'completed',
          lastSyncedAt: new Date(),
          lastSyncResult: {
            created: result.created,
            updated: result.updated,
            deleted: result.deleted,
            synced: result.synced,
            errors: result.errors,
          },
        },
      });
    } catch (error) {
      console.error('Scheduled sync failed:', error);
      
      // Update sync status with error
      await NotionMappingService.updateSyncStatus(
        userId,
        databaseId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Initializes schedules from database
   */
  public async initializeSchedules(): Promise<void> {
    const activeSchedules = await prisma.notionSync.findMany({
      where: {
        enabled: true,
        syncInterval: { not: null },
      },
    });

    for (const schedule of activeSchedules) {
      if (schedule.syncInterval) {
        await this.scheduleSync(
          schedule.userId,
          schedule.databaseId,
          schedule.syncInterval
        );
      }
    }
  }

  /**
   * Cleans up all schedules
   */
  public cleanup(): void {
    for (const schedule of this.schedules.values()) {
      clearInterval(schedule);
    }
    this.schedules.clear();
  }
} 