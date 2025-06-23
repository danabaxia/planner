import { useState, useCallback } from 'react';
import { notificationService } from '@/lib/notifications';

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request notification permission
      const permissionGranted = await notificationService.requestPermission();
      if (!permissionGranted) {
        throw new Error('Notification permission denied');
      }

      // Register service worker
      const registration = await notificationService.registerServiceWorker();
      if (!registration) {
        throw new Error('Failed to register service worker');
      }

      // Subscribe to push notifications
      const subscription = await notificationService.subscribeToNotifications(registration);
      if (!subscription) {
        throw new Error('Failed to subscribe to push notifications');
      }

      // Save subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      setIsSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to notifications');
      console.error('Error subscribing to notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove subscription from server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      setIsSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe from notifications');
      console.error('Error unsubscribing from notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
} 