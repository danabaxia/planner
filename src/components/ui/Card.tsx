'use client';

import { cn } from '@/utils/cn'
import { ReactNode, forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { scaleIn, fadeIn } from '@/utils/animations'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  animated?: boolean
  onClick?: () => void
  motionProps?: Omit<MotionProps, 'children'>
}

const cardHoverVariants = {
  rest: { scale: 1, y: 0, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' },
  hover: { 
    scale: 1.02, 
    y: -2, 
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    }
  },
  tap: { scale: 0.98 }
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className,
  variant = 'default',
  padding = 'md',
  interactive = false,
  animated = true,
  onClick,
  motionProps,
  ...props
}, ref) => {
  const baseClasses = cn(
    'rounded-xl border border-border bg-card text-card-foreground transition-all duration-200',
    {
      'shadow-sm': variant === 'default',
      'shadow-lg': variant === 'elevated',
      'border-2': variant === 'outlined',
      'p-0': padding === 'none',
      'p-4': padding === 'sm',
      'p-6': padding === 'md',
      'p-8': padding === 'lg',
      'cursor-pointer hover:shadow-md': interactive,
    },
    className
  )

  const defaultMotionProps = {
    variants: animated ? (interactive ? cardHoverVariants : scaleIn) : undefined,
    initial: animated ? (interactive ? 'rest' : 'hidden') : undefined,
    animate: animated ? (interactive ? 'rest' : 'visible') : undefined,
    whileHover: animated && interactive ? 'hover' : undefined,
    whileTap: animated && interactive ? 'tap' : undefined,
    layout: true,
    ...motionProps,
  }

  if (animated) {
    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        onClick={onClick}
        {...defaultMotionProps}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      ref={ref}
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

interface CardHeaderProps {
  children: ReactNode
  className?: string
  animated?: boolean
}

export function CardHeader({ children, className, animated = true }: CardHeaderProps) {
  const content = (
    <div className={cn('flex flex-col space-y-1.5 pb-6', className)}>
      {children}
    </div>
  )

  if (animated) {
    return (
      <motion.div
        className={cn('flex flex-col space-y-1.5 pb-6', className)}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        {children}
      </motion.div>
    )
  }

  return content
}

interface CardTitleProps {
  children: ReactNode
  className?: string
  animated?: boolean
}

export function CardTitle({ children, className, animated = true }: CardTitleProps) {
  const content = (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
    >
      {children}
    </h3>
  )

  if (animated) {
    return (
      <motion.h3
        className={cn(
          'text-lg font-semibold leading-none tracking-tight',
          className
        )}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.15 }}
      >
        {children}
      </motion.h3>
    )
  }

  return content
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
  animated?: boolean
}

export function CardDescription({ children, className, animated = true }: CardDescriptionProps) {
  const content = (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  )

  if (animated) {
    return (
      <motion.p
        className={cn('text-sm text-muted-foreground', className)}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        {children}
      </motion.p>
    )
  }

  return content
}

interface CardContentProps {
  children: ReactNode
  className?: string
  animated?: boolean
}

export function CardContent({ children, className, animated = true }: CardContentProps) {
  const content = <div className={cn('pt-0', className)}>{children}</div>

  if (animated) {
    return (
      <motion.div
        className={cn('pt-0', className)}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.25 }}
      >
        {children}
      </motion.div>
    )
  }

  return content
}

interface CardFooterProps {
  children: ReactNode
  className?: string
  animated?: boolean
}

export function CardFooter({ children, className, animated = true }: CardFooterProps) {
  const content = (
    <div className={cn('flex items-center pt-6', className)}>{children}</div>
  )

  if (animated) {
    return (
      <motion.div
        className={cn('flex items-center pt-6', className)}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        {children}
      </motion.div>
    )
  }

  return content
}
