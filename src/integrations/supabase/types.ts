export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          email: string
          id: string
          full_name: string | null
          age: number | null
          gender: string | null
          height: number | null
          weight: number | null
          fitness_goal: string | null
          diet_type: string | null
          phone_number: string | null
          water_reminder_enabled: boolean | null
          water_reminder_interval: number | null
          created_at: string | null
        }
        Insert: {
          email: string
          id: string
          full_name?: string | null
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          fitness_goal?: string | null
          diet_type?: string | null
          phone_number?: string | null
          water_reminder_enabled?: boolean | null
          water_reminder_interval?: number | null
          created_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          full_name?: string | null
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          fitness_goal?: string | null
          diet_type?: string | null
          phone_number?: string | null
          water_reminder_enabled?: boolean | null
          water_reminder_interval?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }

      /* Application-specific tables used by the app */
      user_stats: {
        Row: {
          id: string
          user_id: string
          workouts_completed: number | null
          current_streak: number | null
          calories_burned: number | null
          steps_today: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          workouts_completed?: number | null
          current_streak?: number | null
          calories_burned?: number | null
          steps_today?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workouts_completed?: number | null
          current_streak?: number | null
          calories_burned?: number | null
          steps_today?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }

      workout_completions: {
        Row: {
          id: string
          user_id: string
          workout_date: string
          exercise_name: string | null
          workout_type: string | null
          completed: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          workout_date: string
          exercise_name?: string | null
          workout_type?: string | null
          completed?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workout_date?: string
          exercise_name?: string | null
          workout_type?: string | null
          completed?: boolean
          created_at?: string | null
        }
        Relationships: []
      }

      strength_progress: {
        Row: {
          id: string
          user_id: string
          recorded_date: string
          exercise: string | null
          weight: number | null
          reps: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          recorded_date: string
          exercise?: string | null
          weight?: number | null
          reps?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          recorded_date?: string
          exercise?: string | null
          weight?: number | null
          reps?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          message?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      trainer_videos: {
        Row: {
          id: string
          title: string | null
          description: string | null
          video_url: string | null
          thumbnail_url: string | null
          target_muscle: string | null
          difficulty: string | null
          trainer_name: string | null
          is_featured: boolean | null
          section: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          target_muscle?: string | null
          difficulty?: string | null
          trainer_name?: string | null
          is_featured?: boolean | null
          section?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          target_muscle?: string | null
          difficulty?: string | null
          trainer_name?: string | null
          is_featured?: boolean | null
          section?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          id: string
          user_id: string | null
          message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          message?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          id: string
          user_id: string
          video_id: string | null
          plan_data: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          video_id?: string | null
          plan_data: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string | null
          plan_data?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      progress_tracking: {
        Row: {
          id: string
          user_id: string
          date: string
          completed_exercises: string[]
          total_exercises: number
          completion_percentage: number
          weekly_stats: Json
          monthly_trend: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          completed_exercises?: string[]
          total_exercises?: number
          completion_percentage?: number
          weekly_stats?: Json
          monthly_trend?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          completed_exercises?: string[]
          total_exercises?: number
          completion_percentage?: number
          weekly_stats?: Json
          monthly_trend?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      meal_completions: {
        Row: {
          id: string
          user_id: string
          day: string
          meal_name: string
          food_name: string
          calories: number
          protein: number
          carbs: number
          fats: number
          completed: boolean
          completion_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day: string
          meal_name: string
          food_name: string
          calories: number
          protein: number
          carbs: number
          fats: number
          completed?: boolean
          completion_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          day?: string
          meal_name?: string
          food_name?: string
          calories?: number
          protein?: number
          carbs?: number
          fats?: number
          completed?: boolean
          completion_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
