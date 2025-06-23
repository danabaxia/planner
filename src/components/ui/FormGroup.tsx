'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formField } from '@/utils/animations';

export interface FormGroupProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** Form group label */
  label?: string;
  /** Form group description */
  description?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Help text */
  helpText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Form group content */
  children: React.ReactNode;
  /** Additional motion props for the container */
  containerMotionProps?: Omit<HTMLMotionProps<'div'>, 'children'>;
}

const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  (
    {
      className,
      label,
      description,
      error,
      errorMessage,
      helpText,
      required,
      children,
      containerMotionProps,
      ...props
    },
    ref
  ) => {
    const id = React.useId();

    return (
      <motion.div
        ref={ref}
        className={cn('space-y-1.5', className)}
        variants={formField}
        initial="hidden"
        animate="visible"
        {...containerMotionProps}
        {...props}
      >
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={id}
                className={cn('text-sm font-medium', {
                  'text-error-500': error,
                })}
              >
                {label}
                {required && (
                  <span className="ml-1 text-error-500" aria-hidden="true">
                    *
                  </span>
                )}
              </label>
            )}
            {description && (
              <span className="text-sm text-neutral-500">{description}</span>
            )}
          </div>
        )}

        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement, {
              id,
              'aria-describedby': helpText || errorMessage ? `${id}-help` : undefined,
              'aria-invalid': error,
              'aria-required': required,
            });
          }
          return child;
        })}

        {(helpText || errorMessage) && (
          <motion.p
            id={`${id}-help`}
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

FormGroup.displayName = 'FormGroup';

export { FormGroup }; 