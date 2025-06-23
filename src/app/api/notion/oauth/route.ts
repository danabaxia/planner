import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NotionAuthResponse } from '@/types/notion';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Exchange code for access token
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NOTION_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to exchange code for token:', error);
      return NextResponse.json({ error: 'Failed to authenticate with Notion' }, { status: 500 });
    }

    const data = await response.json() as NotionAuthResponse;

    // Update user record with Notion workspace info
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        notionAccessToken: data.access_token,
        notionWorkspaceId: data.workspace_id,
        notionBotId: data.bot_id,
      },
    });

    // Redirect to success page
    return NextResponse.redirect(new URL('/settings?notion=success', req.url));
  } catch (error: any) {
    console.error('Error in Notion OAuth handler:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 