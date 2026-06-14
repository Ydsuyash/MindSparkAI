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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      adaptive_scores: {
        Row: {
          difficulty_level: number
          rolling_accuracy: number
          rolling_reaction_ms: number
          sessions_count: number
          skill: string
          updated_at: string
          user_id: string
        }
        Insert: {
          difficulty_level?: number
          rolling_accuracy?: number
          rolling_reaction_ms?: number
          sessions_count?: number
          skill: string
          updated_at?: string
          user_id: string
        }
        Update: {
          difficulty_level?: number
          rolling_accuracy?: number
          rolling_reaction_ms?: number
          sessions_count?: number
          skill?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          created_at: string
          id: string
          kind: string
          payload: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          payload: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          payload?: Json
          user_id?: string
        }
        Relationships: []
      }
      companion_preferences: {
        Row: {
          background_music: boolean
          companion: string
          sound_effects: boolean
          theme: string
          updated_at: string
          user_id: string
          voice_enabled: boolean
        }
        Insert: {
          background_music?: boolean
          companion?: string
          sound_effects?: boolean
          theme?: string
          updated_at?: string
          user_id: string
          voice_enabled?: boolean
        }
        Update: {
          background_music?: boolean
          companion?: string
          sound_effects?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
          voice_enabled?: boolean
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          accuracy: number
          completed: boolean
          created_at: string
          difficulty_level: number
          duration_sec: number
          game_id: string
          id: string
          mistakes: number
          reaction_ms: number
          score: number
          skill: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          accuracy?: number
          completed?: boolean
          created_at?: string
          difficulty_level?: number
          duration_sec?: number
          game_id: string
          id?: string
          mistakes?: number
          reaction_ms?: number
          score?: number
          skill: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          accuracy?: number
          completed?: boolean
          created_at?: string
          difficulty_level?: number
          duration_sec?: number
          game_id?: string
          id?: string
          mistakes?: number
          reaction_ms?: number
          score?: number
          skill?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number
          avatar: string
          child_name: string
          companion: string
          created_at: string
          id: string
          last_active_date: string | null
          level: number
          onboarded: boolean
          streak_days: number
          updated_at: string
          xp: number
        }
        Insert: {
          age?: number
          avatar?: string
          child_name?: string
          companion?: string
          created_at?: string
          id: string
          last_active_date?: string | null
          level?: number
          onboarded?: boolean
          streak_days?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          age?: number
          avatar?: string
          child_name?: string
          companion?: string
          created_at?: string
          id?: string
          last_active_date?: string | null
          level?: number
          onboarded?: boolean
          streak_days?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      tutorial_progress: {
        Row: {
          completed: boolean
          completed_at: string
          game_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string
          game_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string
          game_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
