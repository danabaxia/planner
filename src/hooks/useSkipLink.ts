import { useCallback } from 'react';

export interface SkipLinkTarget {
  /** The ID of the target element */
  id: string;
  /** The label for the skip link */
  label: string;
  /** Optional description of the target section */
  description?: string;
}

/**
 * Hook to manage skip links for keyboard navigation
 * @param targets Array of skip link targets
 * @returns Object containing the skip link handler and target information
 */
export const useSkipLink = (targets: SkipLinkTarget[]) => {
  /**
   * Handle skip link click
   * @param targetId The ID of the target element to focus
   */
  const handleSkip = useCallback((targetId: string) => {
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Make the target temporarily focusable if it isn't already
      const originalTabIndex = targetElement.getAttribute('tabindex');
      if (!originalTabIndex) {
        targetElement.setAttribute('tabindex', '-1');
      }

      // Focus the target
      targetElement.focus();

      // Remove the temporary tabindex
      if (!originalTabIndex) {
        targetElement.removeAttribute('tabindex');
      }

      // Scroll the target into view if it's not visible
      if (targetElement.scrollIntoView) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  return {
    handleSkip,
    targets,
  };
}; 