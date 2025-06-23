'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps, MotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formField } from '@/utils/animations';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

type MotionDivProps = Omit<HTMLMotionProps<'div'>, 'onChange' | 'children'>;

export interface TabsProps extends MotionDivProps {
  /** List of tab items */
  items: TabItem[];
  /** Currently active tab ID */
  activeId?: string;
  /** Change handler */
  onChange?: (id: string) => void;
  /** Tab size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Tab style variant */
  variant?: 'default' | 'pills' | 'underline';
  /** Full width tabs */
  fullWidth?: boolean;
  /** Additional motion props for the container */
  containerMotionProps?: Omit<HTMLMotionProps<'div'>, 'children'>;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      items,
      activeId,
      onChange,
      size = 'md',
      variant = 'default',
      fullWidth,
      containerMotionProps,
      ...props
    },
    ref
  ) => {
    const [selectedId, setSelectedId] = React.useState(activeId || items[0]?.id);
    const tabsRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (activeId) {
        setSelectedId(activeId);
      }
    }, [activeId]);

    const handleChange = (id: string) => {
      setSelectedId(id);
      onChange?.(id);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = items.findIndex(item => item.id === selectedId);
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case 'ArrowRight':
          event.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = items.length - 1;
          break;
        default:
          return;
      }

      const newId = items[newIndex]?.id;
      if (newId && !items[newIndex].disabled) {
        handleChange(newId);
      }
    };

    const tabSize = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-2.5 text-lg',
    }[size];

    const tabListClasses = cn(
      'flex relative',
      {
        'w-full': fullWidth,
        'gap-1': variant === 'pills',
        'border-b border-neutral-200': variant === 'default' || variant === 'underline',
      },
      className
    );

    const tabClasses = (isSelected: boolean, isDisabled: boolean) =>
      cn(
        // Base styles
        'relative flex items-center justify-center transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        tabSize,
        
        // Full width
        {
          'flex-1': fullWidth,
        },
        
        // Style variants
        {
          // Default variant
          'border-b-2 -mb-px': variant === 'default',
          'border-transparent hover:border-neutral-300': variant === 'default' && !isSelected && !isDisabled,
          'border-primary-500 text-primary-600': variant === 'default' && isSelected && !isDisabled,
          
          // Pills variant
          'rounded-lg': variant === 'pills',
          'hover:bg-neutral-100': variant === 'pills' && !isSelected && !isDisabled,
          'bg-primary-500 text-white': variant === 'pills' && isSelected && !isDisabled,
          
          // Underline variant
          'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:transition-all after:duration-200':
            variant === 'underline',
          'after:bg-transparent hover:after:bg-neutral-300': variant === 'underline' && !isSelected && !isDisabled,
          'after:bg-primary-500 text-primary-600': variant === 'underline' && isSelected && !isDisabled,
        }
      );

    const selectedTab = items.find(item => item.id === selectedId);

    return (
      <motion.div
        ref={ref}
        className="space-y-4"
        variants={formField}
        initial="hidden"
        animate="visible"
        {...containerMotionProps}
        {...props}
      >
        <div
          ref={tabsRef}
          role="tablist"
          className={tabListClasses}
          onKeyDown={handleKeyDown}
        >
          {items.map(item => (
            <motion.button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={selectedId === item.id}
              aria-controls={`panel-${item.id}`}
              id={`tab-${item.id}`}
              tabIndex={selectedId === item.id ? 0 : -1}
              className={tabClasses(selectedId === item.id, !!item.disabled)}
              onClick={() => !item.disabled && handleChange(item.id)}
              disabled={item.disabled}
              whileTap={!item.disabled ? { scale: 0.98 } : undefined}
            >
              {item.label}
            </motion.button>
          ))}
        </div>

        <motion.div
          role="tabpanel"
          id={`panel-${selectedId}`}
          aria-labelledby={`tab-${selectedId}`}
          tabIndex={0}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {selectedTab?.content}
        </motion.div>
      </motion.div>
    );
  }
);

Tabs.displayName = 'Tabs';

export { Tabs }; 