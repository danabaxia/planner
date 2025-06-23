import { useEffect, useRef } from 'react';
import { useAriaLiveQueue } from '@/hooks/useAriaLiveQueue';

interface AriaLiveRegionsProps {
  /** Default ARIA live setting for announcements */
  defaultAriaLive?: 'off' | 'polite' | 'assertive';
  /** Delay between announcements in milliseconds */
  announcementDelay?: number;
  /** Maximum number of announcements to queue */
  maxQueueSize?: number;
}

/**
 * Component that manages ARIA live regions for screen reader announcements
 * @param props Configuration options for the ARIA live regions
 * @returns JSX.Element containing the ARIA live regions
 */
export const AriaLiveRegions: React.FC<AriaLiveRegionsProps> = ({
  defaultAriaLive = 'polite',
  announcementDelay = 1000,
  maxQueueSize = 10,
}) => {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  const { currentAnnouncement } = useAriaLiveQueue({
    defaultAriaLive,
    announcementDelay,
    maxQueueSize,
  });

  // Update the appropriate live region when the current announcement changes
  useEffect(() => {
    if (!currentAnnouncement) {
      if (politeRef.current) politeRef.current.textContent = '';
      if (assertiveRef.current) assertiveRef.current.textContent = '';
      return;
    }

    const ref = currentAnnouncement.ariaLive === 'assertive' ? assertiveRef : politeRef;
    if (ref.current) {
      ref.current.textContent = currentAnnouncement.message;
    }
  }, [currentAnnouncement]);

  return (
    <>
      <div
        ref={politeRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        ref={assertiveRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}; 