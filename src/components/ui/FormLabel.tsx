'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formField } from '@/utils/animations';

export interface FormLabelProps extends Omit<HTMLMotionProps<'label'>, 'children'> {
  /** Label text */
  children: React.ReactNode;
  /** Error state */
  error?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** Additional description text */
  description?: string;
  /** Additional motion props for the container */
  containerMotionProps?: Omit<HTMLMotionProps<'div'>, 'children'>;
}

const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  (
    {
      className,
      children,
      error,
      required,
      description,
      containerMotionProps,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        className="flex flex-col gap-0.5"
        variants={formField}
        initial="hidden"
        animate="visible"
        {...containerMotionProps}
      >
        <motion.label
          ref={ref}
          className={cn(
            'text-sm font-medium',
            {
              'text-error-500': error,
            },
            className
          )}
          {...props}
        >
          {children}
          {required && (
            <span className="ml-1 text-error-500" aria-hidden="true">
              *
            </span>
          )}
        </motion.label>
        {description && (
          <span className="text-sm text-neutral-500">{description}</span>
        )}
      </motion.div>
    );
  }
);

FormLabel.displayName = 'FormLabel';

export { FormLabel }; 