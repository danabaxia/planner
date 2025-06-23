import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  isActive: boolean;
  /** Whether to auto-focus the first focusable element when activated */
  autoFocus?: boolean;
  /** Whether to restore focus to the previously focused element when deactivated */
  restoreFocus?: boolean;
}

/**
 * Hook to trap focus within a container element
 * @param options Focus trap options
 * @returns Object containing ref to attach to the container and methods to manage focus
 */
export const useFocusTrap = <T extends HTMLElement>({
  isActive,
  autoFocus = true,
  restoreFocus = true,
}: UseFocusTrapOptions) => {
  const containerRef = useRef<T | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      // Check if the element is actually focusable (visible and not disabled)
      return (
        element.offsetParent !== null && // Element is visible
        !element.hasAttribute('disabled') && // Element is not disabled
        !element.hasAttribute('aria-hidden') // Element is not aria-hidden
      );
    });
  }, []);

  // Focus the first focusable element
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else if (containerRef.current) {
      // If no focusable elements, focus the container itself
      containerRef.current.focus();
    }
  }, [getFocusableElements]);

  // Handle tab key navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive || event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      const handleBackwardTab = () => {
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      };

      const handleForwardTab = () => {
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      };

      if (event.shiftKey) {
        handleBackwardTab();
      } else {
        handleForwardTab();
      }
    },
    [isActive, getFocusableElements]
  );

  // Set up focus trap when activated
  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Auto-focus the first focusable element if enabled
    if (autoFocus) {
      focusFirstElement();
    }

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus when deactivated if enabled
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, autoFocus, restoreFocus, handleKeyDown, focusFirstElement]);

  return {
    containerRef,
    focusFirstElement,
    getFocusableElements,
  };
}; 