'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formField } from '@/utils/animations';

export interface InputProps extends Omit<HTMLMotionProps<'input'>, 'size'> {
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Input style variant */
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Help text */
  helpText?: string;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Additional motion props for the container */
  containerMotionProps?: Omit<HTMLMotionProps<'div'>, 'children'>;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      size = 'md',
      variant = 'default',
      error,
      errorMessage,
      helpText,
      leftIcon,
      rightIcon,
      loading,
      disabled,
      containerMotionProps,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      // Base styles
      'input',
      'w-full rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-neutral-500',
      
      // Size variants
      {
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-5 py-2.5 text-lg': size === 'lg',
      },
      
      // Style variants
      {
        'border border-neutral-300 bg-white': variant === 'default',
        'border-2 border-neutral-300 bg-neutral-100': variant === 'filled',
        'border-2 border-neutral-300 bg-transparent': variant === 'outline',
        'border border-transparent bg-neutral-100': variant === 'ghost',
      },
      
      // Error state
      {
        'border-error-500 focus:border-error-500 focus:ring-error-500/20': error,
      },
      
      // Icon padding
      {
        'pl-10': leftIcon,
        'pr-10': rightIcon || loading,
      },
      
      className
    );

    const containerClasses = cn(
      'relative w-full',
      {
        'opacity-50 cursor-not-allowed': disabled,
      }
    );

    const iconClasses = cn(
      'absolute top-1/2 -translate-y-1/2',
      'text-neutral-500',
      {
        'left-3': leftIcon,
        'right-3': rightIcon,
      }
    );

    return (
      <motion.div
        className="space-y-1"
        variants={formField}
        initial="hidden"
        animate="visible"
        {...containerMotionProps}
      >
        <div className={containerClasses}>
          {leftIcon && <span className={iconClasses}>{leftIcon}</span>}
          
          <motion.input
            ref={ref}
            type={type}
            className={baseClasses}
            disabled={disabled || loading}
            {...props}
          />
          
          {(rightIcon || loading) && (
            <span className={iconClasses}>
              {loading ? (
                <motion.div
                  className="spinner h-4 w-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ) : (
                rightIcon
              )}
            </span>
          )}
        </div>

        {(helpText || errorMessage) && (
          <motion.p
            className={cn('text-sm', {
              'text-neutral-500': helpText && !error,
              'text-error-500': error,
            })}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {error ? errorMessage : helpText}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 