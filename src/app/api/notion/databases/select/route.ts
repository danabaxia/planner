import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NotionService } from '@/services/notion';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { databaseId } = await req.json();
    if (!databaseId) {
      return NextResponse.json({ error: 'Database ID is required' }, { status: 400 });
    }

    // Verify the database exists and is accessible
    const notionService = NotionService.getInstance();
    if (!session.user.notionAccessToken) {
      return NextResponse.json({ error: 'Notion access token not found' }, { status: 401 });
    }

    notionService.initialize(session.user.notionAccessToken);
    
    try {
      const database = await notionService.getDatabase(databaseId);
      if (!database) {
        return NextResponse.json({ error: 'Database not found' }, { status: 404 });
      }

      // Get the database schema
      const schema = await notionService.getDatabaseSchema(databaseId);

      // Store the selected database in the user's preferences
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          selectedNotionDatabases: {
            push: databaseId,
          },
        },
      });

      return NextResponse.json({
        message: 'Database selected successfully',
        database: {
          id: database.id,
          properties: schema,
        },
      });
    } catch (error: any) {
      if (error.code === 'object_not_found') {
        return NextResponse.json({ error: 'Database not found' }, { status: 404 });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error selecting Notion database:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 