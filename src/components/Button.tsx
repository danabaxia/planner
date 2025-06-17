'use client';

import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { buttonHover, buttonPulse } from '@/utils/animations';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  pulse?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  'aria-label'?: string;
  motionProps?: Omit<MotionProps, 'children'>;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      pulse = false,
      disabled,
      onClick,
      type = 'button',
      motionProps,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      // Base button styles
      'btn',
      'inline-flex items-center justify-center gap-2',
      'rounded-lg font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'relative overflow-hidden',
      
      // Size variants
      {
        'btn-sm px-3 py-1.5 text-sm': size === 'sm',
        'btn-md px-4 py-2 text-base': size === 'md',
        'btn-lg px-6 py-3 text-lg': size === 'lg',
      },
      
      // Variant styles
      {
        'btn-primary bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md':
          variant === 'primary',
        'btn-secondary bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 border border-secondary-200':
          variant === 'secondary',
        'btn-outline border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100':
          variant === 'outline',
        'btn-ghost text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200':
          variant === 'ghost',
        'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 shadow-sm hover:shadow-md':
          variant === 'destructive',
      },
      
      className
    );

    const MotionButton = motion.button;

    const defaultMotionProps = {
      variants: pulse ? buttonPulse : buttonHover,
      initial: 'rest',
      whileHover: pulse ? 'pulse' : 'hover',
      whileTap: 'tap',
      ...motionProps,
    };

    return (
      <MotionButton
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        onClick={onClick}
        type={type}
        {...defaultMotionProps}
        {...props}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-inherit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="spinner h-4 w-4" />
          </motion.div>
        )}
        
        <motion.span
          className={cn('flex items-center gap-2', {
            'opacity-0': loading,
          })}
          initial={{ opacity: 1 }}
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';

export { Button };

// Icon Button variant
export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'md', ...props }, ref) => {
    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'aspect-square p-0',
          {
            'h-8 w-8': size === 'sm',
            'h-10 w-10': size === 'md',
            'h-12 w-12': size === 'lg',
          },
          className
        )}
        size={size}
        {...props}
      >
        <span className={iconSizes[size]}>{icon}</span>
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Button Group component
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: ButtonProps['variant'];
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  size,
  variant,
}) => {
  return (
    <div
      className={cn(
        'flex',
        {
          'flex-row': orientation === 'horizontal',
          'flex-col': orientation === 'vertical',
        },
        className
      )}
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === Button) {
          return React.cloneElement(child as React.ReactElement<ButtonProps>, {
            size: size || child.props.size,
            variant: variant || child.props.variant,
            className: cn(
              child.props.className,
              {
                // Horizontal grouping
                'rounded-l-none': orientation === 'horizontal' && index > 0,
                'rounded-r-none':
                  orientation === 'horizontal' &&
                  index < React.Children.count(children) - 1,
                'border-l-0':
                  orientation === 'horizontal' &&
                  index > 0 &&
                  (variant === 'outline' || child.props.variant === 'outline'),
                
                // Vertical grouping
                'rounded-t-none': orientation === 'vertical' && index > 0,
                'rounded-b-none':
                  orientation === 'vertical' &&
                  index < React.Children.count(children) - 1,
                'border-t-0':
                  orientation === 'vertical' &&
                  index > 0 &&
                  (variant === 'outline' || child.props.variant === 'outline'),
              }
            ),
          });
        }
        return child;
      })}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';
