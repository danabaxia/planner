import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { notionTokenService } from '@/lib/notionTokenService'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const hasToken = await notionTokenService.hasValidToken(session.user.id)
    return NextResponse.json({ hasToken })
  } catch (error) {
    console.error('Error checking Notion token:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { accessToken, workspaceId, workspaceName, botId } = body

    if (!accessToken || !workspaceId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    await notionTokenService.storeToken(session.user.id, {
      accessToken,
      workspaceId,
      workspaceName,
      botId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing Notion token:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await notionTokenService.revokeToken(session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking Notion token:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 