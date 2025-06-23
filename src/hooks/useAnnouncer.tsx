import React, { useCallback, useEffect, useRef } from 'react';

type AriaLive = 'off' | 'polite' | 'assertive';

interface UseAnnouncerOptions {
  /** The ARIA live setting for the announcer */
  ariaLive?: AriaLive;
  /** The maximum time (in ms) to wait before removing the announcement */
  clearTime?: number;
  /** Whether to clear the announcement after clearTime */
  shouldClear?: boolean;
}

/**
 * Hook to manage ARIA live announcements for screen readers
 * @param options Configuration options for the announcer
 * @returns Object containing the announce function and ref for the live region
 */
export const useAnnouncer = ({
  ariaLive = 'polite',
  clearTime = 3000,
  shouldClear = true,
}: UseAnnouncerOptions = {}) => {
  const announcerRef = useRef<HTMLDivElement | null>(null);
  const clearTimeoutRef = useRef<NodeJS.Timeout>();

  // Clean up any existing timeout on unmount
  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Announce a message to screen readers
   * @param message The message to announce
   * @param options Optional overrides for this specific announcement
   */
  const announce = useCallback(
    (
      message: string,
      options?: {
        ariaLive?: AriaLive;
        clearTime?: number;
        shouldClear?: boolean;
      }
    ) => {
      if (!announcerRef.current) return;

      // Clear any existing timeout
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }

      // Update ARIA live setting if specified
      if (options?.ariaLive) {
        announcerRef.current.setAttribute('aria-live', options.ariaLive);
      }

      // Set the message
      announcerRef.current.textContent = message;

      // Clear the message after the specified time if shouldClear is true
      const shouldClearMessage = options?.shouldClear ?? shouldClear;
      if (shouldClearMessage) {
        const clearAfter = options?.clearTime ?? clearTime;
        clearTimeoutRef.current = setTimeout(() => {
          if (announcerRef.current) {
            announcerRef.current.textContent = '';
          }
        }, clearAfter);
      }
    },
    [ariaLive, clearTime, shouldClear]
  );

  return {
    announcerRef,
    announce,
  };
};

interface AnnouncerProps {
  /** The ARIA live setting for the announcer */
  ariaLive?: AriaLive;
}

/**
 * Component to render the ARIA live region
 */
export const Announcer: React.FC<AnnouncerProps> = ({
  ariaLive = 'polite',
}) => {
  return (
    <div
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    />
  );
}; 