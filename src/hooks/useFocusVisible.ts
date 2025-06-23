import { useEffect, useState } from 'react';

/**
 * Hook to manage focus visibility based on input method
 * @returns Object containing focus visibility state and utility functions
 */
export const useFocusVisible = () => {
  const [hadKeyboardEvent, setHadKeyboardEvent] = useState(true);
  const [focusVisible, setFocusVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle Tab key events
      if (event.key === 'Tab') {
        setHadKeyboardEvent(true);
        setFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setHadKeyboardEvent(false);
      setFocusVisible(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Reset state when page becomes hidden
        setHadKeyboardEvent(true);
        setFocusVisible(false);
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange, true);

    // Remove event listeners on cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange, true);
    };
  }, []);

  return {
    focusVisible,
    hadKeyboardEvent,
    /**
     * Get props to apply to focusable elements
     */
    getFocusProps: () => ({
      'data-focus-visible': focusVisible,
    }),
    /**
     * Get focus ring classes based on focus visibility
     */
    getFocusRingClass: () => 
      focusVisible ? 'focus-visible:ring-2 focus-visible:ring-primary-500' : '',
  };
}; 