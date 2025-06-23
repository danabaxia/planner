'use client';

import React, { forwardRef, useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps extends Omit<HTMLMotionProps<'nav'>, 'children'> {
  /** List of breadcrumb items */
  items: BreadcrumbItem[];
  /** Maximum number of visible items before collapsing */
  maxItems?: number;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional motion props for the container */
  containerMotionProps?: Omit<HTMLMotionProps<'div'>, 'children'>;
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    {
      className,
      items,
      maxItems = 4,
      showIcons = true,
      size = 'md',
      containerMotionProps,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const shouldCollapse = items.length > maxItems;
    const visibleItems = shouldCollapse && !isExpanded
      ? [
          ...items.slice(0, 1),
          ...items.slice(-2),
        ]
      : items;

    const itemSize = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    }[size];

    const separatorSize = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }[size];

    return (
      <motion.nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('w-full', className)}
        initial="hidden"
        animate="visible"
        {...containerMotionProps}
        {...props}
      >
        <motion.ol className="flex items-center flex-wrap gap-1">
          {visibleItems.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === visibleItems.length - 1;
            const showCollapse = shouldCollapse && !isExpanded && index === 1;

            if (showCollapse) {
              return (
                <motion.li
                  key="collapse"
                  className="flex items-center"
                  variants={itemVariants}
                >
                  <ChevronRight className={cn('text-neutral-400', separatorSize)} />
                  <button
                    type="button"
                    className={cn(
                      'flex items-center gap-1 p-1 rounded-md',
                      'text-neutral-500 hover:text-neutral-700',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                      itemSize
                    )}
                    onClick={() => setIsExpanded(true)}
                  >
                    <MoreHorizontal className={separatorSize} />
                    <span className="sr-only">Show all breadcrumbs</span>
                  </button>
                  <ChevronRight className={cn('text-neutral-400', separatorSize)} />
                </motion.li>
              );
            }

            return (
              <motion.li
                key={item.label}
                className="flex items-center"
                variants={itemVariants}
              >
                {!isFirst && (
                  <ChevronRight className={cn('text-neutral-400', separatorSize)} />
                )}
                {item.href ? (
                  <a
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 p-1 rounded-md',
                      'text-neutral-600 hover:text-neutral-900',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                      {
                        'font-medium': isLast,
                      },
                      itemSize
                    )}
                  >
                    {showIcons && item.icon && (
                      <span className="text-neutral-400">{item.icon}</span>
                    )}
                    {item.label}
                  </a>
                ) : (
                  <span
                    className={cn(
                      'flex items-center gap-1 p-1',
                      'text-neutral-900',
                      {
                        'font-medium': isLast,
                      },
                      itemSize
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {showIcons && item.icon && (
                      <span className="text-neutral-400">{item.icon}</span>
                    )}
                    {item.label}
                  </span>
                )}
              </motion.li>
            );
          })}
        </motion.ol>
      </motion.nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';

export { Breadcrumbs }; 