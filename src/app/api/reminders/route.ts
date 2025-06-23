import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { Task } from '@prisma/client';

// Schema for creating/updating reminders
const reminderSchema = z.object({
  taskId: z.string(),
  reminderTime: z.string().transform((str: string) => new Date(str)),
  reminderType: z.enum(['push', 'email']),
  message: z.string().optional(),
});

interface Reminder {
  id: string;
  taskId: string;
  userId: string;
  reminderTime: Date;
  reminderType: string;
  message: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type ReminderWithTask = Reminder & {
  task: Pick<Task, 'id' | 'title' | 'status' | 'dueDate'>;
};

// GET /api/reminders - Get all reminders for the current user
export async function GET(): Promise<NextResponse<ReminderWithTask[] | { error: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const reminders = await prisma.$queryRaw<ReminderWithTask[]>`
      SELECT r.*, 
             json_build_object(
               'id', t.id,
               'title', t.title,
               'status', t.status,
               'dueDate', t.due_date
             ) as task
      FROM "Reminder" r
      JOIN "Task" t ON r."taskId" = t.id
      WHERE r."userId" = ${user.id}
      ORDER BY r."reminderTime" ASC
    `;

    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

// POST /api/reminders - Create a new reminder
export async function POST(request: Request): Promise<NextResponse<ReminderWithTask | { error: string; details?: z.ZodError['errors'] }>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = reminderSchema.parse(body);

    // Verify the task belongs to the user using raw SQL to avoid type issues
    const task = await prisma.$queryRaw<Task[]>`
      SELECT * FROM "Task"
      WHERE id = ${validatedData.taskId}
      AND "userId" = ${user.id}
      LIMIT 1
    `;

    if (!task.length) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create reminder using raw SQL to avoid type issues
    const [reminder] = await prisma.$queryRaw<ReminderWithTask[]>`
      WITH new_reminder AS (
        INSERT INTO "Reminder" ("taskId", "userId", "reminderTime", "reminderType", "message", "isRead", "createdAt", "updatedAt")
        VALUES (
          ${validatedData.taskId},
          ${user.id},
          ${validatedData.reminderTime},
          ${validatedData.reminderType},
          ${validatedData.message || null},
          false,
          NOW(),
          NOW()
        )
        RETURNING *
      )
      SELECT r.*, 
             json_build_object(
               'id', t.id,
               'title', t.title,
               'status', t.status,
               'dueDate', t.due_date
             ) as task
      FROM new_reminder r
      JOIN "Task" t ON r."taskId" = t.id
    `;

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
} 