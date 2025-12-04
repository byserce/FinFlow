export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// This file is intentionally left with a placeholder as Supabase types are removed.
// A complete reset would involve deleting the file, but we keep it to avoid breaking imports.

export type Database = {
  public: {
    Tables: {
      budget_plans: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
        }
      },
      budget_transactions: {
        Row: {
          id: string
          plan_id: string
          author_id: string
          amount: number
          type: "income" | "expense"
          category: string
          date: string
          note: string | null
          created_at: string
        }
      },
      budget_profiles: {
        Row: {
          id: string
          display_name: string | null
          email: string | null
          photo_url: string | null
        }
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
