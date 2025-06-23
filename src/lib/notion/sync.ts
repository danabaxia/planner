import { Task } from '@prisma/client';
import type { NotionPage } from '@/types/notion';

export type ConflictResolutionStrategy = 'notion' | 'local' | 'latest' | 'manual';

export interface SyncConflict {
  taskId: string;
  notionId: string;
  field: string;
  localValue: any;
  notionValue: any;
  localUpdatedAt: Date;
  notionUpdatedAt: Date;
}

export interface ConflictResolution {
  taskId: string;
  notionId: string;
  field: string;
  resolvedValue: any;
  strategy: ConflictResolutionStrategy;
}

/**
 * Detects conflicts between local and Notion versions of a task
 */
export function detectConflicts(
  task: Task,
  notionPage: NotionPage,
  mapping: Record<string, string>
): SyncConflict[] {
  const conflicts: SyncConflict[] = [];
  const notionLastEditTime = new Date(notionPage.last_edited_time);

  // Compare each mapped field
  for (const [localField, notionField] of Object.entries(mapping)) {
    const localValue = task[localField as keyof Task];
    const notionValue = notionPage.properties[notionField]?.value;

    if (localValue !== notionValue && task.lastSyncedAt) {
      conflicts.push({
        taskId: task.id,
        notionId: notionPage.id,
        field: localField,
        localValue,
        notionValue,
        localUpdatedAt: task.updatedAt,
        notionUpdatedAt: notionLastEditTime,
      });
    }
  }

  return conflicts;
}

/**
 * Resolves conflicts based on the specified strategy
 */
export function resolveConflicts(
  conflicts: SyncConflict[],
  strategy: ConflictResolutionStrategy
): ConflictResolution[] {
  return conflicts.map(conflict => {
    let resolvedValue: any;

    switch (strategy) {
      case 'notion':
        resolvedValue = conflict.notionValue;
        break;
      
      case 'local':
        resolvedValue = conflict.localValue;
        break;
      
      case 'latest':
        resolvedValue = conflict.localUpdatedAt > conflict.notionUpdatedAt
          ? conflict.localValue
          : conflict.notionValue;
        break;
      
      case 'manual':
        // Return both values for manual resolution
        resolvedValue = {
          local: conflict.localValue,
          notion: conflict.notionValue,
        };
        break;
      
      default:
        resolvedValue = conflict.notionValue; // Default to Notion value
    }

    return {
      taskId: conflict.taskId,
      notionId: conflict.notionId,
      field: conflict.field,
      resolvedValue,
      strategy,
    };
  });
}

/**
 * Applies resolved conflicts to both local and Notion versions
 */
export async function applyResolutions(
  resolutions: ConflictResolution[],
  notionService: any,
  prisma: any
): Promise<void> {
  for (const resolution of resolutions) {
    if (resolution.strategy === 'manual') {
      // Skip manual resolutions - they need user input
      continue;
    }

    // Update local task
    await prisma.task.update({
      where: { id: resolution.taskId },
      data: {
        [resolution.field]: resolution.resolvedValue,
        lastSyncedAt: new Date(),
      },
    });

    // Update Notion page
    await notionService.getClient().pages.update({
      page_id: resolution.notionId,
      properties: {
        [resolution.field]: resolution.resolvedValue,
      },
    });
  }
} 