import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const mobileNotificationService = {
  /**
   * Schedule water reminder notifications
   */
  async scheduleWaterReminders(intervalMinutes: number): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on mobile platform, skipping native notifications');
      return false;
    }

    try {
      // Request permission first
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const result = await LocalNotifications.requestPermissions();
        if (result.display !== 'granted') {
          console.log('Notification permission denied');
          return false;
        }
      }

      // Cancel existing water reminders (IDs 1-100)
      const cancelIds = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
      await LocalNotifications.cancel({ notifications: cancelIds });

      // Schedule multiple notifications (next 24 hours worth)
      const notifications = [];
      const now = new Date();
      const notificationsToSchedule = Math.min(100, Math.floor((24 * 60) / intervalMinutes)); // Max 100 or 24 hours worth

      for (let i = 0; i < notificationsToSchedule; i++) {
        const notificationTime = new Date(now.getTime() + (i + 1) * intervalMinutes * 60 * 1000);
        
        notifications.push({
          id: i + 1,
          title: '💧 Hydration Reminder',
          body: `Time to drink water! Stay hydrated for better performance. (${i + 1}/${notificationsToSchedule})`,
          schedule: {
            at: notificationTime
          },
          sound: 'default',
          smallIcon: 'ic_launcher',
          largeIcon: 'ic_launcher',
          actionTypeId: 'WATER_REMINDER',
          extra: {
            type: 'water',
            index: i + 1
          }
        });
      }

      await LocalNotifications.schedule({ notifications });

      console.log(`✅ Scheduled ${notificationsToSchedule} water reminders every ${intervalMinutes} minutes`);
      console.log(`First notification at: ${notifications[0].schedule.at.toLocaleTimeString()}`);
      console.log(`Last notification at: ${notifications[notifications.length - 1].schedule.at.toLocaleTimeString()}`);
      
      return true;
    } catch (error) {
      console.error('Error scheduling water reminders:', error);
      return false;
    }
  },

  /**
   * Schedule meal reminder notifications
   */
  async scheduleMealReminders(intervalMinutes: number): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on mobile platform, skipping native notifications');
      return false;
    }

    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const result = await LocalNotifications.requestPermissions();
        if (result.display !== 'granted') {
          console.log('Notification permission denied');
          return false;
        }
      }

      // Cancel existing meal reminders (IDs 101-200)
      const cancelIds = Array.from({ length: 100 }, (_, i) => ({ id: i + 101 }));
      await LocalNotifications.cancel({ notifications: cancelIds });

      // Schedule multiple notifications (next 24 hours worth)
      const notifications = [];
      const now = new Date();
      const notificationsToSchedule = Math.min(100, Math.floor((24 * 60) / intervalMinutes)); // Max 100 or 24 hours worth

      for (let i = 0; i < notificationsToSchedule; i++) {
        const notificationTime = new Date(now.getTime() + (i + 1) * intervalMinutes * 60 * 1000);
        
        notifications.push({
          id: i + 101, // Start from 101 to avoid conflict with water reminders
          title: '🍎 Meal Reminder',
          body: `Time for your next meal! Check your diet plan. (${i + 1}/${notificationsToSchedule})`,
          schedule: {
            at: notificationTime
          },
          sound: 'default',
          smallIcon: 'ic_launcher',
          largeIcon: 'ic_launcher',
          actionTypeId: 'MEAL_REMINDER',
          extra: {
            type: 'meal',
            index: i + 1
          }
        });
      }

      await LocalNotifications.schedule({ notifications });

      console.log(`✅ Scheduled ${notificationsToSchedule} meal reminders every ${intervalMinutes} minutes`);
      console.log(`First notification at: ${notifications[0].schedule.at.toLocaleTimeString()}`);
      console.log(`Last notification at: ${notifications[notifications.length - 1].schedule.at.toLocaleTimeString()}`);
      
      return true;
    } catch (error) {
      console.error('Error scheduling meal reminders:', error);
      return false;
    }
  },

  /**
   * Stop water reminders
   */
  async stopWaterReminders(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      // Cancel all water reminder IDs (1-100)
      const cancelIds = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
      await LocalNotifications.cancel({ notifications: cancelIds });
      console.log('✅ Water reminders stopped');
    } catch (error) {
      console.error('Error stopping water reminders:', error);
    }
  },

  /**
   * Stop meal reminders
   */
  async stopMealReminders(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      // Cancel all meal reminder IDs (101-200)
      const cancelIds = Array.from({ length: 100 }, (_, i) => ({ id: i + 101 }));
      await LocalNotifications.cancel({ notifications: cancelIds });
      console.log('✅ Meal reminders stopped');
    } catch (error) {
      console.error('Error stopping meal reminders:', error);
    }
  },

  /**
   * Stop all reminders
   */
  async stopAllReminders(): Promise<void> {
    await this.stopWaterReminders();
    await this.stopMealReminders();
  },

  /**
   * Check if notifications are enabled
   */
  async checkPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;
    
    try {
      const perm = await LocalNotifications.checkPermissions();
      return perm.display === 'granted';
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  },

  /**
   * Get pending notifications (for debugging)
   */
  async getPendingNotifications(): Promise<any[]> {
    if (!Capacitor.isNativePlatform()) return [];
    
    try {
      const result = await LocalNotifications.getPending();
      console.log('Pending notifications:', result.notifications);
      return result.notifications;
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }
};
