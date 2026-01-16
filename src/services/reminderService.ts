import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReminderSettings {
  workoutReminder: boolean;
  waterReminder: boolean;
  waterInterval: number;
  mealReminder: boolean;
  mealInterval: number;
}

class ReminderService {
  private waterTimerId: number | null = null;
  private mealTimerId: number | null = null;
  private workoutTimerId: number | null = null;
  private currentSettings: ReminderSettings | null = null;

  // Save reminder settings to database (currently using localStorage only)
  async saveSettings(userId: string, settings: ReminderSettings) {
    try {
      // For now, we'll just use localStorage since the database columns don't exist yet
      // You can add these columns to the profiles table later if needed
      console.log('✅ Reminder settings saved to localStorage (database columns not yet created)');
      return true;
    } catch (err) {
      console.error('Error in saveSettings:', err);
      return false;
    }
  }

  // Load reminder settings from database (currently using localStorage only)
  async loadSettings(userId: string): Promise<ReminderSettings | null> {
    try {
      // For now, we'll just use localStorage since the database columns don't exist yet
      console.log('ℹ️ Loading from localStorage (database columns not yet created)');
      return null; // Will fall back to localStorage in the calling code
    } catch (err) {
      console.error('Error in loadSettings:', err);
      return null;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Send device notification with action buttons
  private sendDeviceNotification(title: string, message: string, type: 'water' | 'meal' | 'workout', icon?: string) {
    console.log(`🔔 sendDeviceNotification called - Title: "${title}", Type: ${type}`);
    console.log(`🔔 Notification.permission = "${Notification.permission}"`);
    
    if (Notification.permission === 'granted') {
      console.log('✅ Permission granted, creating notification...');
      
      // Get serving size from localStorage for water notifications
      let servingSize = 250; // Default
      if (type === 'water') {
        try {
          const waterData = JSON.parse(localStorage.getItem('water_intake_data') || '{}');
          servingSize = waterData.servingSize || 250;
          console.log(`💧 Serving size: ${servingSize}ml`);
        } catch (err) {
          console.error('Error reading serving size:', err);
        }
      }

      // For water reminders, add Yes/No action buttons
      const options: NotificationOptions = {
        body: message,
        icon: icon || '/primeflex-icon.svg',
        badge: '/primeflex-icon.svg',
        tag: `${type}-reminder`,
        requireInteraction: type === 'water', // Keep water notifications until user responds
        silent: false,
        data: { type, servingSize }, // Store type and serving size for click handling
      };

      // Add action buttons for water reminders
      if (type === 'water') {
        (options as any).actions = [
          { action: 'yes', title: '✅ Yes, I drank water' },
          { action: 'no', title: '❌ Not yet' },
        ];
        console.log('💧 Added Yes/No action buttons');
      }

      try {
        const notification = new Notification(title, options);
        console.log('📱 Notification object created successfully!');

        // Handle notification click (clicking the notification body)
        notification.onclick = () => {
          console.log('👆 Notification clicked!');
          window.focus();
          // If it's a water notification and they click the body, open water page
          if (type === 'water') {
            window.location.href = '/water';
          }
          notification.close();
        };

        // Auto-close after 30 seconds for non-water notifications
        if (type !== 'water') {
          setTimeout(() => notification.close(), 30000);
        }

        console.log('✅ Device notification sent successfully:', title);
      } catch (notifError) {
        console.error('❌ Error creating Notification object:', notifError);
      }
    } else {
      console.error('❌ Notification permission NOT granted!');
      console.error(`   Current permission: "${Notification.permission}"`);
      console.error('   Please allow notifications in browser settings');
    }
  }

  // Send device notification (NO toast, only device notification)
  async sendNotification(userId: string, type: 'water' | 'meal' | 'workout', title: string, message: string) {
    console.log(`📢 sendNotification called - Type: ${type}, Title: ${title}`);
    
    try {
      // Send device notification with action buttons FIRST (most important)
      this.sendDeviceNotification(title, message, type);
      console.log(`✅ ${type} device notification sent`);

      // Try to save to database (optional, don't block on errors)
      try {
        const { error } = await supabase
          .from('app_notifications' as any)
          .insert({
            user_id: userId,
            type,
            title,
            message,
            read: false,
          });

        if (error) {
          console.warn('⚠️ Could not save notification to database:', error.message);
        }

        // Update last reminder timestamp
        const timestampField = `last_${type}_reminder`;
        await supabase
          .from('profiles')
          .update({ [timestampField]: new Date().toISOString() } as any)
          .eq('id', userId);
      } catch (dbError) {
        console.warn('⚠️ Database operation failed (notification still sent):', dbError);
      }
    } catch (err) {
      console.error('❌ Error sending notification:', err);
    }
  }

  // Start water reminders
  startWaterReminders(userId: string, intervalMinutes: number) {
    this.stopWaterReminders();
    
    const intervalMs = intervalMinutes * 60 * 1000;
    console.log(`💧 Starting water reminders every ${intervalMinutes} minutes (${intervalMs}ms)`);
    console.log(`💧 First reminder will appear immediately`);
    console.log(`💧 Next reminder will appear at: ${new Date(Date.now() + intervalMs).toLocaleTimeString()}`);
    console.log(`💧 User ID: ${userId}`);

    // Send immediate notification when starting
    console.log('💧 Sending immediate water reminder!');
    this.sendNotification(
      userId,
      'water',
      '💧 Hydration Time!',
      'Time to drink some water. Stay hydrated! 🚰'
    );

    // Then set up recurring notifications using window.setInterval for better persistence
    this.waterTimerId = window.setInterval(() => {
      console.log('💧 Water reminder timer triggered at:', new Date().toLocaleTimeString());
      this.sendNotification(
        userId,
        'water',
        '💧 Hydration Time!',
        'Time to drink some water. Stay hydrated! 🚰'
      );
    }, intervalMs) as unknown as number;
    
    console.log(`💧 Timer ID created: ${this.waterTimerId}`);
    console.log(`💧 Timer will fire every ${intervalMs}ms (${intervalMinutes} minutes)`);
  }

  // Stop water reminders
  stopWaterReminders() {
    if (this.waterTimerId) {
      console.log(`💧 Stopping water reminder timer ID: ${this.waterTimerId}`);
      window.clearInterval(this.waterTimerId);
      this.waterTimerId = null;
      console.log('💧 Water reminders stopped');
    }
  }

  // Start meal reminders
  startMealReminders(userId: string, intervalMinutes: number) {
    this.stopMealReminders();
    
    const intervalMs = intervalMinutes * 60 * 1000;
    console.log(`🍽️ Starting meal reminders every ${intervalMinutes} minutes`);
    console.log(`🍽️ First reminder will appear immediately`);

    // Send immediate notification when starting
    this.sendNotification(
      userId,
      'meal',
      '🍽️ Meal Time!',
      'Time for your next meal. Check your diet plan! 🥗'
    );

    // Then set up recurring notifications
    this.mealTimerId = window.setInterval(() => {
      console.log('🍽️ Meal reminder timer triggered at:', new Date().toLocaleTimeString());
      this.sendNotification(
        userId,
        'meal',
        '🍽️ Meal Time!',
        'Time for your next meal. Check your diet plan! 🥗'
      );
    }, intervalMs) as unknown as number;
    
    console.log(`🍽️ Timer ID created: ${this.mealTimerId}`);
  }

  // Stop meal reminders
  stopMealReminders() {
    if (this.mealTimerId) {
      console.log(`🍽️ Stopping meal reminder timer ID: ${this.mealTimerId}`);
      window.clearInterval(this.mealTimerId);
      this.mealTimerId = null;
      console.log('🍽️ Meal reminders stopped');
    }
  }

  // Start workout reminders (daily at 8 AM)
  startWorkoutReminders(userId: string) {
    this.stopWorkoutReminders();
    
    console.log('💪 Starting workout reminders');

    // Send immediate notification when starting
    this.sendNotification(
      userId,
      'workout',
      '💪 Workout Time!',
      'Time to crush your workout! Let\'s go! 🏋️'
    );

    // Check every hour if it's 8 AM
    this.workoutTimerId = window.setInterval(() => {
      const now = new Date();
      console.log('💪 Workout reminder check at:', now.toLocaleTimeString());
      if (now.getHours() === 8 && now.getMinutes() === 0) {
        this.sendNotification(
          userId,
          'workout',
          '💪 Workout Time!',
          'Time to crush your workout! Let\'s go! 🏋️'
        );
      }
    }, 60 * 60 * 1000) as unknown as number; // Check every hour
    
    console.log(`💪 Timer ID created: ${this.workoutTimerId}`);
  }

  // Stop workout reminders
  stopWorkoutReminders() {
    if (this.workoutTimerId) {
      console.log(`💪 Stopping workout reminder timer ID: ${this.workoutTimerId}`);
      window.clearInterval(this.workoutTimerId);
      this.workoutTimerId = null;
      console.log('💪 Workout reminders stopped');
    }
  }

  // Initialize all reminders based on settings
  async initializeReminders(userId: string, settings: ReminderSettings) {
    console.log('🔔 Initializing reminders with settings:', settings);
    console.log('🔔 Current settings:', this.currentSettings);
    console.log('🔔 Current timer IDs - Water:', this.waterTimerId, 'Meal:', this.mealTimerId, 'Workout:', this.workoutTimerId);

    // Check if settings have changed
    const settingsChanged = !this.currentSettings || 
      this.currentSettings.waterReminder !== settings.waterReminder ||
      this.currentSettings.waterInterval !== settings.waterInterval ||
      this.currentSettings.mealReminder !== settings.mealReminder ||
      this.currentSettings.mealInterval !== settings.mealInterval ||
      this.currentSettings.workoutReminder !== settings.workoutReminder;

    if (!settingsChanged && this.waterTimerId !== null) {
      console.log('⚠️ Settings unchanged and timers already running, skipping reinitialization');
      return;
    }

    console.log('✅ Settings changed or first initialization, proceeding...');

    // Stop all existing reminders before starting new ones
    this.stopAllReminders();

    // Start reminders based on settings
    if (settings.waterReminder) {
      this.startWaterReminders(userId, settings.waterInterval);
    }

    if (settings.mealReminder) {
      this.startMealReminders(userId, settings.mealInterval);
    }

    if (settings.workoutReminder) {
      this.startWorkoutReminders(userId);
    }

    // Save current settings
    this.currentSettings = { ...settings };
    console.log('✅ Reminders initialized successfully');
  }

  // Stop all reminders
  stopAllReminders() {
    this.stopWaterReminders();
    this.stopMealReminders();
    this.stopWorkoutReminders();
    console.log('🔕 All reminders stopped');
  }

  // Get unread notifications count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('app_notifications' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('Error in getUnreadCount:', err);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('app_notifications' as any)
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    } catch (err) {
      console.error('Error in markAsRead:', err);
    }
  }

  // Get recent notifications
  async getRecentNotifications(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('app_notifications' as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting notifications:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in getRecentNotifications:', err);
      return [];
    }
  }
}

export const reminderService = new ReminderService();
