import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { ReminderEmail } from '@/emails/ReminderEmail'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

interface SendReminderEmailOptions {
  to: string
  taskTitle: string
  taskDescription?: string
  reminderMessage?: string
  dueDate?: Date
}

export async function sendReminderEmail({
  to,
  taskTitle,
  taskDescription,
  reminderMessage,
  dueDate,
}: SendReminderEmailOptions) {
  const html = render(
    ReminderEmail({
      taskTitle,
      taskDescription,
      reminderMessage,
      dueDate,
    })
  )

  await sendEmail({
    to,
    subject: `Reminder: ${taskTitle}`,
    html,
  })
} 