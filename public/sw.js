// Service Worker for handling notification actions
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  if (data.type === 'water') {
    if (action === 'yes') {
      // User clicked "Yes, I drank water"
      event.waitUntil(
        (async () => {
          // Get serving size from notification data (passed from reminderService)
          const servingSize = data.servingSize || 250;
          console.log('Adding water:', servingSize, 'ml');
          
          const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
          
          // Send message to all open tabs to update UI
          for (const client of clientList) {
            client.postMessage({
              type: 'ADD_WATER',
              amount: servingSize,
            });
          }

          // If no tabs are open, open the water page with a query param
          if (clientList.length === 0) {
            return clients.openWindow(`/water?added=${servingSize}`);
          } else {
            // Focus the first tab
            return clientList[0].focus();
          }
        })()
      );
    } else if (action === 'no') {
      // User clicked "Not yet" - just close the notification
      console.log('User declined water reminder');
    } else {
      // User clicked the notification body - open water page
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
          if (clientList.length > 0) {
            return clientList[0].focus().then((client) => {
              return client.navigate('/water');
            });
          }
          return clients.openWindow('/water');
        })
      );
    }
  }
});

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});
