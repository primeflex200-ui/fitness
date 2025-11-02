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
      community_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      diet_completions: {
        Row: {
          completed: boolean
          created_at: string
          diet_plan: string
          id: string
          meal_date: string
          meal_type: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          diet_plan: string
          id?: string
          meal_date?: string
          meal_type: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          diet_plan?: string
          id?: string
          meal_date?: string
          meal_type?: string
          user_id?: string
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          category: string
          created_at: string | null
          id: string
          meals: Json
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          meals: Json
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          meals?: Json
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      feature_toggles: {
        Row: {
          description: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string | null
          diet_type: string | null
          email: string
          fitness_goal: string | null
          full_name: string | null
          gender: string | null
          height: number | null
          id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          diet_type?: string | null
          email: string
          fitness_goal?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          diet_type?: string | null
          email?: string
          fitness_goal?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          weight?: number | null
        }
        Relationships: []
      }
      strength_progress: {
        Row: {
          created_at: string
          exercise_name: string
          id: string
          recorded_date: string
          reps: number
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          exercise_name: string
          id?: string
          recorded_date?: string
          reps: number
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          exercise_name?: string
          id?: string
          recorded_date?: string
          reps?: number
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      trainer_videos: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_featured: boolean | null
          target_muscle: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_featured?: boolean | null
          target_muscle?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_featured?: boolean | null
          target_muscle?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string
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
      user_stats: {
        Row: {
          calories_burned: number
          created_at: string
          current_streak: number
          id: string
          last_workout_date: string | null
          steps_today: number
          updated_at: string
          user_id: string
          workouts_completed: number
        }
        Insert: {
          calories_burned?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_workout_date?: string | null
          steps_today?: number
          updated_at?: string
          user_id: string
          workouts_completed?: number
        }
        Update: {
          calories_burned?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_workout_date?: string | null
          steps_today?: number
          updated_at?: string
          user_id?: string
          workouts_completed?: number
        }
        Relationships: []
      }
      workout_completions: {
        Row: {
          completed: boolean
          created_at: string
          exercise_name: string
          id: string
          user_id: string
          workout_date: string
          workout_type: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          exercise_name: string
          id?: string
          user_id: string
          workout_date?: string
          workout_type: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          exercise_name?: string
          id?: string
          user_id?: string
          workout_date?: string
          workout_type?: string
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
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
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
