import { PrismaClient } from '@prisma/client';
import type { SchemaMapping } from '@/types/notion';
import { validateSchemaMapping } from '@/lib/notion/schema';

const prisma = new PrismaClient();

export class NotionMappingService {
  /**
   * Creates or updates a schema mapping for a Notion database
   */
  static async saveMapping(
    userId: string,
    databaseId: string,
    mapping: SchemaMapping
  ) {
    const validation = validateSchemaMapping(mapping.properties, mapping.defaultMappings);
    if (!validation.isValid) {
      throw new Error(`Invalid schema mapping: ${validation.errors.join(', ')}`);
    }

    const existingMapping = await prisma.notionSchemaMapping.findFirst({
      where: {
        userId,
        databaseId,
      },
    });

    if (existingMapping) {
      return prisma.notionSchemaMapping.update({
        where: { id: existingMapping.id },
        data: {
          properties: mapping.properties,
          defaultMappings: mapping.defaultMappings,
          customMappings: mapping.customMappings || {},
          updatedAt: new Date(),
        },
      });
    }

    return prisma.notionSchemaMapping.create({
      data: {
        userId,
        databaseId,
        properties: mapping.properties,
        defaultMappings: mapping.defaultMappings,
        customMappings: mapping.customMappings || {},
      },
    });
  }

  /**
   * Retrieves a schema mapping for a Notion database
   */
  static async getMapping(userId: string, databaseId: string) {
    return prisma.notionSchemaMapping.findFirst({
      where: {
        userId,
        databaseId,
      },
    });
  }

  /**
   * Lists all schema mappings for a user
   */
  static async listMappings(userId: string) {
    return prisma.notionSchemaMapping.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Deletes a schema mapping
   */
  static async deleteMapping(userId: string, databaseId: string) {
    const mapping = await prisma.notionSchemaMapping.findFirst({
      where: {
        userId,
        databaseId,
      },
    });

    if (!mapping) {
      throw new Error('Mapping not found');
    }

    return prisma.notionSchemaMapping.delete({
      where: {
        id: mapping.id,
      },
    });
  }

  /**
   * Updates the sync status for a database
   */
  static async updateSyncStatus(
    userId: string,
    databaseId: string,
    status: 'pending' | 'syncing' | 'completed' | 'failed',
    error?: string
  ) {
    const existingSync = await prisma.notionSync.findFirst({
      where: {
        userId,
        databaseId,
      },
    });

    if (existingSync) {
      return prisma.notionSync.update({
        where: { id: existingSync.id },
        data: {
          status,
          error: error || null,
          lastSyncedAt: status === 'completed' ? new Date() : existingSync.lastSyncedAt,
          updatedAt: new Date(),
        },
      });
    }

    return prisma.notionSync.create({
      data: {
        userId,
        databaseId,
        status,
        error: error || null,
        lastSyncedAt: status === 'completed' ? new Date() : null,
      },
    });
  }

  /**
   * Gets the sync status for a database
   */
  static async getSyncStatus(userId: string, databaseId: string) {
    return prisma.notionSync.findFirst({
      where: {
        userId,
        databaseId,
      },
    });
  }

  /**
   * Lists all sync statuses for a user
   */
  static async listSyncStatuses(userId: string) {
    return prisma.notionSync.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
} 