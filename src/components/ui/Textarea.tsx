'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formField } from '@/utils/animations';

export interface TextareaProps extends Omit<HTMLMotionProps<'textarea'>, 'size'> {
  /** Textarea size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Textarea style variant */
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Help text */
  helpText?: string;
  /** Auto resize height based on content */
  autoResize?: boolean;
  /** Maximum height when auto-resizing (in pixels) */
  maxHeight?: number;
  /** Additional motion props for the container */
  containerMotionProps?: Omit<HTMLMotionProps<'div'>, 'children'>;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      error,
      errorMessage,
      helpText,
      autoResize,
      maxHeight,
      disabled,
      containerMotionProps,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const combinedRef = React.useMemo(
      () => (node: HTMLTextAreaElement) => {
        textareaRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;

      textarea.style.height = 'auto';
      const newHeight = Math.min(
        textarea.scrollHeight,
        maxHeight || Number.MAX_SAFE_INTEGER
      );
      textarea.style.height = `${newHeight}px`;
    }, [autoResize, maxHeight]);

    React.useEffect(() => {
      if (autoResize) {
        adjustHeight();
        window.addEventListener('resize', adjustHeight);
        return () => window.removeEventListener('resize', adjustHeight);
      }
    }, [autoResize, adjustHeight]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        adjustHeight();
      }
      onChange?.(event);
    };

    const baseClasses = cn(
      // Base styles
      'input',
      'w-full rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-neutral-500',
      'resize-none',
      
      // Size variants
      {
        'px-3 py-1.5 text-sm min-h-[80px]': size === 'sm',
        'px-4 py-2 text-base min-h-[100px]': size === 'md',
        'px-5 py-2.5 text-lg min-h-[120px]': size === 'lg',
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
          <motion.textarea
            ref={combinedRef}
            className={baseClasses}
            disabled={disabled}
            onChange={handleChange}
            style={
              maxHeight
                ? {
                    maxHeight: `${maxHeight}px`,
                    overflowY: 'auto',
                  }
                : undefined
            }
            {...props}
          />
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

Textarea.displayName = 'Textarea';

export { Textarea }; 