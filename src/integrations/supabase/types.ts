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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_query_logs: {
        Row: {
          ai_response: string
          book_id: string
          book_title: string
          chapter_id: string
          chapter_title: string
          created_at: string
          enterprise_id: string | null
          id: string
          model_used: string
          query_type: string
          response_time_ms: number
          tokens_used: number | null
          user_id: string | null
          user_prompt: string | null
        }
        Insert: {
          ai_response: string
          book_id: string
          book_title: string
          chapter_id: string
          chapter_title: string
          created_at?: string
          enterprise_id?: string | null
          id?: string
          model_used: string
          query_type: string
          response_time_ms: number
          tokens_used?: number | null
          user_id?: string | null
          user_prompt?: string | null
        }
        Update: {
          ai_response?: string
          book_id?: string
          book_title?: string
          chapter_id?: string
          chapter_title?: string
          created_at?: string
          enterprise_id?: string | null
          id?: string
          model_used?: string
          query_type?: string
          response_time_ms?: number
          tokens_used?: number | null
          user_id?: string | null
          user_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_query_logs_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      annotations: {
        Row: {
          book_id: string
          chapter_id: string
          chunk_index: number
          created_at: string
          id: string
          note: string
          text: string
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id: string
          chunk_index?: number
          created_at?: string
          id?: string
          note: string
          text: string
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string
          chunk_index?: number
          created_at?: string
          id?: string
          note?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          enterprise_id: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          target_id: string | null
          target_title: string | null
          target_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          enterprise_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_title?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          enterprise_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_title?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      book_access: {
        Row: {
          access_level: string
          book_id: string
          enterprise_id: string
          expires_at: string | null
          granted_at: string
          id: string
        }
        Insert: {
          access_level?: string
          book_id: string
          enterprise_id: string
          expires_at?: string | null
          granted_at?: string
          id?: string
        }
        Update: {
          access_level?: string
          book_id?: string
          enterprise_id?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_access_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      book_chapters: {
        Row: {
          book_id: string
          chapter_key: string
          content: string | null
          created_at: string
          id: string
          page_number: number | null
          sort_order: number | null
          tags: string[] | null
          title: string
        }
        Insert: {
          book_id: string
          chapter_key: string
          content?: string | null
          created_at?: string
          id?: string
          page_number?: number | null
          sort_order?: number | null
          tags?: string[] | null
          title: string
        }
        Update: {
          book_id?: string
          chapter_key?: string
          content?: string | null
          created_at?: string
          id?: string
          page_number?: number | null
          sort_order?: number | null
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          book_id: string
          book_title: string
          chapter_id: string
          chapter_title: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          book_title: string
          chapter_id: string
          chapter_title: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          book_title?: string
          chapter_id?: string
          chapter_title?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          access_count: number | null
          authors: string[]
          chapter_count: number | null
          cover_color: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          edition: string | null
          file_path: string | null
          file_type: string | null
          id: string
          isbn: string | null
          published_year: number | null
          publisher: string | null
          search_count: number | null
          specialty: string | null
          subtitle: string | null
          tags: string[] | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          access_count?: number | null
          authors?: string[]
          chapter_count?: number | null
          cover_color?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          edition?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          isbn?: string | null
          published_year?: number | null
          publisher?: string | null
          search_count?: number | null
          specialty?: string | null
          subtitle?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          access_count?: number | null
          authors?: string[]
          chapter_count?: number | null
          cover_color?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          edition?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          isbn?: string | null
          published_year?: number | null
          publisher?: string | null
          search_count?: number | null
          specialty?: string | null
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      collection_books: {
        Row: {
          added_at: string
          book_id: string
          collection_id: string
          id: string
        }
        Insert: {
          added_at?: string
          book_id: string
          collection_id: string
          id?: string
        }
        Update: {
          added_at?: string
          book_id?: string
          collection_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_books_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "compliance_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_collections: {
        Row: {
          category: string
          created_at: string
          description: string | null
          enterprise_id: string | null
          icon: string | null
          id: string
          is_system_bundle: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          enterprise_id?: string | null
          icon?: string | null
          id?: string
          is_system_bundle?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          enterprise_id?: string | null
          icon?: string | null
          id?: string
          is_system_bundle?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_collections_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          enterprise_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enterprise_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enterprise_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_locations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          enterprise_id: string
          id: string
          name: string
          state: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          enterprise_id: string
          id?: string
          name: string
          state?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          enterprise_id?: string
          id?: string
          name?: string
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_locations_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprises: {
        Row: {
          contact_email: string | null
          created_at: string
          domain: string | null
          id: string
          is_active: boolean
          license_seats: number
          licensing_tier: string | null
          logo_color: string | null
          name: string
          type: Database["public"]["Enums"]["enterprise_type"]
          updated_at: string
          used_seats: number
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          license_seats?: number
          licensing_tier?: string | null
          logo_color?: string | null
          name: string
          type?: Database["public"]["Enums"]["enterprise_type"]
          updated_at?: string
          used_seats?: number
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          license_seats?: number
          licensing_tier?: string | null
          logo_color?: string | null
          name?: string
          type?: Database["public"]["Enums"]["enterprise_type"]
          updated_at?: string
          used_seats?: number
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          enabled: boolean
          key: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          key: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          key?: string
        }
        Relationships: []
      }
      highlights: {
        Row: {
          book_id: string
          chapter_id: string
          chunk_index: number
          color: string
          created_at: string
          id: string
          text: string
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id: string
          chunk_index?: number
          color?: string
          created_at?: string
          id?: string
          text: string
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string
          chunk_index?: number
          color?: string
          created_at?: string
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      individual_purchases: {
        Row: {
          book_id: string
          id: string
          price_paid: number
          purchased_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          id?: string
          price_paid: number
          purchased_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          id?: string
          price_paid?: number
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          enterprise_id: string | null
          full_name: string | null
          id: string
          is_active: boolean
          job_title: string | null
          location_id: string | null
          pending_reason: string | null
          role: Database["public"]["Enums"]["enterprise_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          enterprise_id?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          job_title?: string | null
          location_id?: string | null
          pending_reason?: string | null
          role?: Database["public"]["Enums"]["enterprise_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          enterprise_id?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          location_id?: string | null
          pending_reason?: string | null
          role?: Database["public"]["Enums"]["enterprise_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "enterprise_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          contact_email: string
          contact_name: string
          created_at: string
          domain: string | null
          estimated_users: number
          id: string
          institution_name: string
          message: string | null
          status: string
          tier_requested: string
          updated_at: string
        }
        Insert: {
          contact_email: string
          contact_name: string
          created_at?: string
          domain?: string | null
          estimated_users?: number
          id?: string
          institution_name: string
          message?: string | null
          status?: string
          tier_requested?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string
          contact_name?: string
          created_at?: string
          domain?: string | null
          estimated_users?: number
          id?: string
          institution_name?: string
          message?: string | null
          status?: string
          tier_requested?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          enterprise_id: string | null
          expires_at: string | null
          id: string
          monthly_price: number | null
          plan_type: string
          started_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          enterprise_id?: string | null
          expires_at?: string | null
          id?: string
          monthly_price?: number | null
          plan_type: string
          started_at?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          enterprise_id?: string | null
          expires_at?: string | null
          id?: string
          monthly_price?: number | null
          plan_type?: string
          started_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_events: {
        Row: {
          book_id: string | null
          book_title: string | null
          created_at: string
          enterprise_id: string | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          book_id?: string | null
          book_title?: string | null
          created_at?: string
          enterprise_id?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          book_id?: string | null
          book_title?: string | null
          created_at?: string
          enterprise_id?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      user_department_membership: {
        Row: {
          created_at: string
          department_id: string
          id: string
          is_primary: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          is_primary?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          is_primary?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_department_membership_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_department_membership_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_pending_users: {
        Args: { p_enterprise_id: string }
        Returns: number
      }
      assign_role: {
        Args: {
          p_new_role: Database["public"]["Enums"]["enterprise_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      create_subscription: {
        Args: { p_enterprise_id: string; p_plan_type: string; p_seats: number }
        Returns: string
      }
      get_user_enterprise_id: { Args: { user_uuid: string }; Returns: string }
      has_book_access: {
        Args: { target_book_id: string; user_uuid: string }
        Returns: boolean
      }
      has_enterprise_role: {
        Args: {
          required_role: Database["public"]["Enums"]["enterprise_role"]
          user_uuid: string
        }
        Returns: boolean
      }
      is_compliance_officer: { Args: { user_uuid: string }; Returns: boolean }
      is_enterprise_admin: { Args: { user_uuid: string }; Returns: boolean }
      is_platform_admin: { Args: { user_uuid: string }; Returns: boolean }
      log_system_event: {
        Args: {
          p_enterprise_id?: string
          p_event_type: string
          p_metadata?: Json
          p_user_id?: string
        }
        Returns: undefined
      }
      update_subscription: {
        Args: {
          p_enterprise_id: string
          p_new_plan?: string
          p_new_seats: number
        }
        Returns: undefined
      }
    }
    Enums: {
      enterprise_role:
        | "admin"
        | "compliance_officer"
        | "department_manager"
        | "staff"
      enterprise_type:
        | "hospital"
        | "medical_school"
        | "government"
        | "individual"
      platform_role: "platform_admin" | "user" | "rittenhouse_management"
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
      enterprise_role: [
        "admin",
        "compliance_officer",
        "department_manager",
        "staff",
      ],
      enterprise_type: [
        "hospital",
        "medical_school",
        "government",
        "individual",
      ],
      platform_role: ["platform_admin", "user", "rittenhouse_management"],
    },
  },
} as const
