import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { reminderService } from '@/services/reminderService';

/**
 * Component that initializes reminders when the app loads
 * This ensures reminders persist even after page refresh or navigation
 */
export const ReminderInitializer = () => {
  const { user } = useAuth();

  useEffect(() => {
    const initializeReminders = async () => {
      if (!user) return;

      console.log('🔔 ReminderInitializer: Checking for saved reminder settings...');

      // Load settings from localStorage
      const savedSettings = localStorage.getItem('notification_settings');
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          console.log('✅ Found saved settings, reinitializing reminders:', settings);
          
          // Reinitialize reminders with saved settings
          await reminderService.initializeReminders(user.id, {
            workoutReminder: settings.workoutReminder ?? true,
            waterReminder: settings.waterReminder ?? true,
            waterInterval: settings.waterInterval ?? 60,
            mealReminder: settings.mealReminder ?? false,
            mealInterval: settings.mealInterval ?? 180,
          });
          
          console.log('✅ Reminders reinitialized successfully');
        } catch (err) {
          console.error('❌ Error reinitializing reminders:', err);
        }
      } else {
        console.log('ℹ️ No saved reminder settings found');
      }
    };

    initializeReminders();
  }, [user]);

  // This component doesn't render anything
  return null;
};
