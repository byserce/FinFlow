export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      budget_plans: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          join_code: string | null
          mode: "tracking" | "sharing"
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          join_code?: string | null
          mode?: "tracking" | "sharing"
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          join_code?: string | null
          mode?: "tracking" | "sharing"
        }
      },
      budget_transactions: {
        Row: {
          id: string
          plan_id: string
          author_id: string
          payer_id: string | null
          amount: number
          type: "income" | "expense"
          category: string
          date: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          author_id: string
          payer_id?: string | null
          amount: number
          type: "income" | "expense"
          category: string
          date: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          author_id?: string
          payer_id?: string | null
          amount?: number
          type?: "income" | "expense"
          category?: string
          date?: string
          note?: string | null
          created_at?: string
        }
      },
      budget_profiles: {
        Row: {
          id: string
          display_name: string | null
          email: string | null
          photo_url: string | null
          password?: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          email?: string | null
          photo_url?: string | null
          password?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          email?: string | null
          photo_url?: string | null
          password?: string | null
        }
      },
      budget_members: {
        Row: {
            plan_id: string
            user_id: string
            role: "owner" | "editor" | "viewer"
            created_at: string
            status: "pending" | "accepted" | "rejected"
        },
        Insert: {
            plan_id: string
            user_id: string
            role?: "owner" | "editor" | "viewer"
            created_at?: string
            status?: "pending" | "accepted" | "rejected"
        },
        Update: {
            plan_id?: string
            user_id?: string
            role?: "owner" | "editor" | "viewer"
            created_at?: string
            status?: "pending" | "accepted" | "rejected"
        }
      },
      transaction_participants: {
          Row: {
              transaction_id: string
              user_id: string
          },
          Insert: {
              transaction_id: string
              user_id: string
          },
          Update: {
              transaction_id?: string
              user_id?: string
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
