import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Client } from '@notionhq/client';
import { transformNotionValue } from '@/lib/notion/schema';
import type { SchemaMapping } from '@/lib/notion/schema';
import type { NotionPage, NotionPropertyValue } from '@/types/notion';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { databaseId, mapping } = await request.json();

    if (!databaseId || !mapping) {
      return NextResponse.json(
        { error: 'Database ID and mapping are required' },
        { status: 400 }
      );
    }

    // Get all pages from the Notion database
    const pages = await getAllDatabasePages(databaseId);

    // Transform and save each page
    const results = await Promise.all(
      pages.map((page) => transformAndSavePage(page, mapping, session.user.id))
    );

    // Update sync status
    await prisma.notionSync.upsert({
      where: {
        userId_databaseId: {
          userId: session.user.id,
          databaseId,
        },
      },
      update: {
        lastSynced: new Date(),
      },
      create: {
        userId: session.user.id,
        databaseId,
        lastSynced: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      results: {
        total: results.length,
        created: results.filter((r) => r.action === 'created').length,
        updated: results.filter((r) => r.action === 'updated').length,
        failed: results.filter((r) => r.action === 'failed').length,
      },
    });
  } catch (error) {
    console.error('Error syncing with Notion:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Notion' },
      { status: 500 }
    );
  }
}

async function getAllDatabasePages(databaseId: string): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    });

    pages.push(...(response.results as NotionPage[]));

    if (!response.has_more) break;
    cursor = response.next_cursor || undefined;
  }

  return pages;
}

async function transformAndSavePage(
  page: NotionPage,
  mapping: SchemaMapping,
  userId: string
): Promise<{ action: 'created' | 'updated' | 'failed'; error?: string }> {
  try {
    const transformedData = transformPageData(page, mapping);

    // Check if the task already exists
    const existingTask = await prisma.task.findFirst({
      where: {
        userId,
        notionId: page.id,
      },
    });

    if (existingTask) {
      // Update existing task
      await prisma.task.update({
        where: { id: existingTask.id },
        data: transformedData,
      });

      return { action: 'updated' };
    } else {
      // Create new task
      await prisma.task.create({
        data: {
          ...transformedData,
          userId,
          notionId: page.id,
        },
      });

      return { action: 'created' };
    }
  } catch (error) {
    console.error('Error transforming page:', error);
    return {
      action: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function transformPageData(page: NotionPage, mapping: SchemaMapping) {
  const data: Record<string, any> = {};

  // Map each field according to the schema mapping
  Object.entries(mapping.defaultMappings).forEach(([appField, notionField]) => {
    const propertyValue = page.properties[notionField] as NotionPropertyValue;
    if (!propertyValue) return;

    const propertyType = propertyValue.type;
    const value = transformNotionValue(
      propertyValue[propertyType as keyof NotionPropertyValue],
      propertyType,
      mapping.validationRules?.[appField]?.format
    );

    // Map the transformed value to the corresponding task field
    switch (appField) {
      case 'title':
        data.title = value;
        break;
      case 'description':
        data.description = value;
        break;
      case 'status':
        data.status = value;
        break;
      case 'priority':
        data.priority = typeof value === 'string' ? value : String(value);
        break;
      case 'dueDate':
        data.dueDate = value ? new Date(value) : null;
        break;
      case 'category':
        data.category = value;
        break;
      case 'tags':
        data.tags = Array.isArray(value) ? value : [value].filter(Boolean);
        break;
      case 'assignee':
        data.assignee = Array.isArray(value) ? value[0] : value;
        break;
      case 'duration':
        data.duration = typeof value === 'number' ? value : null;
        break;
    }
  });

  return data;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        selectedNotionDatabases: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      lastSyncedAt: user?.updatedAt,
      selectedDatabases: user?.selectedNotionDatabases || [],
    });
  } catch (error: any) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get sync status' },
      { status: 500 }
    );
  }
} 