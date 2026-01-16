import { useEffect, useRef } from 'react';
import { sendWaterReminder } from '@/services/smsService';
import { toast } from 'sonner';

export const useWaterReminder = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startReminder = (phoneNumber: string, intervalMinutes: number) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Convert minutes to milliseconds
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(`Starting water reminder every ${intervalMinutes} minutes for ${phoneNumber}`);
    toast.success(`Water reminders started! You'll get SMS every ${intervalMinutes} minutes 💧`);

    // Set up the interval
    intervalRef.current = setInterval(async () => {
      console.log('Sending scheduled water reminder...');
      
      const result = await sendWaterReminder(phoneNumber);
      
      if (result.success) {
        console.log('Scheduled water reminder sent successfully');
        // Also show in-app notification
        toast.info("💧 Water reminder sent to your phone!");
      } else {
        console.error('Failed to send scheduled reminder:', result.error);
      }
    }, intervalMs);

    // Save to localStorage so it persists
    localStorage.setItem('waterReminderActive', 'true');
    localStorage.setItem('waterReminderPhone', phoneNumber);
    localStorage.setItem('waterReminderInterval', String(intervalMinutes));
  };

  const stopReminder = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    localStorage.setItem('waterReminderActive', 'false');
    toast.info("Water reminders stopped");
  };

  // Check if reminder should be restored on mount
  useEffect(() => {
    const isActive = localStorage.getItem('waterReminderActive') === 'true';
    const phone = localStorage.getItem('waterReminderPhone');
    const interval = localStorage.getItem('waterReminderInterval');

    if (isActive && phone && interval) {
      startReminder(phone, parseInt(interval));
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { startReminder, stopReminder };
};
