import { useCallback, useRef, useState } from 'react';

type AriaLive = 'off' | 'polite' | 'assertive';

interface QueuedAnnouncement {
  /** The message to announce */
  message: string;
  /** The ARIA live setting for this announcement */
  ariaLive?: AriaLive;
  /** Optional ID for tracking the announcement */
  id?: string;
}

interface UseAriaLiveQueueOptions {
  /** Default ARIA live setting for announcements */
  defaultAriaLive?: AriaLive;
  /** Delay between announcements in milliseconds */
  announcementDelay?: number;
  /** Maximum number of announcements to queue */
  maxQueueSize?: number;
}

/**
 * Hook to manage queued ARIA live announcements
 * @param options Configuration options for the announcement queue
 * @returns Object containing queue management functions and current state
 */
export const useAriaLiveQueue = ({
  defaultAriaLive = 'polite',
  announcementDelay = 1000,
  maxQueueSize = 10,
}: UseAriaLiveQueueOptions = {}) => {
  const [queue, setQueue] = useState<QueuedAnnouncement[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<QueuedAnnouncement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Process the next announcement in the queue
  const processQueue = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (queue.length === 0) {
      setCurrentAnnouncement(null);
      return;
    }

    const [nextAnnouncement, ...remainingQueue] = queue;
    setCurrentAnnouncement(nextAnnouncement);
    setQueue(remainingQueue);

    // Schedule processing of next announcement
    timeoutRef.current = setTimeout(() => {
      processQueue();
    }, announcementDelay);
  }, [queue, announcementDelay]);

  // Add an announcement to the queue
  const announce = useCallback(
    (
      message: string,
      options?: {
        ariaLive?: AriaLive;
        id?: string;
      }
    ) => {
      setQueue((currentQueue) => {
        // Don't add if queue is at max size
        if (currentQueue.length >= maxQueueSize) {
          console.warn('Announcement queue is full, dropping message:', message);
          return currentQueue;
        }

        // Don't add duplicate messages that are next to each other
        if (
          currentQueue.length > 0 &&
          currentQueue[currentQueue.length - 1].message === message
        ) {
          return currentQueue;
        }

        const newAnnouncement: QueuedAnnouncement = {
          message,
          ariaLive: options?.ariaLive || defaultAriaLive,
          id: options?.id,
        };

        const newQueue = [...currentQueue, newAnnouncement];

        // Start processing if this is the first item
        if (currentQueue.length === 0 && !currentAnnouncement) {
          setTimeout(processQueue, 0);
        }

        return newQueue;
      });
    },
    [defaultAriaLive, maxQueueSize, currentAnnouncement, processQueue]
  );

  // Clear all announcements from the queue
  const clearQueue = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setQueue([]);
    setCurrentAnnouncement(null);
  }, []);

  return {
    announce,
    clearQueue,
    currentAnnouncement,
    queueLength: queue.length,
  };
};

/**
 * Component to render ARIA live regions
 */
export const AriaLiveRegions: React.FC = () => {
  return (
    <>
      <div
        role="status"
        aria-live="polite"
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
      <div
        role="alert"
        aria-live="assertive"
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
    </>
  );
}; 