import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const notificationPermissionService = {
  /**
   * Request notification permissions from the user
   */
  async requestPermission(): Promise<boolean> {
    // Only request on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping notification permission');
      return true;
    }

    try {
      // Check current permission status
      const permStatus = await LocalNotifications.checkPermissions();
      
      if (permStatus.display === 'granted') {
        console.log('Notification permission already granted');
        return true;
      }

      // Request permission
      const result = await LocalNotifications.requestPermissions();
      
      if (result.display === 'granted') {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  /**
   * Check if notifications are enabled
   */
  async checkPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    try {
      const permStatus = await LocalNotifications.checkPermissions();
      return permStatus.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  },

  /**
   * Open app settings so user can enable notifications manually
   */
  async openSettings(): Promise<void> {
    // This will be handled by showing a message to the user
    // to manually enable notifications in Android settings
    alert('Please enable notifications in your device settings:\nSettings > Apps > PRIME FLEX > Notifications');
  }
};
