import { Queue, Worker, Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { notificationService } from './notifications';
import { sendPushNotification } from '@/lib/notifications';
import { sendReminderEmail } from '@/lib/email';
import type { PushSubscription } from 'web-push';

interface ReminderWithRelations {
  id: string;
  taskId: string;
  userId: string;
  reminderTime: Date;
  reminderType: string;
  message: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  task: {
    id: string;
    title: string;
    status: string;
    dueDate: Date | null;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
    pushSubscription: any;
  };
}

interface ReminderJobData {
  reminderId: string;
  taskId: string;
  userId: string;
  taskTitle: string;
  taskDescription?: string;
  reminderType: 'push' | 'email';
  message?: string;
  userEmail?: string;
  pushSubscription?: PushSubscription;
}

// Initialize the reminder queue
export const reminderQueue = new Queue<ReminderJobData>('reminders', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export const reminderWorker = new Worker<ReminderJobData>(
  'reminders',
  async (job: Job<ReminderJobData>) => {
    const data = job.data;

    try {
      if (data.reminderType === 'push' && data.pushSubscription) {
        await sendPushNotification(
          data.pushSubscription,
          data.taskTitle,
          data.message || `Reminder for task: ${data.taskTitle}`
        );
      } else if (data.reminderType === 'email' && data.userEmail) {
        await sendReminderEmail({
          to: data.userEmail,
          taskTitle: data.taskTitle,
          taskDescription: data.taskDescription,
          reminderMessage: data.message,
        });
      }

      // Mark reminder as read
      await prisma.reminder.update({
        where: { id: data.reminderId },
        data: { isRead: true },
      });
    } catch (error) {
      console.error('Error processing reminder:', error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  }
);

// Helper function to format notification message
function formatNotificationMessage(reminder: ReminderWithRelations) {
  const taskTitle = reminder.task.title;
  const dueDate = reminder.task.dueDate
    ? format(reminder.task.dueDate, 'PPp')
    : 'No due date';

  return {
    title: `Task Reminder: ${taskTitle}`,
    body: reminder.message || `Don't forget about your task "${taskTitle}" (Due: ${dueDate})`,
    taskId: reminder.taskId,
  };
}

// Schedule a new reminder
export async function scheduleReminder(reminderId: string) {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          pushSubscription: true,
        },
      },
    },
  });

  if (!reminder) {
    throw new Error('Reminder not found');
  }

  const delay = Math.max(0, reminder.reminderTime.getTime() - Date.now());

  await reminderQueue.add(
    'send-reminder',
    {
      reminderId: reminder.id,
      taskId: reminder.task.id,
      userId: reminder.user.id,
      taskTitle: reminder.task.title,
      taskDescription: reminder.task.description || undefined,
      reminderType: reminder.reminderType,
      message: reminder.message || undefined,
      userEmail: reminder.user.email || undefined,
      pushSubscription: reminder.user.pushSubscription as PushSubscription | undefined,
    },
    {
      delay,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}

// Cancel a scheduled reminder
export async function cancelReminder(reminderId: string) {
  const jobs = await reminderQueue.getJobs(['delayed', 'waiting']);
  const job = jobs.find((j: Job<ReminderJobData>) => j.data.reminderId === reminderId);
  
  if (job) {
    await job.remove();
  }
}

// Reschedule a reminder
export async function rescheduleReminder(reminderId: string, newReminderTime: Date) {
  await cancelReminder(reminderId);
  await scheduleReminder(reminderId);
}

// Clean up completed reminders
export async function cleanupCompletedReminders() {
  await reminderQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean up completed jobs older than 24 hours
}

interface PendingReminder {
  id: string;
  reminderTime: Date;
}

// Initialize the scheduler
export async function initializeReminderScheduler() {
  // Clean up old jobs
  await reminderQueue.clean(0, 'failed');
  await reminderQueue.clean(0, 'completed');

  // Schedule all pending reminders
  const pendingReminders = await prisma.$queryRaw<PendingReminder[]>`
    SELECT id, "reminderTime"
    FROM "Reminder"
    WHERE "isRead" = false
    AND "reminderTime" > NOW()
  `;

  for (const reminder of pendingReminders) {
    await scheduleReminder(reminder.id);
  }

  // Set up periodic cleanup
  setInterval(() => {
    cleanupCompletedReminders().catch(console.error);
  }, 24 * 60 * 60 * 1000); // Run every 24 hours
}

// Error handling
reminderQueue.on('error', (error) => {
  console.error('Reminder queue error:', error);
});

reminderWorker.on('failed', (job: Job<ReminderJobData>, error: Error) => {
  console.error(`Job ${job.id} failed:`, error);
});

// Export the queue for testing and monitoring
export { reminderQueue };

export async function initializeReminders() {
  const pendingReminders = await prisma.reminder.findMany({
    where: {
      isRead: false,
      reminderTime: {
        gt: new Date(),
      },
    },
  });

  for (const reminder of pendingReminders) {
    await scheduleReminder(reminder.id);
  }
} 