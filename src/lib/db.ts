import { prisma } from './prisma'
import type { User, Project, Task, Comment, Attachment } from '@prisma/client'

// Error handling wrapper
const handleDatabaseError = (error: unknown, operation: string): never => {
  console.error(`Database error during ${operation}:`, error)
  throw error
}

// Type definitions for our models
type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified'>
type UpdateUserInput = Partial<CreateUserInput>

type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
type UpdateProjectInput = Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>

type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>
type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>>

type CreateCommentInput = Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
type UpdateCommentInput = Partial<Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'taskId' | 'userId'>>

type CreateAttachmentInput = Omit<Attachment, 'id' | 'createdAt' | 'updatedAt'>
type UpdateAttachmentInput = Partial<Omit<Attachment, 'id' | 'createdAt' | 'updatedAt' | 'taskId' | 'userId'>>

// User operations
export const userOperations = {
  create: async (data: CreateUserInput) => {
    try {
      return await prisma.user.create({ data })
    } catch (error) {
      return handleDatabaseError(error, 'user creation')
    }
  },

  update: async (id: string, data: UpdateUserInput) => {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      })
    } catch (error) {
      return handleDatabaseError(error, 'user update')
    }
  },

  delete: async (id: string) => {
    try {
      return await prisma.user.delete({
        where: { id },
      })
    } catch (error) {
      return handleDatabaseError(error, 'user deletion')
    }
  },

  findById: async (id: string) => {
    try {
      return await prisma.user.findUnique({
        where: { id },
      })
    } catch (error) {
      return handleDatabaseError(error, 'user lookup')
    }
  },

  findByEmail: async (email: string) => {
    try {
      return await prisma.user.findUnique({
        where: { email },
      })
    } catch (error) {
      return handleDatabaseError(error, 'user lookup by email')
    }
  },
}

// Project operations
export const projectOperations = {
  create: async (data: CreateProjectInput) => {
    try {
      return await prisma.project.create({ data })
    } catch (error) {
      return handleDatabaseError(error, 'project creation')
    }
  },

  update: async (id: string, data: UpdateProjectInput) => {
    try {
      return await prisma.project.update({
        where: { id },
        data,
      })
    } catch (error) {
      return handleDatabaseError(error, 'project update')
    }
  },

  delete: async (id: string) => {
    try {
      return await prisma.project.delete({
        where: { id },
      })
    } catch (error) {
      return handleDatabaseError(error, 'project deletion')
    }
  },

  findById: async (id: string) => {
    try {
      return await prisma.project.findUnique({
        where: { id },
        include: {
          tasks: true,
        },
      })
    } catch (error) {
      return handleDatabaseError(error, 'project lookup')
    }
  },

  findByUserId: async (userId: string) => {
    try {
      return await prisma.project.findMany({
        where: { userId },
        include: {
          tasks: true,
        },
      })
    } catch (error) {
      return handleDatabaseError(error, 'project lookup by user')
    }
  },
}

// Task operations
export const taskOperations = {
  create: async (data: CreateTaskInput) => {
    try {
      return await prisma.task.create({ data })
    } catch (error) {
      return handleDatabaseError(error, 'task creation')
    }
  },

  update: async (id: string, data: UpdateTaskInput) => {
    try {
      return await prisma.task.update({
        where: { id },
        data,
      })
    } catch (error) {
      return handleDatabaseError(error, 'task update')
    }
  },

  delete: async (id: string) => {
    try {
      return await prisma.task.delete({
        where: { id },
      })
    } catch (error) {
      return handleDatabaseError(error, 'task deletion')
    }
  },

  findById: async (id: string) => {
    try {
      return await prisma.task.findUnique({
        where: { id },
        include: {
          comments: true,
          attachments: true,
        },
      })
    } catch (error) {
      return handleDatabaseError(error, 'task lookup')
    }
  },

  findByProjectId: async (projectId: string) => {
    try {
      return await prisma.task.findMany({
        where: { projectId },
        include: {
          comments: true,
          attachments: true,
        },
      })
    } catch (error) {
      return handleDatabaseError(error, 'task lookup by project')
    }
  },

  findByStatus: async (projectId: string, status: string) => {
    try {
      return await prisma.task.findMany({
        where: { 
          projectId,
          status,
        },
        include: {
          comments: true,
          attachments: true,
        },
      })
    } catch (error) {
      return handleDatabaseError(error, 'task lookup by status')
    }
  },
}

// Comment operations
export const commentOperations = {
  create: async (data: CreateCommentInput) => {
    try {
      return await prisma.comment.create({ data })
    } catch (error) {
      return handleDatabaseError(error, 'comment creation')
    }
  },

  update: async (id: string, data: UpdateCommentInput) => {
    try {
      return await prisma.comment.update({
        where: { id },
        data,
      })
    } catch (error) {
      return handleDatabaseError(error, 'comment update')
    }
  },

  delete: async (id: string) => {
    try {
      return await prisma.comment.delete({
        where: { id },
      })
    } catch (error) {
      return handleDatabaseError(error, 'comment deletion')
    }
  },

  findByTaskId: async (taskId: string) => {
    try {
      return await prisma.comment.findMany({
        where: { taskId },
        include: {
          user: true,
        },
      })
    } catch (error) {
      return handleDatabaseError(error, 'comment lookup by task')
    }
  },
}

// Attachment operations
export const attachmentOperations = {
  create: async (data: CreateAttachmentInput) => {
    try {
      return await prisma.attachment.create({ data })
    } catch (error) {
      return handleDatabaseError(error, 'attachment creation')
    }
  },

  update: async (id: string, data: UpdateAttachmentInput) => {
    try {
      return await prisma.attachment.update({
        where: { id },
        data,
      })
    } catch (error) {
      return handleDatabaseError(error, 'attachment update')
    }
  },

  delete: async (id: string) => {
    try {
      return await prisma.attachment.delete({
        where: { id },
      })
    } catch (error) {
      return handleDatabaseError(error, 'attachment deletion')
    }
  },

  findByTaskId: async (taskId: string) => {
    try {
      return await prisma.attachment.findMany({
        where: { taskId },
        include: {
          user: true,
        },
      })
    } catch (error) {
      return handleDatabaseError(error, 'attachment lookup by task')
    }
  },
} 