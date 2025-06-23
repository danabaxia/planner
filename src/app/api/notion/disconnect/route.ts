import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove Notion-related data from user record
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        notionAccessToken: null,
        notionWorkspaceId: null,
        notionBotId: null,
      },
    });

    return NextResponse.json({ message: 'Successfully disconnected from Notion' });
  } catch (error: any) {
    console.error('Error disconnecting from Notion:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 