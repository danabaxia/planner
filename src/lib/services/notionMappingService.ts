import { prisma } from '@/lib/prisma';
import { mapNotionSchema } from '@/lib/notion/schema';
import type { NotionDatabase, NotionPropertyConfig } from '@/types/notion';
import type { SchemaMapping } from '@/lib/notion/schema';

export interface SaveMappingOptions {
  userId: string;
  databaseId: string;
  properties: Record<string, NotionPropertyConfig>;
  mappingConfig?: Record<string, string>;
}

export class NotionMappingService {
  /**
   * Saves or updates a schema mapping for a Notion database
   */
  static async saveMapping({
    userId,
    databaseId,
    properties,
    mappingConfig
  }: SaveMappingOptions) {
    const schemaMapping = mapNotionSchema(databaseId, properties);
    
    // If mappingConfig is provided, override default mappings
    if (mappingConfig) {
      schemaMapping.defaultMappings = {
        ...schemaMapping.defaultMappings,
        ...mappingConfig
      };
    }

    // Save to database
    return prisma.notionSchemaMapping.upsert({
      where: {
        userId_databaseId: {
          userId,
          databaseId
        }
      },
      update: {
        mappingConfig: schemaMapping
      },
      create: {
        userId,
        databaseId,
        mappingConfig: schemaMapping
      }
    });
  }

  /**
   * Retrieves a schema mapping for a Notion database
   */
  static async getMapping(userId: string, databaseId: string) {
    const mapping = await prisma.notionSchemaMapping.findUnique({
      where: {
        userId_databaseId: {
          userId,
          databaseId
        }
      }
    });

    return mapping?.mappingConfig as SchemaMapping | null;
  }

  /**
   * Validates a mapping configuration against a database schema
   */
  static validateMapping(
    database: NotionDatabase,
    mappingConfig: Record<string, string>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredFields = ['title', 'status', 'priority'];

    // Check required fields
    for (const field of requiredFields) {
      if (!mappingConfig[field]) {
        errors.push(`Missing required field mapping: ${field}`);
        continue;
      }

      const notionField = mappingConfig[field];
      const propertyConfig = database.properties[notionField];

      if (!propertyConfig) {
        errors.push(`Mapped field ${field} references non-existent Notion property: ${notionField}`);
        continue;
      }

      // Validate property type compatibility
      switch (field) {
        case 'title':
          if (!['title', 'rich_text'].includes(propertyConfig.type)) {
            errors.push(`Title must be mapped to a title or rich_text property`);
          }
          break;
        case 'status':
          if (!['select', 'status'].includes(propertyConfig.type)) {
            errors.push(`Status must be mapped to a select or status property`);
          }
          break;
        case 'priority':
          if (!['select', 'number'].includes(propertyConfig.type)) {
            errors.push(`Priority must be mapped to a select or number property`);
          }
          break;
      }
    }

    // Validate optional field mappings
    const optionalFieldTypes: Record<string, string[]> = {
      description: ['rich_text'],
      dueDate: ['date'],
      category: ['select', 'multi_select'],
      tags: ['multi_select'],
      assignee: ['people'],
      duration: ['number']
    };

    Object.entries(optionalFieldTypes).forEach(([field, validTypes]) => {
      const notionField = mappingConfig[field];
      if (notionField) {
        const propertyConfig = database.properties[notionField];
        if (!propertyConfig) {
          errors.push(`Mapped field ${field} references non-existent Notion property: ${notionField}`);
        } else if (!validTypes.includes(propertyConfig.type)) {
          errors.push(`${field} must be mapped to one of: ${validTypes.join(', ')}`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Deletes a schema mapping
   */
  static async deleteMapping(userId: string, databaseId: string) {
    return prisma.notionSchemaMapping.delete({
      where: {
        userId_databaseId: {
          userId,
          databaseId
        }
      }
    });
  }

  /**
   * Lists all schema mappings for a user
   */
  static async listMappings(userId: string) {
    return prisma.notionSchemaMapping.findMany({
      where: { userId }
    });
  }
} 