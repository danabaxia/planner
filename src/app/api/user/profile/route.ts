import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { userOperations } from '@/lib/db'
import { handleApiError } from '@/lib/api-client'

export const dynamic = 'force-dynamic'

// GET /api/user/profile - Get user profile
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await userOperations.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return only necessary profile fields
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
      notionWorkspaceId: user.notionWorkspaceId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get user profile',
        details: handleApiError(error),
      },
      { status: 500 }
    )
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate input
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Only allow updating specific fields
    const allowedFields = ['name', 'image']
    const updateData = Object.keys(data)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key]
        return obj
      }, {} as Record<string, any>)

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedUser = await userOperations.update(session.user.id, updateData)

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      emailVerified: updatedUser.emailVerified,
      notionWorkspaceId: updatedUser.notionWorkspaceId,
      updatedAt: updatedUser.updatedAt,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update user profile',
        details: handleApiError(error),
      },
      { status: 500 }
    )
  }
}

// DELETE /api/user/profile - Delete user account
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await userOperations.delete(session.user.id)

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete profile error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete user account',
        details: handleApiError(error),
      },
      { status: 500 }
    )
  }
} 