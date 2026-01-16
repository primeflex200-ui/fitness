// Water tracking service for managing water intake
export class WaterTrackingService {
  private static STORAGE_KEY = 'water_intake_data';

  // Get today's date string (YYYY-MM-DD)
  private static getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Load water intake data from localStorage
  static loadWaterIntake(): { consumed: number; goal: number; servingSize: number } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const today = this.getTodayKey();
        
        // If data is from today, return it
        if (parsed.date === today) {
          return {
            consumed: parsed.consumed || 0,
            goal: parsed.goal || 2500,
            servingSize: parsed.servingSize || 250,
          };
        }
      }
    } catch (err) {
      console.error('Error loading water intake:', err);
    }

    // Return defaults if no data or old data
    return { consumed: 0, goal: 2500, servingSize: 250 };
  }

  // Save water intake data to localStorage
  static saveWaterIntake(consumed: number, goal: number, servingSize: number) {
    try {
      const data = {
        date: this.getTodayKey(),
        consumed,
        goal,
        servingSize,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      
      // Dispatch custom event so Water page can update
      window.dispatchEvent(new CustomEvent('waterIntakeUpdated', { detail: data }));
      
      console.log('✅ Water intake saved:', data);
    } catch (err) {
      console.error('Error saving water intake:', err);
    }
  }

  // Add water (called from notification action)
  static addWater(amount: number) {
    const current = this.loadWaterIntake();
    const newConsumed = Math.min(current.consumed + amount, current.goal + 1000);
    this.saveWaterIntake(newConsumed, current.goal, current.servingSize);
    return newConsumed;
  }

  // Get serving size
  static getServingSize(): number {
    const data = this.loadWaterIntake();
    return data.servingSize;
  }

  // Update serving size
  static updateServingSize(size: number) {
    const current = this.loadWaterIntake();
    this.saveWaterIntake(current.consumed, current.goal, size);
  }
}
