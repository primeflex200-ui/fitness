import { supabase } from "@/integrations/supabase/client";

interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  muscle: string;
}

interface ProgressData {
  id: string;
  user_id: string;
  date: string;
  completed_exercises: string[];
  total_exercises: number;
  completion_percentage: number;
  weekly_stats: any;
  monthly_trend: any;
  created_at: string;
  updated_at: string;
}

interface DailyProgressSummary {
  date: string;
  completionPercentage: number;
  exercisesCompleted: number;
  totalExercises: number;
  status: "incomplete" | "in-progress" | "complete";
}

interface WeeklySummary {
  week: string;
  averageCompletion: number;
  daysTracked: number;
  consistency: "excellent" | "good" | "fair" | "poor";
  trend: "improving" | "stable" | "declining";
}

/**
 * AI-Powered Progress Tracking Service
 * Handles automatic sync between Workout Plans and Progress Tracking
 * Uses intelligent calculations for daily/weekly progress
 */
export class ProgressTrackingService {
  /**
   * Save workout plan and automatically create progress tracking entry
   * Called when user clicks "Save" button in Workout Plans
   */
  static async saveWorkoutPlanWithProgress(
    userId: string,
    exercises: WorkoutExercise[]
  ): Promise<{ success: boolean; progressId?: string; error?: string }> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // AI Calculation: Initialize progress with all exercises
      const totalExercises = exercises.length;
      const completedExercises: string[] = [];
      const completionPercentage = 0; // Start at 0% when plan is saved

      console.log("Saving progress tracking:", {
        userId,
        date: today,
        totalExercises,
        completedExercises,
        completionPercentage
      });

