import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { userOperations } from '@/lib/db'
import { handleApiError } from '@/lib/api-client'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

// POST /api/user/verify-email - Send verification email
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await userOperations.findById(session.user.id)

    if (!user?.email) {
      return NextResponse.json(
        { error: 'No email address associated with account' },
        { status: 400 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save verification token
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    })

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
    await sendEmail({
      to: user.email,
      subject: 'Verify your email address',
      text: `Click the following link to verify your email address: ${verificationUrl}`,
      html: `
        <div>
          <h1>Verify your email address</h1>
          <p>Click the following link to verify your email address:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    })

    return NextResponse.json({ message: 'Verification email sent' })
  } catch (error) {
    console.error('Send verification email error:', error)
    return NextResponse.json(
      {
        error: 'Failed to send verification email',
        details: handleApiError(error),
      },
      { status: 500 }
    )
  }
}

// GET /api/user/verify-email - Verify email with token
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token required' },
        { status: 400 }
      )
    }

    // Find and validate token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.json(
        { error: 'Verification token expired' },
        { status: 400 }
      )
    }

    // Update user email verification status
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify email',
        details: handleApiError(error),
      },
      { status: 500 }
    )
  }
} 