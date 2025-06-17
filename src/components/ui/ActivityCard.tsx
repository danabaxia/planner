'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { activityCardHover, activityCardContent } from '@/utils/animations';

export type ActivityStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'scheduled';
export type ActivityPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  startTime?: string;
  endTime?: string;
  duration?: number; // in minutes
  tags?: string[];
  category?: string;
  location?: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityCardProps {
  activity: Activity;
  onClick?: (activity: Activity) => void;
  onStatusChange?: (activityId: string, status: ActivityStatus) => void;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
  draggable?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onClick,
  onStatusChange,
  onEdit,
  onDelete,
  className,
  compact = false,
  showActions = true,
  draggable = false,
}) => {
  const getStatusStyles = (status: ActivityStatus) => {
    const statusMap = {
      pending: 'status-pending',
      'in-progress': 'status-in-progress',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      scheduled: 'status-scheduled',
    };
    return statusMap[status];
  };

  const getPriorityStyles = (priority: ActivityPriority) => {
    const priorityMap = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent',
    };
    return priorityMap[priority];
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(activity);
    }
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatusChange) {
      // Cycle through statuses
      const statusOrder: ActivityStatus[] = ['pending', 'in-progress', 'completed'];
      const currentIndex = statusOrder.indexOf(activity.status);
      const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
      onStatusChange(activity.id, nextStatus);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(activity);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(activity.id);
    }
  };

  return (
    <motion.div
      className={cn(
        'activity-card',
        'group relative',
        {
          'p-3': compact,
          'p-4': !compact,
        },
        className
      )}
      variants={activityCardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={handleCardClick}
      drag={draggable}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      layout
    >
      {/* Priority indicator */}
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-1 rounded-l-xl',
          {
            'bg-neutral-400': activity.priority === 'low',
            'bg-warning-500': activity.priority === 'medium',
            'bg-error-500': activity.priority === 'high',
            'bg-error-600': activity.priority === 'urgent',
          }
        )}
      />

      <motion.div
        className="space-y-3"
        variants={activityCardContent}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold text-neutral-900 truncate',
              {
                'text-sm': compact,
                'text-base': !compact,
              }
            )}>
              {activity.title}
            </h3>
            {activity.category && (
              <p className="text-xs text-neutral-500 mt-1">
                {activity.category}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status badge */}
            <button
              className={cn(
                'status-indicator transition-all duration-200 hover:scale-105',
                getStatusStyles(activity.status)
              )}
              onClick={handleStatusClick}
              title={`Status: ${activity.status}. Click to change.`}
            >
              {activity.status.replace('-', ' ')}
            </button>

            {/* Priority badge */}
            <span
              className={cn(
                'status-indicator text-xs',
                getPriorityStyles(activity.priority)
              )}
              title={`Priority: ${activity.priority}`}
            >
              {activity.priority}
            </span>
          </div>
        </div>

        {/* Description */}
        {activity.description && !compact && (
          <p className="text-sm text-neutral-600 line-clamp-2">
            {activity.description}
          </p>
        )}

        {/* Time and duration */}
        {(activity.startTime || activity.duration) && (
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            {activity.startTime && (
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {formatTime(activity.startTime)}
                  {activity.endTime && ` - ${formatTime(activity.endTime)}`}
                </span>
              </div>
            )}
            {activity.duration && (
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDuration(activity.duration)}</span>
              </div>
            )}
          </div>
        )}

        {/* Location */}
        {activity.location && !compact && (
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{activity.location}</span>
          </div>
        )}

        {/* Tags */}
        {activity.tags && activity.tags.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1">
            {activity.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-700"
              >
                {tag}
              </span>
            ))}
            {activity.tags.length > 3 && (
              <span className="text-xs text-neutral-500">
                +{activity.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <button
                className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
                onClick={handleEdit}
                title="Edit activity"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                className="p-1 rounded hover:bg-error-100 text-neutral-500 hover:text-error-600 transition-colors"
                onClick={handleDelete}
                title="Delete activity"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Completion overlay for completed activities */}
      {activity.status === 'completed' && (
        <motion.div
          className="absolute inset-0 bg-success-500/10 rounded-xl flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-success-500 text-white rounded-full p-2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Activity Card List component for displaying multiple cards
export interface ActivityCardListProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  onStatusChange?: (activityId: string, status: ActivityStatus) => void;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
  emptyMessage?: string;
  loading?: boolean;
}

export const ActivityCardList: React.FC<ActivityCardListProps> = ({
  activities,
  onActivityClick,
  onStatusChange,
  onEdit,
  onDelete,
  className,
  compact = false,
  showActions = true,
  emptyMessage = 'No activities found',
  loading = false,
}) => {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="activity-card animate-pulse">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2 mt-2"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-neutral-200 rounded-full w-16"></div>
                  <div className="h-6 bg-neutral-200 rounded-full w-12"></div>
                </div>
              </div>
              <div className="h-3 bg-neutral-200 rounded w-full"></div>
              <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="text-neutral-400 mb-2">
          <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn('space-y-4', className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {activities.map((activity) => (
        <motion.div
          key={activity.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <ActivityCard
            activity={activity}
            onClick={onActivityClick}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
            compact={compact}
            showActions={showActions}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}; 