// Activity types
export interface Activity {
  id: string
  notionId: string
  title: string
  description: string
  status: ActivityStatus
  priority: Priority
  estimatedDuration: number // in minutes
  actualDuration?: number // in minutes
  scheduledStart?: Date
  scheduledEnd?: Date
  tags: string[]
  category: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  notionProperties: Record<string, any>
}

export type ActivityStatus = 'todo' | 'in-progress' | 'completed' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

// User types
export interface User {
  id: string
  email: string
  name: string
  notionAccessToken: string
  selectedDatabases: string[]
  preferences: UserPreferences
  createdAt: Date
  lastSync: Date
}

export interface UserPreferences {
  workingHours: {
    start: string // HH:mm format
    end: string // HH:mm format
  }
  timeZone: string
  defaultDuration: number // in minutes
  bufferTime: number // in minutes
}

// Notion types
export interface NotionDatabase {
  id: string
  title: string
  properties: Record<string, NotionProperty>
}

export interface NotionProperty {
  id: string
  name: string
  type: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

// UI Component types
export interface ActivityCardProps {
  activity: Activity
  onUpdate: (activity: Activity) => void
  onDelete: (id: string) => void
}

export interface TimelineEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'activity' | 'meeting' | 'break'
  color?: string
} 