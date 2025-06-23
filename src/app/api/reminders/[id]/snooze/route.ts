import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const snoozeSchema = z.object({
  duration: z.number().min(1), // Duration in minutes
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { duration } = snoozeSchema.parse(body);

    const reminder = await prisma.reminder.findUnique({
      where: { id: params.id },
      select: { userId: true, reminderTime: true },
    });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    if (reminder.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate new reminder time
    const newReminderTime = new Date(reminder.reminderTime.getTime() + duration * 60000);

    // Update reminder time
    await prisma.reminder.update({
      where: { id: params.id },
      data: {
        reminderTime: newReminderTime,
        isRead: false, // Reset read status
      },
    });

    return NextResponse.json({ success: true, newReminderTime });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error snoozing reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 