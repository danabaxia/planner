// Application constants
export const APP_NAME = 'Daily Activity Planner'
export const APP_DESCRIPTION =
  'Beautiful Notion-powered planning with Motion-inspired design'

// API endpoints
export const API_ROUTES = {
  ACTIVITIES: '/api/activities',
  NOTION: '/api/notion',
  AUTH: '/api/auth',
  ANALYTICS: '/api/analytics',
} as const

// Activity statuses
export const ACTIVITY_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DEFERRED: 'deferred',
} as const

// Activity priorities
export const ACTIVITY_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

// Time durations (in minutes)
export const TIME_DURATIONS = {
  QUICK: 15,
  SHORT: 30,
  MEDIUM: 60,
  LONG: 120,
  EXTENDED: 240,
} as const

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'daily-planner-theme',
  USER_PREFERENCES: 'daily-planner-preferences',
  LAST_SYNC: 'daily-planner-last-sync',
} as const

// Animation durations (in seconds)
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
} as const
