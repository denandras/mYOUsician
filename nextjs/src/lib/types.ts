export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {      instruments: {
        Row: {
          id: string
          name: string
          name_hun: string | null
          category: string
          category_hun: string | null
          category_rank: number | null
          instrument_rank: number | null
        }
        Insert: {
          id?: string
          name: string
          name_hun?: string | null
          category: string
          category_hun?: string | null
          category_rank?: number | null
          instrument_rank?: number | null
        }
        Update: {
          id?: string
          name?: string
          name_hun?: string | null
          category?: string
          category_hun?: string | null
          category_rank?: number | null
          instrument_rank?: number | null
        }
        Relationships: []
      }
      genres: {
        Row: {
          id: string
          name: string
          name_HUN: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_HUN?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_HUN?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          id: string
          name: string
          name_HUN: string | null
          rank: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_HUN?: string | null
          rank?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_HUN?: string | null
          rank?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      musician_profiles: {
        Row: {
          id: string
          email: string | null
          forename: string | null
          surname: string | null
          location: Json | null
          phone: string | null
          bio: string | null
          occupation: string[] | null
          education: string[] | null
          certificates: string[] | null
          genre_instrument: Json[] | null
          video_links: string[] | null
          social: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          forename?: string | null
          surname?: string | null
          location?: Json | null
          phone?: string | null
          bio?: string | null
          occupation?: string[] | null
          education?: string[] | null
          certificates?: string[] | null
          genre_instrument?: Json[] | null
          video_links?: string[] | null
          social?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          forename?: string | null
          surname?: string | null
          location?: Json | null
          phone?: string | null
          bio?: string | null
          occupation?: string[] | null
          education?: string[] | null
          certificates?: string[] | null
          genre_instrument?: Json[] | null
          video_links?: string[] | null
          social?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "musician_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
