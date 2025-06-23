'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formField } from '@/utils/animations';

export interface CheckboxProps extends Omit<HTMLMotionProps<'input'>, 'size' | 'type' | 'onChange'> {
  /** Checkbox size variant */
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
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Checked state */
  checked?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Additional motion props for the container */
  containerMotionProps?: Omit<HTMLMotionProps<'div'>, 'children'>;
}

const checkVariants = {
  unchecked: {
    opacity: 0,
    pathLength: 0,
  },
  checked: {
    opacity: 1,
    pathLength: 1,
  },
};

const indeterminateVariants = {
  unchecked: {
    opacity: 0,
    scaleX: 0,
  },
  checked: {
    opacity: 1,
    scaleX: 1,
  },
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      size = 'md',
      label,
      description,
      error,
      errorMessage,
      helpText,
      indeterminate,
      checked,
      onChange,
      disabled,
      containerMotionProps,
      ...props
    },
    ref
  ) => {
    const checkboxRef = React.useRef<HTMLInputElement | null>(null);
    const combinedRef = React.useMemo(
      () => (node: HTMLInputElement) => {
        checkboxRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate || false;
      }
    }, [indeterminate]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.checked);
    };

    const checkboxSize = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }[size];

    const labelSize = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    }[size];

    const baseClasses = cn(
      // Base styles
      'relative appearance-none rounded border transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
      'disabled:cursor-not-allowed disabled:opacity-50',
      checkboxSize,
      
      // Style variants
      {
        'border-neutral-300 bg-white': !error,
        'border-error-500': error,
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
          <div className="relative flex items-center">
            <motion.input
              ref={combinedRef}
              type="checkbox"
              className={baseClasses}
              checked={checked}
              disabled={disabled}
              onChange={handleChange}
              {...props}
            />
            
            {/* Custom checkbox icon */}
            <div
              className={cn(
                'pointer-events-none absolute inset-0 flex items-center justify-center',
                {
                  'text-primary-600': !error && checked,
                  'text-error-500': error && checked,
                }
              )}
            >
              {indeterminate ? (
                <motion.div
                  className="h-[2px] w-[10px] bg-current"
                  initial="unchecked"
                  animate={checked ? 'checked' : 'unchecked'}
                  variants={indeterminateVariants}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <motion.svg
                  className="h-[65%] w-[65%]"
                  viewBox="0 0 24 24"
                  fill="none"
                  initial="unchecked"
                  animate={checked ? 'checked' : 'unchecked'}
                >
                  <motion.path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={checkVariants}
                    transition={{ duration: 0.2 }}
                  />
                </motion.svg>
              )}
            </div>
          </div>

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

Checkbox.displayName = 'Checkbox';

export { Checkbox }; 