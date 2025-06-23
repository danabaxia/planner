'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formField } from '@/utils/animations';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<HTMLMotionProps<'select'>, 'size' | 'value' | 'onChange'> {
  /** Select size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Select style variant */
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Help text */
  helpText?: string;
  /** Options to display */
  options: SelectOption[];
  /** Selected value(s) */
  value?: string | string[];
  /** Multiple selection mode */
  multiple?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Change handler */
  onChange?: (value: string | string[]) => void;
  /** Additional motion props for the container */
  containerMotionProps?: Omit<HTMLMotionProps<'div'>, 'children'>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      error,
      errorMessage,
      helpText,
      options,
      value,
      multiple,
      placeholder,
      onChange,
      disabled,
      containerMotionProps,
      ...props
    },
    ref
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (!onChange) return;

      if (multiple) {
        const selectedOptions = Array.from(event.target.selectedOptions).map(
          option => option.value
        );
        onChange(selectedOptions);
      } else {
        onChange(event.target.value);
      }
    };

    const baseClasses = cn(
      // Base styles
      'input',
      'w-full rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'appearance-none bg-no-repeat bg-right',
      '[background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg width=\'24\' height=\'24\' fill=\'none\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M7 10l5 5 5-5\' stroke=\'%236B7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")]',
      '[background-size:1.5em_1.5em]',
      multiple && '[background-image:none]',
      
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
      
      // Multiple select styles
      {
        'h-auto': multiple,
        '[&>option]:py-1': multiple,
      },
      
      className
    );

    const containerClasses = cn(
      'relative w-full',
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
          <motion.select
            ref={ref}
            className={baseClasses}
            value={value}
            multiple={multiple}
            disabled={disabled}
            onChange={handleChange}
            {...props}
          >
            {placeholder && !multiple && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </motion.select>
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

Select.displayName = 'Select';

export { Select }; 