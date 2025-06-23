'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formField } from '@/utils/animations';

export interface SwitchProps extends Omit<HTMLMotionProps<'button'>, 'onChange'> {
  /** Switch size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Label text */
  label?: string;
  /** Description text */
  description?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Help text */
  helpText?: string;
  /** Checked state */
  checked?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Additional motion props for the container */
  containerMotionProps?: Omit<HTMLMotionProps<'div'>, 'children'>;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      size = 'md',
      label,
      description,
      error,
      errorMessage,
      helpText,
      checked,
      onChange,
      disabled,
      containerMotionProps,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (!disabled) {
        onChange?.(!checked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleClick();
      }
    };

    const switchSize = {
      sm: {
        container: 'h-5 w-9',
        thumb: 'h-3.5 w-3.5',
        translate: 'translate-x-4',
      },
      md: {
        container: 'h-6 w-11',
        thumb: 'h-4.5 w-4.5',
        translate: 'translate-x-5',
      },
      lg: {
        container: 'h-7 w-[52px]',
        thumb: 'h-5.5 w-5.5',
        translate: 'translate-x-6',
      },
    }[size];

    const labelSize = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    }[size];

    const baseClasses = cn(
      // Base styles
      'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
      'disabled:cursor-not-allowed disabled:opacity-50',
      switchSize.container,
      
      // Style variants
      {
        'bg-primary-600': checked && !error,
        'bg-neutral-200': !checked && !error,
        'bg-error-500': error,
      },
      
      className
    );

    const containerClasses = cn(
      'relative flex items-start gap-2',
      {
        'opacity-50 cursor-not-allowed': disabled,
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
          <motion.button
            ref={ref}
            role="switch"
            type="button"
            aria-checked={checked}
            className={baseClasses}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            {...props}
          >
            <span className="sr-only">
              {label || (checked ? 'Enable' : 'Disable')}
            </span>
            <motion.span
              className={cn(
                'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
                switchSize.thumb
              )}
              initial={false}
              animate={{
                x: checked ? switchSize.translate.split('-')[1] : '2px',
              }}
            />
          </motion.button>

          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className={cn('font-medium', labelSize)}>{label}</span>
              )}
              {description && (
                <span className="text-sm text-neutral-500">{description}</span>
              )}
            </div>
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

Switch.displayName = 'Switch';

export { Switch }; 