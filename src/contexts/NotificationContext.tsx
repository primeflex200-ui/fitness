import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService, NotificationSchedule } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationContextType {
  isEnabled: boolean;
  permissionStatus: NotificationPermission;
  waterReminderInterval: number;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => void;
  setWaterReminderInterval: (minutes: number) => void;
  testNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [waterReminderInterval, setWaterReminderIntervalState] = useState(60); // Default 60 minutes
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        loadSettings(data.user.id);
      }
    });

    // Update permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const loadSettings = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('water_reminder_enabled, water_reminder_interval')
        .eq('id', uid)
        .single();

      if (error) throw error;

      if (data) {
        const enabled = data.water_reminder_enabled || false;
        const interval = data.water_reminder_interval || 60;
        
        setIsEnabled(enabled);
        setWaterReminderIntervalState(interval);

        // Load from localStorage as backup
        const storedEnabled = localStorage.getItem('notificationsEnabled') === 'true';
        const storedInterval = parseInt(localStorage.getItem('waterReminderInterval') || '60');

        if (storedEnabled !== enabled) {
          setIsEnabled(storedEnabled);
        }
        if (storedInterval !== interval) {
          setWaterReminderIntervalState(storedInterval);
        }

        // Start notifications if enabled
        if (enabled && notificationService.isPermissionGranted()) {
          startWaterReminders(interval);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      
      // Fallback to localStorage
      const storedEnabled = localStorage.getItem('notificationsEnabled') === 'true';
      const storedInterval = parseInt(localStorage.getItem('waterReminderInterval') || '60');
      setIsEnabled(storedEnabled);
      setWaterReminderIntervalState(storedInterval);

      if (storedEnabled && notificationService.isPermissionGranted()) {
        startWaterReminders(storedInterval);
      }
    }
  };

  const enableNotifications = async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission();
    
    if (granted) {
      setPermissionStatus('granted');
      setIsEnabled(true);
      
      // Save to database
      if (userId) {
        await supabase
          .from('profiles')
          .update({ water_reminder_enabled: true })
          .eq('id', userId);
      }

      // Save to localStorage
      localStorage.setItem('notificationsEnabled', 'true');

      // Start reminders
      startWaterReminders(waterReminderInterval);
      
      toast.success('Water reminders enabled!');
      return true;
    }

    return false;
  };

  const disableNotifications = () => {
    setIsEnabled(false);
    notificationService.cancelAllNotifications();

    // Save to database
    if (userId) {
      supabase
        .from('profiles')
        .update({ water_reminder_enabled: false })
        .eq('id', userId);
    }

    // Save to localStorage
    localStorage.setItem('notificationsEnabled', 'false');

    toast.info('Water reminders disabled');
  };

  const setWaterReminderInterval = (minutes: number) => {
    setWaterReminderIntervalState(minutes);

    // Save to database
    if (userId) {
      supabase
        .from('profiles')
        .update({ water_reminder_interval: minutes })
        .eq('id', userId);
    }

    // Save to localStorage
    localStorage.setItem('waterReminderInterval', minutes.toString());

    // Restart reminders with new interval
    if (isEnabled) {
      startWaterReminders(minutes);
    }

    toast.success(`Water reminder interval set to ${minutes} minutes`);
  };

  const startWaterReminders = (intervalMinutes: number) => {
    // Cancel existing reminders
    notificationService.cancelAllNotifications();

    // Schedule recurring water reminder
    const schedule: NotificationSchedule = {
      id: 'water-reminder',
      title: '💧 Time to Hydrate!',
      body: `It's been ${intervalMinutes} minutes. Drink some water to stay hydrated!`,
      scheduledTime: new Date(Date.now() + intervalMinutes * 60 * 1000),
      interval: intervalMinutes,
      enabled: true
    };

    notificationService.scheduleRecurringNotification(schedule);
  };

  const testNotification = () => {
    notificationService.showNotification(
      '💧 Test Notification',
      'This is how your water reminders will look!'
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        isEnabled,
        permissionStatus,
        waterReminderInterval,
        enableNotifications,
        disableNotifications,
        setWaterReminderInterval,
        testNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
