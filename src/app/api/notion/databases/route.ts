import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { NotionService } from '@/services/notion';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || !session.user.notionAccessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notionService = NotionService.getInstance();
    notionService.initialize(session.user.notionAccessToken);

    const databases = await notionService.searchDatabases();

    return NextResponse.json({ databases: databases || [] });
  } catch (error: any) {
    console.error('Error fetching Notion databases:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 