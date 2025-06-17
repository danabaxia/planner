'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export type StatusType = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'scheduled' | 'error' | 'warning' | 'info' | 'success';
export type StatusSize = 'sm' | 'md' | 'lg';
export type StatusVariant = 'badge' | 'dot' | 'pill' | 'outline';

export interface StatusIndicatorProps {
  status: StatusType;
  size?: StatusSize;
  variant?: StatusVariant;
  label?: string;
  showIcon?: boolean;
  animated?: boolean;
  pulse?: boolean;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

const statusConfig = {
  pending: {
    color: 'warning',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Pending',
  },
  'in-progress': {
    color: 'info',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: 'In Progress',
  },
  completed: {
    color: 'success',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    label: 'Completed',
  },
  cancelled: {
    color: 'error',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    label: 'Cancelled',
  },
  scheduled: {
    color: 'secondary',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Scheduled',
  },
  error: {
    color: 'error',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Error',
  },
  warning: {
    color: 'warning',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    label: 'Warning',
  },
  info: {
    color: 'info',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Info',
  },
  success: {
    color: 'success',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Success',
  },
};

const getColorClasses = (color: string, variant: StatusVariant) => {
  const colorMap = {
    warning: {
      badge: 'bg-warning-100 text-warning-700 border-warning-200',
      dot: 'bg-warning-500',
      pill: 'bg-warning-100 text-warning-700',
      outline: 'border-warning-500 text-warning-600 bg-warning-50',
    },
    info: {
      badge: 'bg-info-100 text-info-700 border-info-200',
      dot: 'bg-info-500',
      pill: 'bg-info-100 text-info-700',
      outline: 'border-info-500 text-info-600 bg-info-50',
    },
    success: {
      badge: 'bg-success-100 text-success-700 border-success-200',
      dot: 'bg-success-500',
      pill: 'bg-success-100 text-success-700',
      outline: 'border-success-500 text-success-600 bg-success-50',
    },
    error: {
      badge: 'bg-error-100 text-error-700 border-error-200',
      dot: 'bg-error-500',
      pill: 'bg-error-100 text-error-700',
      outline: 'border-error-500 text-error-600 bg-error-50',
    },
    secondary: {
      badge: 'bg-secondary-100 text-secondary-700 border-secondary-200',
      dot: 'bg-secondary-500',
      pill: 'bg-secondary-100 text-secondary-700',
      outline: 'border-secondary-500 text-secondary-600 bg-secondary-50',
    },
  };

  return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.info[variant];
};

const getSizeClasses = (size: StatusSize, variant: StatusVariant) => {
  if (variant === 'dot') {
    return {
      sm: 'h-2 w-2',
      md: 'h-3 w-3',
      lg: 'h-4 w-4',
    }[size];
  }

  return {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  }[size];
};

const getIconSize = (size: StatusSize) => {
  return {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }[size];
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  variant = 'badge',
  label,
  showIcon = true,
  animated = true,
  pulse = false,
  className,
  onClick,
  'aria-label': ariaLabel,
}) => {
  const config = statusConfig[status];
  const displayLabel = label || config.label;
  const isClickable = !!onClick;

  const baseClasses = cn(
    'inline-flex items-center font-medium transition-all duration-200',
    {
      // Variant-specific base styles
      'rounded-full': variant === 'badge' || variant === 'pill' || variant === 'dot',
      'rounded-md': variant === 'outline',
      'border': variant === 'badge' || variant === 'outline',
      'border-2': variant === 'outline',
      'cursor-pointer hover:scale-105': isClickable,
      'animate-pulse': pulse,
    },
    getSizeClasses(size, variant),
    getColorClasses(config.color, variant),
    className
  );

  const content = (
    <>
      {showIcon && variant !== 'dot' && (
        <span className={cn('flex-shrink-0', getIconSize(size))}>
          {config.icon}
        </span>
      )}
      {variant !== 'dot' && displayLabel && (
        <span className={cn({ 'ml-1.5': showIcon })}>{displayLabel}</span>
      )}
    </>
  );

  const motionProps = animated
    ? {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        whileHover: isClickable ? { scale: 1.05 } : undefined,
        whileTap: isClickable ? { scale: 0.95 } : undefined,
        transition: { duration: 0.2 },
      }
    : {};

  if (variant === 'dot') {
    return (
      <motion.div
        className={baseClasses}
        title={displayLabel}
        onClick={onClick}
        aria-label={ariaLabel || displayLabel}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        {...motionProps}
      />
    );
  }

  const Component = isClickable ? motion.button : motion.div;

  return (
    <Component
      className={baseClasses}
      onClick={onClick}
      aria-label={ariaLabel || displayLabel}
      title={displayLabel}
      type={isClickable ? 'button' : undefined}
      {...motionProps}
    >
      {content}
    </Component>
  );
};

// Status Indicator Group for displaying multiple statuses
export interface StatusIndicatorGroupProps {
  statuses: Array<{
    status: StatusType;
    label?: string;
    count?: number;
  }>;
  size?: StatusSize;
  variant?: StatusVariant;
  showIcon?: boolean;
  showCounts?: boolean;
  className?: string;
  onStatusClick?: (status: StatusType) => void;
}

export const StatusIndicatorGroup: React.FC<StatusIndicatorGroupProps> = ({
  statuses,
  size = 'md',
  variant = 'badge',
  showIcon = true,
  showCounts = false,
  className,
  onStatusClick,
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {statuses.map(({ status, label, count }, index) => (
        <StatusIndicator
          key={`${status}-${index}`}
          status={status}
          size={size}
          variant={variant}
          label={
            showCounts && count !== undefined
              ? `${label || statusConfig[status].label} (${count})`
              : label
          }
          showIcon={showIcon}
          onClick={onStatusClick ? () => onStatusClick(status) : undefined}
        />
      ))}
    </div>
  );
};

// Status Progress component for showing completion progress
export interface StatusProgressProps {
  total: number;
  completed: number;
  inProgress?: number;
  size?: StatusSize;
  showLabels?: boolean;
  showPercentage?: boolean;
  className?: string;
}

export const StatusProgress: React.FC<StatusProgressProps> = ({
  total,
  completed,
  inProgress = 0,
  size = 'md',
  showLabels = true,
  showPercentage = true,
  className,
}) => {
  const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
  const inProgressPercentage = total > 0 ? (inProgress / total) * 100 : 0;

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-neutral-600">
              Progress: {completed}/{total}
            </span>
            {inProgress > 0 && (
              <span className="text-info-600">
                In Progress: {inProgress}
              </span>
            )}
          </div>
          {showPercentage && (
            <span className="text-neutral-500 font-medium">
              {Math.round(completedPercentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={cn('w-full bg-neutral-200 rounded-full overflow-hidden', heightClasses[size])}>
        <motion.div
          className="h-full bg-success-500 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${completedPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {inProgress > 0 && (
            <motion.div
              className="absolute right-0 top-0 h-full bg-info-500 rounded-r-full"
              initial={{ width: 0 }}
              animate={{ width: `${inProgressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}; 