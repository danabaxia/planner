'use client';

import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export type MenuPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'right' | 'right-start' | 'right-end' | 'left' | 'left-start' | 'left-end';

export interface MenuItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  submenu?: MenuItem[];
}

export interface MenuProps extends Omit<HTMLMotionProps<'div'>, 'children' | 'onSelect'> {
  /** Menu trigger element */
  trigger: React.ReactNode;
  /** Menu items */
  items: MenuItem[];
  /** Menu placement */
  placement?: MenuPlacement;
  /** Whether the menu is open */
  open?: boolean;
  /** Callback when menu open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether to close on item select */
  closeOnSelect?: boolean;
  /** Callback when an item is selected */
  onSelect?: (value: string) => void;
  /** Additional motion props for the menu container */
  menuMotionProps?: Omit<HTMLMotionProps<'div'>, 'children'>;
}

const menuVariants = {
  hidden: (placement: MenuPlacement) => {
    const transforms: Record<MenuPlacement, string> = {
      'top': 'translateY(8px)',
      'top-start': 'translateY(8px)',
      'top-end': 'translateY(8px)',
      'bottom': 'translateY(-8px)',
      'bottom-start': 'translateY(-8px)',
      'bottom-end': 'translateY(-8px)',
      'left': 'translateX(8px)',
      'left-start': 'translateX(8px)',
      'left-end': 'translateX(8px)',
      'right': 'translateX(-8px)',
      'right-start': 'translateX(-8px)',
      'right-end': 'translateX(-8px)',
    };
    return {
      opacity: 0,
      transform: transforms[placement],
    };
  },
  visible: {
    opacity: 1,
    transform: 'translate(0)',
  },
};

const Menu = forwardRef<HTMLDivElement, MenuProps>(
  (
    {
      className,
      trigger,
      items,
      placement = 'bottom-start',
      open: controlledOpen,
      onOpenChange,
      closeOnSelect = true,
      onSelect,
      menuMotionProps,
      ...props
    },
    ref
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    const isOpen = controlledOpen ?? uncontrolledOpen;
    const setIsOpen = useCallback((value: boolean) => {
      setUncontrolledOpen(value);
      onOpenChange?.(value);
    }, [onOpenChange]);

    const updatePosition = useCallback(() => {
      if (!triggerRef.current || !menuRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      // Calculate position based on placement
      switch (placement) {
        case 'top':
        case 'top-start':
        case 'top-end':
          top = triggerRect.top - menuRect.height - 8;
          break;
        case 'bottom':
        case 'bottom-start':
        case 'bottom-end':
          top = triggerRect.bottom + 8;
          break;
        case 'left':
        case 'left-start':
        case 'left-end':
          left = triggerRect.left - menuRect.width - 8;
          break;
        case 'right':
        case 'right-start':
        case 'right-end':
          left = triggerRect.right + 8;
          break;
      }

      // Adjust horizontal position
      switch (placement) {
        case 'top':
        case 'bottom':
          left = triggerRect.left + (triggerRect.width - menuRect.width) / 2;
          break;
        case 'top-start':
        case 'bottom-start':
          left = triggerRect.left;
          break;
        case 'top-end':
        case 'bottom-end':
          left = triggerRect.right - menuRect.width;
          break;
        case 'left':
        case 'right':
          top = triggerRect.top + (triggerRect.height - menuRect.height) / 2;
          break;
        case 'left-start':
        case 'right-start':
          top = triggerRect.top;
          break;
        case 'left-end':
        case 'right-end':
          top = triggerRect.bottom - menuRect.height;
          break;
      }

      // Prevent menu from going outside viewport
      top = Math.max(8, Math.min(top, viewportHeight - menuRect.height - 8));
      left = Math.max(8, Math.min(left, viewportWidth - menuRect.width - 8));

      setPosition({ top, left });
    }, [placement]);

    useEffect(() => {
      if (isOpen) {
        updatePosition();
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('resize', updatePosition);
      }

      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }, [isOpen, updatePosition]);

    const handleItemClick = (item: MenuItem) => {
      if (item.disabled) return;

      if (item.submenu) {
        setActiveSubmenu(activeSubmenu === item.value ? null : item.value);
      } else {
        onSelect?.(item.value);
        if (closeOnSelect) {
          setIsOpen(false);
          setActiveSubmenu(null);
        }
      }
    };

    const handleClickOutside = useCallback((event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    }, [setIsOpen]);

    useEffect(() => {
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, handleClickOutside]);

    const renderMenuItem = (item: MenuItem, index: number) => (
      <motion.li
        key={item.value}
        className={cn(
          'relative flex items-center gap-2 px-4 py-2',
          'cursor-pointer select-none rounded-md',
          'transition-colors duration-200',
          {
            'opacity-50 cursor-not-allowed': item.disabled,
            'text-error-600 hover:bg-error-50': item.danger && !item.disabled,
            'hover:bg-neutral-100': !item.danger && !item.disabled,
          }
        )}
        onClick={() => handleItemClick(item)}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        {item.icon && (
          <span className={cn('text-neutral-500', { 'text-error-500': item.danger })}>
            {item.icon}
          </span>
        )}
        <span className="flex-1">{item.label}</span>
        {item.submenu && (
          <ChevronRight className="h-4 w-4 text-neutral-400" />
        )}

        {/* Submenu */}
        {item.submenu && activeSubmenu === item.value && (
          <motion.ul
            className={cn(
              'absolute top-0 left-full ml-2',
              'min-w-[180px] py-1',
              'bg-white rounded-md shadow-lg',
              'border border-neutral-200',
              'z-50'
            )}
            initial="hidden"
            animate="visible"
            variants={menuVariants}
            custom={placement}
          >
            {item.submenu.map((subitem, subindex) =>
              renderMenuItem(subitem, subindex)
            )}
          </motion.ul>
        )}
      </motion.li>
    );

    return (
      <>
        <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>

        {typeof window !== 'undefined' &&
          createPortal(
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  ref={menuRef}
                  className={cn(
                    'fixed z-50',
                    'min-w-[180px] py-1',
                    'bg-white rounded-md shadow-lg',
                    'border border-neutral-200',
                    className
                  )}
                  style={{
                    top: position.top,
                    left: position.left,
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={menuVariants}
                  custom={placement}
                  {...menuMotionProps}
                  {...props}
                >
                  <motion.ul>
                    {items.map((item, index) => renderMenuItem(item, index))}
                  </motion.ul>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
      </>
    );
  }
);

Menu.displayName = 'Menu';

export { Menu }; 