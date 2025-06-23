import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { NotionMappingService } from '@/lib/services/notionMappingService';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const databaseId = searchParams.get('databaseId');

  if (!databaseId) {
    try {
      const mappings = await NotionMappingService.listMappings(session.user.id);
      return NextResponse.json({ mappings });
    } catch (error) {
      console.error('Error listing mappings:', error);
      return NextResponse.json(
        { error: 'Failed to list mappings' },
        { status: 500 }
      );
    }
  }

  try {
    const mapping = await NotionMappingService.getMapping(
      session.user.id,
      databaseId
    );
    return NextResponse.json({ mapping });
  } catch (error) {
    console.error('Error getting mapping:', error);
    return NextResponse.json(
      { error: 'Failed to get mapping' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { databaseId, properties, mappingConfig } = body;

    if (!databaseId || !properties) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const mapping = await NotionMappingService.saveMapping({
      userId: session.user.id,
      databaseId,
      properties,
      mappingConfig,
    });

    return NextResponse.json({ mapping });
  } catch (error) {
    console.error('Error saving mapping:', error);
    return NextResponse.json(
      { error: 'Failed to save mapping' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const databaseId = searchParams.get('databaseId');

  if (!databaseId) {
    return NextResponse.json(
      { error: 'Database ID is required' },
      { status: 400 }
    );
  }

  try {
    await NotionMappingService.deleteMapping(session.user.id, databaseId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mapping:', error);
    return NextResponse.json(
      { error: 'Failed to delete mapping' },
      { status: 500 }
    );
  }
} 