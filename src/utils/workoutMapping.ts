// Maps workout focus names to workout plan keys
export const mapFocusToWorkoutType = (focus: string): { type: 'push' | 'pull' | 'legs' | 'fullbody' | 'cardio' | 'rest' | 'chest' | 'back' | 'shoulders', variant: number } => {
  const focusLower = focus.toLowerCase();
  
  // Full Body - Check this first!
  if (focusLower.includes('full body')) {
    return { type: 'fullbody', variant: 1 };
  }
  
  // Cardio combinations
  if (focusLower.includes('cardio') && focusLower.includes('abs')) {
    return { type: 'cardio', variant: 1 };
  }
  if (focusLower.includes('core') && focusLower.includes('cardio')) {
    return { type: 'cardio', variant: 2 };
  }
  if (focusLower.includes('cardio')) {
    return { type: 'cardio', variant: 1 };
  }
  
  // Rest Day
  if (focusLower.includes('rest') || focusLower.includes('recovery')) {
    return { type: 'rest', variant: 1 };
  }
  
  // Chest combinations
  if (focusLower.includes('lower chest') && focusLower.includes('triceps')) {
    return { type: 'push', variant: 1 };
  }
  if (focusLower.includes('upper chest') && focusLower.includes('triceps')) {
    return { type: 'push', variant: 2 };
  }
  if (focusLower.includes('lower chest') && focusLower.includes('shoulders')) {
    return { type: 'push', variant: 1 };
  }
  if (focusLower.includes('upper chest') && focusLower.includes('shoulders')) {
    return { type: 'push', variant: 2 };
  }
  if (focusLower.includes('shoulders') && focusLower.includes('chest')) {
    return { type: 'push', variant: 3 };
  }
  if (focusLower.includes('chest') && focusLower.includes('back')) {
    return { type: 'push', variant: 1 }; // Mixed push/pull
  }
  if (focusLower.includes('chest')) {
    return { type: 'push', variant: 1 };
  }
  
  // Back combinations
  if (focusLower.includes('back') && focusLower.includes('biceps') && focusLower.includes('shoulders')) {
    return { type: 'pull', variant: 2 };
  }
  if (focusLower.includes('back') && focusLower.includes('biceps')) {
    return { type: 'pull', variant: 1 };
  }
  if (focusLower.includes('back') && focusLower.includes('triceps')) {
    return { type: 'pull', variant: 3 };
  }
  if (focusLower.includes('back')) {
    return { type: 'pull', variant: 1 };
  }
  
  // Shoulder combinations
  if (focusLower.includes('shoulders') && focusLower.includes('arms')) {
    return { type: 'push', variant: 3 };
  }
  if (focusLower.includes('arms') && focusLower.includes('shoulders')) {
    return { type: 'push', variant: 3 };
  }
  if (focusLower.includes('shoulders') && !focusLower.includes('chest') && !focusLower.includes('back')) {
    return { type: 'push', variant: 2 };
  }
  
  // Leg combinations
  if (focusLower.includes('legs') && focusLower.includes('core')) {
    return { type: 'legs', variant: 1 };
  }
  if (focusLower.includes('legs') && focusLower.includes('glutes')) {
    return { type: 'legs', variant: 2 };
  }
  if (focusLower.includes('legs') && focusLower.includes('shoulders')) {
    return { type: 'legs', variant: 3 };
  }
  if (focusLower.includes('leg day') || focusLower.includes('legs')) {
    return { type: 'legs', variant: 1 };
  }
  
  // Push/Pull/Legs (fallback)
  if (focusLower.includes('push day') || focusLower.includes('push')) {
    return { type: 'push', variant: 1 };
  }
  if (focusLower.includes('pull day') || focusLower.includes('pull')) {
    return { type: 'pull', variant: 1 };
  }
  
  // Default
  return { type: 'push', variant: 1 };
};

// Get today's day name
export const getTodayDayName = (): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// Load weekly schedule from localStorage
export const loadWeeklySchedule = () => {
  const saved = localStorage.getItem('weeklySchedule');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Error loading schedule:", error);
      return null;
    }
  }
  return null;
};

// Get today's workout focus from schedule
export const getTodayWorkoutFocus = () => {
  const schedule = loadWeeklySchedule();
  if (!schedule) return null;
  
  const today = getTodayDayName();
  const todaySchedule = schedule.find((day: any) => day.day === today);
  
  return todaySchedule ? todaySchedule.focus : null;
};