      // Create or update progress tracking entry
      const { data, error } = await supabase.from("progress_tracking").upsert(
        {
          user_id: userId,
          date: today,
          completed_exercises: completedExercises,
          total_exercises: totalExercises,
          completion_percentage: completionPercentage,
          weekly_stats: {},
          monthly_trend: {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,date" }
      ).select();

      if (error) {
        console.error("Error saving progress:", error);
        return { success: false, error: error.message };
      }

      console.log("Progress tracking saved successfully:", data);
      return { success: true, progressId: data?.[0]?.id };
    } catch (error) {
      console.error("Error in saveWorkoutPlanWithProgress:", error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Update progress when exercise is marked as completed
   * AI automatically calculates percentage and updates trends
   */
  static async updateExerciseCompletion(
    userId: string,
    exerciseName: string,
    isCompleted: boolean
  ): Promise<{ success: boolean; updatedProgress?: ProgressData; error?: string }> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Fetch current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from("progress_tracking")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        return { success: false, error: fetchError.message };
      }

      let completedExercises = currentProgress?.completed_exercises || [];
      const totalExercises = currentProgress?.total_exercises || 0;

      // AI Logic: Update completed exercises list
      if (isCompleted) {
        if (!completedExercises.includes(exerciseName)) {
          completedExercises = [...completedExercises, exerciseName];
        }
      } else {
        completedExercises = completedExercises.filter((ex: string) => ex !== exerciseName);
      }

      // AI Calculation: Calculate completion percentage
      const completionPercentage =
        totalExercises > 0 ? Math.round((completedExercises.length / totalExercises) * 100) : 0;

      // AI Calculation: Update weekly stats
      const weeklyStats = await this.calculateWeeklyStats(userId, today, completionPercentage);

      // AI Calculation: Update monthly trend
      const monthlyTrend = await this.calculateMonthlyTrend(userId);

      // Save updated progress
      const { data: updatedData, error: updateError } = await supabase
        .from("progress_tracking")
        .upsert(
          {
            user_id: userId,
            date: today,
            completed_exercises: completedExercises,
            total_exercises: totalExercises,
            completion_percentage: completionPercentage,
            weekly_stats: weeklyStats,
            monthly_trend: monthlyTrend,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,date" }
        )
        .select()
        .single();

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true, updatedProgress: updatedData };
    } catch (error) {
      console.error("Error updating exercise completion:", error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * AI Calculation: Calculate weekly statistics
   * Analyzes last 7 days and generates weekly stats
   */
  private static async calculateWeeklyStats(
    userId: string,
    today: string,
    todayPercentage: number
  ): Promise<Record<string, number>> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: weekData } = await supabase
        .from("progress_tracking")
        .select("date, completion_percentage")
        .eq("user_id", userId)
        .gte("date", sevenDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: true });

      const weeklyStats: Record<string, number> = {};
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      // AI Logic: Build weekly stats from last 7 days
      if (weekData) {
        weekData.forEach((entry) => {
          const date = new Date(entry.date);
          const dayName = dayNames[date.getDay()];
          weeklyStats[dayName] = entry.completion_percentage;
        });
      }

      // Ensure today is included
      const todayDate = new Date(today);
      const todayDayName = dayNames[todayDate.getDay()];
      weeklyStats[todayDayName] = todayPercentage;

      return weeklyStats;
    } catch (error) {
      console.error("Error calculating weekly stats:", error);
      return {};
    }
  }

  /**
   * AI Calculation: Calculate monthly trend
   * Analyzes last 4 weeks and generates trend data
   */
  private static async calculateMonthlyTrend(userId: string): Promise<Record<string, number>> {
    try {
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const { data: monthData } = await supabase
        .from("progress_tracking")
        .select("date, completion_percentage")
        .eq("user_id", userId)
        .gte("date", fourWeeksAgo.toISOString().split("T")[0])
        .order("date", { ascending: true });

      const monthlyTrend: Record<string, number> = {};

      // AI Logic: Calculate weekly averages for 4 weeks
      if (monthData && monthData.length > 0) {
        let weekNumber = 1;
        let weekSum = 0;
        let weekCount = 0;

        monthData.forEach((entry, index) => {
          weekSum += entry.completion_percentage;
          weekCount++;

          // Every 7 days or at the end, calculate week average
          if ((index + 1) % 7 === 0 || index === monthData.length - 1) {
            const weekAverage = Math.round(weekSum / weekCount);
            monthlyTrend[`Week ${weekNumber}`] = weekAverage;
            weekNumber++;
            weekSum = 0;
            weekCount = 0;
          }
        });
      }

      return monthlyTrend;
    } catch (error) {
      console.error("Error calculating monthly trend:", error);
      return {};
    }
  }

  /**
   * Get daily progress summary with AI insights
   */
  static async getDailyProgressSummary(userId: string, date?: string): Promise<DailyProgressSummary | null> {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("progress_tracking")
        .select("*")
        .eq("user_id", userId)
        .eq("date", targetDate)
        .single();

      if (error) {
        return null;
      }

      // AI Logic: Determine status based on completion percentage
      let status: "incomplete" | "in-progress" | "complete" = "incomplete";
      if (data.completion_percentage === 100) {
        status = "complete";
      } else if (data.completion_percentage > 0) {
        status = "in-progress";
      }

      return {
        date: data.date,
        completionPercentage: data.completion_percentage,
        exercisesCompleted: data.completed_exercises.length,
        totalExercises: data.total_exercises,
        status,
      };
    } catch (error) {
      console.error("Error getting daily progress summary:", error);
      return null;
    }
  }

  /**
   * Get weekly summary with AI-generated insights
   */
  static async getWeeklySummary(userId: string): Promise<WeeklySummary | null> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: weekData } = await supabase
        .from("progress_tracking")
        .select("completion_percentage")
        .eq("user_id", userId)
        .gte("date", sevenDaysAgo.toISOString().split("T")[0]);

      if (!weekData || weekData.length === 0) {
        return null;
      }

      // AI Calculation: Calculate average completion
      const totalCompletion = weekData.reduce((sum, entry) => sum + entry.completion_percentage, 0);
      const averageCompletion = Math.round(totalCompletion / weekData.length);
      const daysTracked = weekData.length;

      // AI Logic: Determine consistency level
      let consistency: "excellent" | "good" | "fair" | "poor" = "poor";
      if (averageCompletion >= 80) {
        consistency = "excellent";
      } else if (averageCompletion >= 60) {
        consistency = "good";
      } else if (averageCompletion >= 40) {
        consistency = "fair";
      }

      // AI Logic: Determine trend (improving, stable, declining)
      let trend: "improving" | "stable" | "declining" = "stable";
      if (weekData.length >= 2) {
        const firstHalf = weekData.slice(0, Math.floor(weekData.length / 2));
        const secondHalf = weekData.slice(Math.floor(weekData.length / 2));

        const firstAvg = firstHalf.reduce((sum, e) => sum + e.completion_percentage, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, e) => sum + e.completion_percentage, 0) / secondHalf.length;

        if (secondAvg > firstAvg + 5) {
          trend = "improving";
        } else if (secondAvg < firstAvg - 5) {
          trend = "declining";
        }
      }

      return {
        week: `Week of ${sevenDaysAgo.toLocaleDateString()}`,
        averageCompletion,
        daysTracked,
        consistency,
        trend,
      };
    } catch (error) {
      console.error("Error getting weekly summary:", error);
      return null;
    }
  }

  /**
   * Reset daily progress at midnight
   * Called automatically by system
   */
  static async resetDailyProgress(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Archive yesterday's data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split("T")[0];

      // Create new empty progress for today
      const { error } = await supabase.from("progress_tracking").upsert({
        user_id: userId,
        date: today,
        completed_exercises: [],
        total_exercises: 0,
        completion_percentage: 0,
        weekly_stats: {},
        monthly_trend: {},
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error resetting daily progress:", error);
      return { success: false, error: String(error) };
    }
  }
}
