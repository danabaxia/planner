'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { createReducedMotionVariants } from '@/animations/reducedMotion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useAnnouncer } from '@/hooks/useAnnouncer';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useFocusVisible } from '@/hooks/useFocusVisible';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'screen-sm' | 'screen-md' | 'full';
export type ModalVariant = 'default' | 'fade' | 'scale' | 'slide';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  variant?: ModalVariant;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  className?: string;
  backdropClassName?: string;
  children: React.ReactNode;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const sizeClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};

const variantClasses = {
  default: 'mx-4 my-8',
  centered: 'mx-4',
  drawer: 'ml-auto mr-0 my-0 h-full',
  fullscreen: 'mx-0 my-0 h-full w-full',
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  default: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
  },
  centered: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  drawer: {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' },
  },
  fullscreen: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  size = 'md',
  variant = 'default',
  title,
  description,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventScroll = true,
  className,
  backdropClassName,
  children,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { containerRef, focusFirstElement } = useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    autoFocus: true,
    restoreFocus: true,
  });
  const { announce } = useAnnouncer();
  const { focusVisible, getFocusRingClass } = useFocusVisible();

  // Handle keyboard shortcuts
  useKeyboardShortcut(
    (event: KeyboardEvent) => {
      onClose();
    },
    {
      key: 'Escape',
      enabled: isOpen,
      description: 'Close modal',
      preventDefault: true,
      stopPropagation: true,
    }
  );

  // Announce modal state changes to screen readers
  useEffect(() => {
    if (isOpen) {
      announce(`${title} dialog opened. ${description || ''}`);
      focusFirstElement();
    } else {
      announce('Dialog closed');
    }
  }, [isOpen, title, description, announce, focusFirstElement]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle click outside
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const getModalClasses = () => {
    const baseClasses = 'bg-white rounded-lg shadow-xl relative';
    const sizeClasses = {
      sm: 'max-w-sm w-full',
      md: 'max-w-md w-full',
      lg: 'max-w-lg w-full',
      xl: 'max-w-xl w-full',
      '2xl': 'max-w-2xl w-full',
      'screen-sm': 'max-w-screen-sm w-full',
      'screen-md': 'max-w-screen-md w-full',
      full: 'w-screen h-screen',
    }[size];

    return cn(baseClasses, sizeClasses, className);
  };

  const getContainerClasses = () => {
    return cn(
      'fixed inset-0 z-50 flex items-center justify-center p-4',
      backdropClassName
    );
  };

  // Define animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    default: {
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 20, scale: 0.95 },
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    slide: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
    },
  };

  // Create reduced motion variants
  const reducedBackdropVariants = createReducedMotionVariants({
    variants: backdropVariants,
    transition: { duration: 0.1 },
  });

  const reducedModalVariants = createReducedMotionVariants({
    variants: modalVariants[variant],
    transition: { duration: 0.1 },
  });

  if (!isOpen) return null;

  const transitionClasses = prefersReducedMotion
    ? 'opacity-0 opacity-100'
    : 'opacity-0 transform scale-95 duration-200 ease-out opacity-100 scale-100';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${
          prefersReducedMotion ? '' : 'duration-300'
        } ${backdropClassName}`}
        onClick={handleBackdropClick}
      />

      {/* Modal Content */}
      <div
        ref={containerRef}
        className={`relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl transition ${transitionClasses} ${getModalClasses()}`}
        tabIndex={-1}
      >
        <h2 id="modal-title" className="text-xl font-semibold">
          {title}
        </h2>
        {description && (
          <p id="modal-description" className="sr-only">
            {description}
          </p>
        )}
        <div className="mt-4">{children}</div>
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 rounded p-2 text-gray-500 hover:text-gray-700 focus:outline-none ${
            focusVisible ? getFocusRingClass() : ''
          }`}
          aria-label="Close dialog"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Modal Header component for custom headers
export interface ModalHeaderProps {
  title?: string;
  description?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  description,
  onClose,
  showCloseButton = true,
  className,
  children,
}) => {
  return (
    <div className={cn('flex items-start justify-between p-6 border-b border-neutral-200', className)}>
      <div className="flex-1">
        {title && (
          <h2 className="text-lg font-semibold text-neutral-900">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-1 text-sm text-neutral-600">
            {description}
          </p>
        )}
        {children}
      </div>
      
      {showCloseButton && onClose && (
        <button
          type="button"
          className="ml-4 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          onClick={onClose}
          aria-label="Close modal"
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

// Modal Body component for content
export interface ModalBodyProps {
  className?: string;
  children: React.ReactNode;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ className, children }) => {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
};

// Modal Footer component for actions
export interface ModalFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ className, children }) => {
  return (
    <div className={cn('flex items-center justify-end gap-3 p-6 border-t border-neutral-200', className)}>
      {children}
    </div>
  );
};

// Confirmation Modal component for common confirmation dialogs
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false,
}) => {
  const variantStyles = {
    danger: {
      button: 'bg-error-600 hover:bg-error-700 text-white',
      icon: 'text-error-600',
    },
    warning: {
      button: 'bg-warning-600 hover:bg-warning-700 text-white',
      icon: 'text-warning-600',
    },
    info: {
      button: 'bg-primary-600 hover:bg-primary-700 text-white',
      icon: 'text-primary-600',
    },
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
    >
      <div className="flex items-start gap-4">
        <div className={cn('flex-shrink-0', variantStyles[variant].icon)}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm text-neutral-600">
            {message}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors duration-200"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
            variantStyles[variant].button
          )}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}; 