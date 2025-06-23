// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.

self.addEventListener('push', function(event) {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1',
        taskId: data.taskId,
      },
      actions: [
        {
          action: 'complete',
          title: 'Mark as Complete',
          icon: '/icons/check.png'
        },
        {
          action: 'snooze',
          title: 'Snooze',
          icon: '/icons/snooze.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'complete') {
    // Handle complete action
    const taskId = event.notification.data.taskId;
    event.waitUntil(
      fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );
  } else if (event.action === 'snooze') {
    // Handle snooze action
    const taskId = event.notification.data.taskId;
    event.waitUntil(
      fetch(`/api/reminders/${taskId}/snooze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snoozeMinutes: 15 // Default snooze time
        })
      })
    );
  } else {
    // Open the app when clicking the notification body
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 