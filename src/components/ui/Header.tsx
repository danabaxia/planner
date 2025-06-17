'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export type HeaderVariant = 'default' | 'sticky' | 'fixed' | 'transparent';
export type HeaderSize = 'sm' | 'md' | 'lg';

export interface HeaderProps {
  variant?: HeaderVariant;
  size?: HeaderSize;
  logo?: React.ReactNode;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  mobileMenuButton?: boolean;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const variantClasses = {
  default: 'bg-white border-b border-neutral-200',
  sticky: 'sticky top-0 bg-white/95 backdrop-blur-sm border-b border-neutral-200 z-40',
  fixed: 'fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-neutral-200 z-40',
  transparent: 'bg-transparent',
};

const sizeClasses = {
  sm: 'h-14',
  md: 'h-16',
  lg: 'h-20',
};

export const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  size = 'md',
  logo,
  navigation,
  actions,
  mobileMenuButton = true,
  onMobileMenuToggle,
  isMobileMenuOpen = false,
  className,
  children,
}) => {
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  
  const isMobileMenuOpenState = onMobileMenuToggle ? isMobileMenuOpen : internalMobileMenuOpen;
  
  const handleMobileMenuToggle = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    } else {
      setInternalMobileMenuOpen(!internalMobileMenuOpen);
    }
  };

  return (
    <header
      className={cn(
        'w-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          {logo && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}

          {/* Desktop Navigation */}
          {navigation && (
            <nav className="hidden md:flex items-center space-x-8">
              {navigation}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            {actions && (
              <div className="hidden sm:flex items-center gap-4">
                {actions}
              </div>
            )}

            {/* Mobile Menu Button */}
            {mobileMenuButton && (
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors duration-200"
                onClick={handleMobileMenuToggle}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpenState}
              >
                <motion.div
                  animate={isMobileMenuOpenState ? 'open' : 'closed'}
                  className="w-6 h-6 relative"
                >
                  <motion.span
                    className="absolute block h-0.5 w-6 bg-current transform"
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: 45, y: 8 },
                    }}
                    style={{ top: '6px' }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="absolute block h-0.5 w-6 bg-current transform"
                    variants={{
                      closed: { opacity: 1 },
                      open: { opacity: 0 },
                    }}
                    style={{ top: '12px' }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="absolute block h-0.5 w-6 bg-current transform"
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: -45, y: -8 },
                    }}
                    style={{ top: '18px' }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {navigation && (
          <motion.div
            className="md:hidden"
            initial={false}
            animate={isMobileMenuOpenState ? 'open' : 'closed'}
            variants={{
              open: {
                height: 'auto',
                opacity: 1,
                transition: {
                  height: { duration: 0.3 },
                  opacity: { duration: 0.2, delay: 0.1 },
                },
              },
              closed: {
                height: 0,
                opacity: 0,
                transition: {
                  height: { duration: 0.3, delay: 0.1 },
                  opacity: { duration: 0.2 },
                },
              },
            }}
            style={{ overflow: 'hidden' }}
          >
            <nav className="py-4 space-y-2 border-t border-neutral-200">
              {navigation}
              {/* Mobile Actions */}
              {actions && (
                <div className="pt-4 border-t border-neutral-200 space-y-2">
                  {actions}
                </div>
              )}
            </nav>
          </motion.div>
        )}

        {/* Custom children content */}
        {children}
      </div>
    </header>
  );
};

// Header Logo component
export interface HeaderLogoProps {
  src?: string;
  alt?: string;
  text?: string;
  href?: string;
  className?: string;
  onClick?: () => void;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  src,
  alt,
  text,
  href,
  className,
  onClick,
}) => {
  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      {src && (
        <img
          src={src}
          alt={alt || 'Logo'}
          className="h-8 w-auto"
        />
      )}
      {text && (
        <span className="text-xl font-bold text-neutral-900">
          {text}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className="block">
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block">
        {content}
      </button>
    );
  }

  return content;
};

// Header Navigation Item component
export interface HeaderNavItemProps {
  href?: string;
  label: string;
  isActive?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
  className?: string;
}

export const HeaderNavItem: React.FC<HeaderNavItemProps> = ({
  href,
  label,
  isActive = false,
  isMobile = false,
  onClick,
  className,
}) => {
  const baseClasses = cn(
    'font-medium transition-colors duration-200',
    {
      // Desktop styles
      'text-primary-600': isActive && !isMobile,
      'text-neutral-700 hover:text-neutral-900': !isActive && !isMobile,
      // Mobile styles
      'block px-3 py-2 rounded-md text-base': isMobile,
      'bg-primary-100 text-primary-900': isActive && isMobile,
      'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900': !isActive && isMobile,
    },
    className
  );

  if (href) {
    return (
      <a href={href} className={baseClasses} onClick={onClick}>
        {label}
      </a>
    );
  }

  return (
    <button type="button" className={baseClasses} onClick={onClick}>
      {label}
    </button>
  );
};

// Header Actions component for grouping action items
export interface HeaderActionsProps {
  className?: string;
  children: React.ReactNode;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ className, children }) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
    </div>
  );
};

// Breadcrumb component for header navigation
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface HeaderBreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const HeaderBreadcrumb: React.FC<HeaderBreadcrumbProps> = ({
  items,
  separator = (
    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  className,
}) => {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="flex-shrink-0">
              {separator}
            </span>
          )}
          {item.href ? (
            <a
              href={item.href}
              onClick={item.onClick}
              className={cn(
                'transition-colors duration-200',
                index === items.length - 1
                  ? 'text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {item.label}
            </a>
          ) : (
            <button
              type="button"
              onClick={item.onClick}
              className={cn(
                'transition-colors duration-200',
                index === items.length - 1
                  ? 'text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}; 