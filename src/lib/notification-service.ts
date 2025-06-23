import webPush from 'web-push';
import { prisma } from './prisma';

// Configure web-push with VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
};

webPush.setVapidDetails(
  'mailto:' + process.env.NOTIFICATION_EMAIL,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const notificationService = {
  async saveSubscription(userId: string, subscription: PushSubscription) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          pushSubscription: subscription as any,
        },
      });
      return true;
    } catch (error) {
      console.error('Error saving push subscription:', error);
      return false;
    }
  },

  async getSubscription(userId: string): Promise<PushSubscription | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pushSubscription: true },
      });
      return user?.pushSubscription as PushSubscription || null;
    } catch (error) {
      console.error('Error getting push subscription:', error);
      return null;
    }
  },

  async sendNotification(
    subscription: PushSubscription,
    data: {
      title: string;
      body: string;
      taskId?: string;
    }
  ) {
    try {
      await webPush.sendNotification(
        subscription as any,
        JSON.stringify(data)
      );
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      if ((error as any).statusCode === 410) {
        // Subscription has expired or is invalid
        // TODO: Remove the subscription from the user
      }
      return false;
    }
  },

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      console.error('Error registering service worker:', error);
      return null;
    }
  },

  async subscribeToNotifications(
    registration: ServiceWorkerRegistration
  ): Promise<PushSubscription | null> {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeys.publicKey,
      });
      return subscription.toJSON() as PushSubscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  },
}; 