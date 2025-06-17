'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

export type SidebarWidth = 'sm' | 'md' | 'lg' | 'xl';
export type SidebarPosition = 'left' | 'right';
export type SidebarVariant = 'fixed' | 'overlay' | 'push';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  width?: SidebarWidth;
  position?: SidebarPosition;
  variant?: SidebarVariant;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  persistent?: boolean; // Always visible on desktop
  className?: string;
  overlayClassName?: string;
  children: React.ReactNode;
}

const widthClasses = {
  sm: 'w-64',
  md: 'w-72',
  lg: 'w-80',
  xl: 'w-96',
};

const sidebarVariants = {
  left: {
    hidden: { x: '-100%' },
    visible: { x: 0 },
    exit: { x: '-100%' },
  },
  right: {
    hidden: { x: '100%' },
    visible: { x: 0 },
    exit: { x: '100%' },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  width = 'md',
  position = 'left',
  variant = 'overlay',
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  persistent = false,
  className,
  overlayClassName,
  children,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll lock on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isMobile, isOpen]);

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  const getSidebarClasses = () => {
    return cn(
      'fixed top-0 h-full bg-white shadow-lg z-40 flex flex-col',
      widthClasses[width],
      {
        'left-0': position === 'left',
        'right-0': position === 'right',
        // Desktop persistent sidebar
        'lg:translate-x-0': persistent && !isMobile,
        'lg:relative lg:z-auto': persistent && variant === 'push',
      },
      className
    );
  };

  // For persistent desktop sidebar
  if (persistent && !isMobile) {
    return (
      <aside className={getSidebarClasses()}>
        {children}
      </aside>
    );
  }

  // For mobile or non-persistent sidebar
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              className={cn(
                'fixed inset-0 bg-black/50 backdrop-blur-sm z-30',
                overlayClassName
              )}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              onClick={handleOverlayClick}
            />
          )}

          {/* Sidebar */}
          <motion.aside
            className={getSidebarClasses()}
            variants={sidebarVariants[position]}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// Sidebar Header component
export interface SidebarHeaderProps {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  title,
  subtitle,
  onClose,
  showCloseButton = true,
  className,
  children,
}) => {
  return (
    <div className={cn('flex items-center justify-between p-6 border-b border-neutral-200', className)}>
      <div className="flex-1">
        {title && (
          <h2 className="text-lg font-semibold text-neutral-900">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-600">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      
      {showCloseButton && onClose && (
        <button
          type="button"
          className="ml-4 text-neutral-400 hover:text-neutral-600 transition-colors duration-200 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// Sidebar Body component
export interface SidebarBodyProps {
  className?: string;
  children: React.ReactNode;
}

export const SidebarBody: React.FC<SidebarBodyProps> = ({ className, children }) => {
  return (
    <div className={cn('flex-1 overflow-y-auto p-6', className)}>
      {children}
    </div>
  );
};

// Sidebar Footer component
export interface SidebarFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ className, children }) => {
  return (
    <div className={cn('p-6 border-t border-neutral-200', className)}>
      {children}
    </div>
  );
};

// Navigation Item component for sidebar navigation
export interface SidebarNavItemProps {
  href?: string;
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  badge?: string | number;
  onClick?: () => void;
  className?: string;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  href,
  icon,
  label,
  isActive = false,
  badge,
  onClick,
  className,
}) => {
  const baseClasses = cn(
    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
    {
      'bg-primary-100 text-primary-900': isActive,
      'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900': !isActive,
    },
    className
  );

  const content = (
    <>
      {icon && (
        <span className="flex-shrink-0 w-5 h-5">
          {icon}
        </span>
      )}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-neutral-200 text-neutral-800 rounded-full">
          {badge}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={baseClasses} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={baseClasses} onClick={onClick}>
      {content}
    </button>
  );
};

// Navigation Group component for organizing nav items
export interface SidebarNavGroupProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({
  title,
  className,
  children,
}) => {
  return (
    <div className={cn('space-y-1', className)}>
      {title && (
        <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {children}
      </nav>
    </div>
  );
}; 