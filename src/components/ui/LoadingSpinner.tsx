'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring' | 'wave';
export type SpinnerColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  color?: SpinnerColor;
  label?: string;
  showLabel?: boolean;
  className?: string;
  'aria-label'?: string;
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const colorClasses = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  success: 'text-success-600',
  warning: 'text-warning-600',
  error: 'text-error-600',
  info: 'text-info-600',
  neutral: 'text-neutral-600',
};

const SpinnerIcon: React.FC<{ size: SpinnerSize; color: SpinnerColor }> = ({ size, color }) => (
  <motion.svg
    className={cn(sizeClasses[size], colorClasses[color])}
    fill="none"
    viewBox="0 0 24 24"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </motion.svg>
);

const DotsSpinner: React.FC<{ size: SpinnerSize; color: SpinnerColor }> = ({ size, color }) => {
  const dotSize = {
    xs: 'h-1 w-1',
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
    xl: 'h-3 w-3',
  }[size];

  const containerSize = {
    xs: 'gap-0.5',
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1',
    xl: 'gap-1.5',
  }[size];

  return (
    <div className={cn('flex items-center', containerSize)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(dotSize, 'rounded-full bg-current', colorClasses[color])}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
};

const PulseSpinner: React.FC<{ size: SpinnerSize; color: SpinnerColor }> = ({ size, color }) => (
  <motion.div
    className={cn(
      sizeClasses[size],
      'rounded-full bg-current',
      colorClasses[color]
    )}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
    }}
    transition={{
      duration: 1,
      repeat: Infinity,
    }}
  />
);

const BarsSpinner: React.FC<{ size: SpinnerSize; color: SpinnerColor }> = ({ size, color }) => {
  const barHeight = {
    xs: 'h-3',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
  }[size];

  const barWidth = {
    xs: 'w-0.5',
    sm: 'w-0.5',
    md: 'w-1',
    lg: 'w-1',
    xl: 'w-1.5',
  }[size];

  const containerGap = {
    xs: 'gap-0.5',
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1',
    xl: 'gap-1.5',
  }[size];

  return (
    <div className={cn('flex items-end', containerGap)}>
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={cn(barWidth, barHeight, 'bg-current', colorClasses[color])}
          animate={{
            scaleY: [1, 0.4, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};

const RingSpinner: React.FC<{ size: SpinnerSize; color: SpinnerColor }> = ({ size, color }) => (
  <motion.div
    className={cn(
      sizeClasses[size],
      'border-2 border-current border-t-transparent rounded-full',
      colorClasses[color]
    )}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  />
);

const WaveSpinner: React.FC<{ size: SpinnerSize; color: SpinnerColor }> = ({ size, color }) => {
  const waveHeight = {
    xs: 'h-2',
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8',
  }[size];

  const waveWidth = {
    xs: 'w-0.5',
    sm: 'w-0.5',
    md: 'w-1',
    lg: 'w-1',
    xl: 'w-1.5',
  }[size];

  const containerGap = {
    xs: 'gap-0.5',
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1',
    xl: 'gap-1.5',
  }[size];

  return (
    <div className={cn('flex items-center', containerGap)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={cn(waveWidth, waveHeight, 'bg-current', colorClasses[color])}
          animate={{
            scaleY: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  label = 'Loading...',
  showLabel = false,
  className,
  'aria-label': ariaLabel,
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner size={size} color={color} />;
      case 'pulse':
        return <PulseSpinner size={size} color={color} />;
      case 'bars':
        return <BarsSpinner size={size} color={color} />;
      case 'ring':
        return <RingSpinner size={size} color={color} />;
      case 'wave':
        return <WaveSpinner size={size} color={color} />;
      default:
        return <SpinnerIcon size={size} color={color} />;
    }
  };

  const labelSize = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }[size];

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      role="status"
      aria-label={ariaLabel || label}
    >
      <div className={cn('flex items-center', { 'flex-col gap-2': showLabel })}>
        {renderSpinner()}
        {showLabel && (
          <span className={cn('text-neutral-600 font-medium', labelSize)}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

// Loading Overlay component for full-screen loading states
export interface LoadingOverlayProps {
  isVisible: boolean;
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  color?: SpinnerColor;
  label?: string;
  showLabel?: boolean;
  backdrop?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  size = 'lg',
  variant = 'spinner',
  color = 'primary',
  label = 'Loading...',
  showLabel = true,
  backdrop = true,
  className,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        {
          'bg-black/50 backdrop-blur-sm': backdrop,
        },
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-white rounded-lg p-6 shadow-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <LoadingSpinner
          size={size}
          variant={variant}
          color={color}
          label={label}
          showLabel={showLabel}
        />
      </motion.div>
    </motion.div>
  );
};

// Loading Button component for buttons with loading states
export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  spinnerSize?: SpinnerSize;
  spinnerVariant?: SpinnerVariant;
  spinnerColor?: SpinnerColor;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText,
  spinnerSize = 'sm',
  spinnerVariant = 'spinner',
  spinnerColor = 'neutral',
  children,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 transition-all duration-200',
        {
          'cursor-not-allowed opacity-60': isLoading,
        },
        className
      )}
    >
      {isLoading && (
        <LoadingSpinner
          size={spinnerSize}
          variant={spinnerVariant}
          color={spinnerColor}
        />
      )}
      <span className={cn({ 'opacity-0': isLoading && !loadingText })}>
        {isLoading && loadingText ? loadingText : children}
      </span>
    </button>
  );
};

// Loading Skeleton component for content placeholders
export interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
  animated?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className,
  rounded = false,
  animated = true,
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(
        'bg-neutral-200',
        {
          'rounded-md': rounded,
          'animate-pulse': animated,
        },
        className
      )}
      style={style}
    />
  );
};

// Loading Skeleton Group for multiple skeleton lines
export interface LoadingSkeletonGroupProps {
  lines?: number;
  className?: string;
  animated?: boolean;
}

export const LoadingSkeletonGroup: React.FC<LoadingSkeletonGroupProps> = ({
  lines = 3,
  className,
  animated = true,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <LoadingSkeleton
          key={index}
          height="1rem"
          width={index === lines - 1 ? '75%' : '100%'}
          rounded
          animated={animated}
        />
      ))}
    </div>
  );
}; 