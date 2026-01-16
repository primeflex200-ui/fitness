// In-App Notification Service for Water Reminders
import { toast } from 'sonner';

export interface NotificationSchedule {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  interval?: number; // in minutes
  enabled: boolean;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private schedules: Map<string, NodeJS.Timeout> = new Map();

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
        return true;
      } else {
        toast.error('Notification permission denied');
        return false;
      }
    }

    return false;
  }

  async showNotification(title: string, body: string, icon?: string): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    // Show browser notification
    const notification = new Notification(title, {
      body,
      icon: icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'water-reminder',
      requireInteraction: false,
      silent: false
    });

    // Also show in-app toast
    toast.info(body, {
      duration: 5000,
      action: {
        label: 'Dismiss',
        onClick: () => notification.close()
      }
    });

    // Auto close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    // Handle click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  scheduleNotification(schedule: NotificationSchedule): void {
    // Clear existing schedule if any
    this.cancelNotification(schedule.id);

    if (!schedule.enabled) return;

    const now = new Date();
    const scheduledTime = new Date(schedule.scheduledTime);
    let delay = scheduledTime.getTime() - now.getTime();

    // If time has passed today, schedule for tomorrow
    if (delay < 0) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
      delay = scheduledTime.getTime() - now.getTime();
    }

    const timeoutId = setTimeout(() => {
      this.showNotification(schedule.title, schedule.body);

      // If interval is set, reschedule
      if (schedule.interval && schedule.interval > 0) {
        this.scheduleRecurringNotification(schedule);
      }
    }, delay);

    this.schedules.set(schedule.id, timeoutId);
  }

  scheduleRecurringNotification(schedule: NotificationSchedule): void {
    if (!schedule.interval || !schedule.enabled) return;

    const intervalMs = schedule.interval * 60 * 1000; // Convert minutes to milliseconds

    const intervalId = setInterval(() => {
      this.showNotification(schedule.title, schedule.body);
    }, intervalMs);

    this.schedules.set(schedule.id, intervalId as any);
  }

  cancelNotification(id: string): void {
    const timeoutId = this.schedules.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      clearInterval(timeoutId);
      this.schedules.delete(id);
    }
  }

  cancelAllNotifications(): void {
    this.schedules.forEach((timeoutId) => {
      clearTimeout(timeoutId);
      clearInterval(timeoutId);
    });
    this.schedules.clear();
  }

  isPermissionGranted(): boolean {
    return this.permission === 'granted' || Notification.permission === 'granted';
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}

export const notificationService = new NotificationService();
