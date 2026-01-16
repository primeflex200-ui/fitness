import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { sendWaterReminder } from '@/services/smsService';
import { toast } from 'sonner';

interface WaterReminderContextType {
  isActive: boolean;
  interval: number;
  phoneNumber: string;
  startReminders: (phone: string, intervalMinutes: number) => void;
  stopReminders: () => void;
  setPhoneNumber: (phone: string) => void;
  updateInterval: (minutes: number) => void;
}

const WaterReminderContext = createContext<WaterReminderContextType | null>(null);

export const useWaterReminderContext = () => {
  const context = useContext(WaterReminderContext);
  if (!context) {
    throw new Error('useWaterReminderContext must be used within WaterReminderProvider');
  }
  return context;
};

export const WaterReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [interval, setIntervalState] = useState(60);
  const [phoneNumber, setPhoneNumberState] = useState('');
  const intervalRef = useRef<number | null>(null);

  // Load saved settings on mount
  useEffect(() => {
    const savedEnabled = localStorage.getItem('waterReminderEnabled') === 'true';
    const savedInterval = localStorage.getItem('waterReminderInterval');
    const savedPhone = localStorage.getItem('waterReminderPhone');

    if (savedInterval) setIntervalState(parseInt(savedInterval));
    if (savedPhone) setPhoneNumberState(savedPhone);

    // Auto-start if was enabled
    if (savedEnabled && savedPhone && savedInterval) {
      console.log('Auto-starting water reminders from saved settings...');
      startReminders(savedPhone, parseInt(savedInterval));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startReminders = (phone: string, intervalMinutes: number) => {
    // Clear existing
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    console.log(`Starting water reminders every ${intervalMinutes} minutes for ${phone}`);

    // Save settings
    localStorage.setItem('waterReminderEnabled', 'true');
    localStorage.setItem('waterReminderInterval', String(intervalMinutes));
    localStorage.setItem('waterReminderPhone', phone);

    setIsActive(true);
    setIntervalState(intervalMinutes);
    setPhoneNumberState(phone);

    // Send first reminder
    sendWaterReminder(phone).then(result => {
      if (result.success) {
        toast.success('Water reminder sent! 💧');
      }
    });

    // Set up recurring
    intervalRef.current = window.setInterval(async () => {
      console.log('Sending scheduled water reminder...');
      const result = await sendWaterReminder(phone);
      if (result.success) {
        toast.info('💧 Water reminder sent!');
      }
    }, intervalMs);
  };

  const stopReminders = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    localStorage.setItem('waterReminderEnabled', 'false');
    toast.info('Water reminders stopped');
  };

  const setPhoneNumber = (phone: string) => {
    setPhoneNumberState(phone);
    localStorage.setItem('waterReminderPhone', phone);
  };

  const updateInterval = (minutes: number) => {
    setIntervalState(minutes);
    localStorage.setItem('waterReminderInterval', String(minutes));
    
    // Restart if active
    if (isActive && phoneNumber) {
      startReminders(phoneNumber, minutes);
    }
  };

  return (
    <WaterReminderContext.Provider value={{
      isActive,
      interval,
      phoneNumber,
      startReminders,
      stopReminders,
      setPhoneNumber,
      updateInterval
    }}>
      {children}
    </WaterReminderContext.Provider>
  );
};
