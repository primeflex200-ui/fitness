import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface CardioTimerState {
  isRunning: boolean;
  time: number;
  startTime: number | null;
  pausedTime: number;
  notificationsEnabled: boolean;
}

interface CardioTimerContextType {
  isRunning: boolean;
  time: number;
  notificationsEnabled: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  stopTimer: () => void;
  toggleNotifications: () => void;
  formatTime: (seconds: number) => string;
}

const CardioTimerContext = createContext<CardioTimerContextType | undefined>(undefined);

const STORAGE_KEY = 'cardio_timer_state';

export const CardioTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState(0);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state: CardioTimerState = JSON.parse(savedState);
        
        if (state.isRunning && state.startTime) {
          // Calculate elapsed time since the timer was started
          const now = Date.now();
          const elapsed = Math.floor((now - state.startTime) / 1000);
          setTime(state.pausedTime + elapsed);
          setStartTime(state.startTime);
          setPausedTime(state.pausedTime);
          setIsRunning(true);
        } else {
          setTime(state.pausedTime);
          setPausedTime(state.pausedTime);
          setIsRunning(false);
        }
        
        setNotificationsEnabled(state.notificationsEnabled);
      } catch (error) {
        console.error('Failed to load timer state:', error);
      }
    }

    // Check notification permission
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state: CardioTimerState = {
      isRunning,
      time,
      startTime,
      pausedTime,
      notificationsEnabled
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isRunning, time, startTime, pausedTime, notificationsEnabled]);

  // Send notification helper
  const sendNotification = useCallback((title: string, body: string) => {
    if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: "cardio-timer-bg",
        requireInteraction: false,
        silent: false
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }, [notificationsEnabled]);

  // Timer effect - runs continuously when isRunning is true
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const currentTime = pausedTime + elapsed;
        setTime(currentTime);

        // Check for milestone notifications
        const milestones = [60, 300, 600, 900, 1200, 1800]; // 1, 5, 10, 15, 20, 30 min
        
        if (milestones.includes(currentTime) && currentTime !== lastNotificationTime) {
          setLastNotificationTime(currentTime);
          const minutes = Math.floor(currentTime / 60);
          
          let message = '';
          let emoji = '';
          
          switch (currentTime) {
            case 60:
              emoji = '🏃';
              message = 'Great start! Keep going!';
              break;
            case 300:
              emoji = '🔥';
              message = "You're doing amazing! Stay strong!";
              break;
            case 600:
              emoji = '💪';
              message = 'Halfway through a great workout!';
              break;
            case 900:
              emoji = '⚡';
              message = "You're crushing it! Keep pushing!";
              break;
            case 1200:
              emoji = '🎯';
              message = 'Incredible endurance! Almost there!';
              break;
            case 1800:
              emoji = '🏆';
              message = "Amazing workout! You're a champion!";
              break;
          }
          
          sendNotification(`${emoji} ${minutes} Minute${minutes > 1 ? 's' : ''}!`, message);
        }
        
        // Every 5 minutes after 30 minutes
        if (currentTime > 1800 && currentTime % 300 === 0 && currentTime !== lastNotificationTime) {
          setLastNotificationTime(currentTime);
          const minutes = Math.floor(currentTime / 60);
          sendNotification('🔥 Keep Going!', `${minutes} minutes and counting!`);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, pausedTime, lastNotificationTime, sendNotification]);

  const startTimer = useCallback(() => {
    const now = Date.now();
    setStartTime(now);
    setIsRunning(true);
    
    if (time === 0) {
      sendNotification('🚀 Workout Started!', "Let's crush it! Timer is running in the background.");
    } else {
      sendNotification('▶️ Timer Resumed!', 'Keep pushing! Timer continues in the background.');
    }
  }, [time, sendNotification]);

  const pauseTimer = useCallback(() => {
    if (startTime) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setPausedTime(pausedTime + elapsed);
      setTime(pausedTime + elapsed);
    }
    setIsRunning(false);
    setStartTime(null);
    sendNotification('⏸️ Timer Paused', 'Take a breather! Resume when ready.');
  }, [startTime, pausedTime, sendNotification]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setStartTime(null);
    setPausedTime(0);
    setLastNotificationTime(0);
  }, []);

  const stopTimer = useCallback(() => {
    const finalTime = time;
    setIsRunning(false);
    setTime(0);
    setStartTime(null);
    setPausedTime(0);
    setLastNotificationTime(0);
    
    if (finalTime > 0) {
      const mins = Math.floor(finalTime / 60);
      const secs = finalTime % 60;
      sendNotification(
        '🎉 Workout Complete!', 
        `Total time: ${mins}:${secs.toString().padStart(2, '0')}. Great job!`
      );
    }
  }, [time, sendNotification]);

  const toggleNotifications = useCallback(async () => {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        sendNotification('🔔 Notifications Enabled!', "You'll be notified at workout milestones.");
      }
    } else {
      setNotificationsEnabled(!notificationsEnabled);
    }
  }, [notificationsEnabled, sendNotification]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <CardioTimerContext.Provider
      value={{
        isRunning,
        time,
        notificationsEnabled,
        startTimer,
        pauseTimer,
        resetTimer,
        stopTimer,
        toggleNotifications,
        formatTime
      }}
    >
      {children}
    </CardioTimerContext.Provider>
  );
};

export const useCardioTimer = () => {
  const context = useContext(CardioTimerContext);
  if (context === undefined) {
    throw new Error('useCardioTimer must be used within a CardioTimerProvider');
  }
  return context;
};
