export interface Database {
  public: {
    Tables: {
      operators: {
        Row: {
          id: string
          name: string
          code: string
          ussd_config: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          ussd_config: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          ussd_config?: Json
          is_active?: boolean
          updated_at?: string
        }
      }
      distributors: {
        Row: {
          id: string
          name: string
          contact_info: Json
          credit_balance: number
          commission_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_info: Json
          credit_balance?: number
          commission_rate: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_info?: Json
          credit_balance?: number
          commission_rate?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      sims: {
        Row: {
          id: string
          operator_id: string
          phone_number: string
          status: 'active' | 'inactive' | 'maintenance'
          balance: number
          last_used: string | null
          modem_port: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          operator_id: string
          phone_number: string
          status?: 'active' | 'inactive' | 'maintenance'
          balance?: number
          last_used?: string | null
          modem_port?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          operator_id?: string
          phone_number?: string
          status?: 'active' | 'inactive' | 'maintenance'
          balance?: number
          last_used?: string | null
          modem_port?: string | null
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          phone: string
          name: string | null
          segment: 'VIP' | 'REGULAR' | 'NEW' | 'RISK'
          risk_score: number
          total_transactions: number
          total_amount: number
          average_amount: number
          frequency: number
          last_activity: string | null
          preferred_operator: string | null
          behavior_patterns: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          name?: string | null
          segment?: 'VIP' | 'REGULAR' | 'NEW' | 'RISK'
          risk_score?: number
          total_transactions?: number
          total_amount?: number
          average_amount?: number
          frequency?: number
          last_activity?: string | null
          preferred_operator?: string | null
          behavior_patterns?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          name?: string | null
          segment?: 'VIP' | 'REGULAR' | 'NEW' | 'RISK'
          risk_score?: number
          total_transactions?: number
          total_amount?: number
          average_amount?: number
          frequency?: number
          last_activity?: string | null
          preferred_operator?: string | null
          behavior_patterns?: Json
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          client_id: string
          operator_id: string
          sim_id: string | null
          distributor_id: string
          amount: number
          commission: number
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          recipient_phone: string
          ussd_response: string | null
          error_message: string | null
          retry_count: number
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          operator_id: string
          sim_id?: string | null
          distributor_id: string
          amount: number
          commission: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          recipient_phone: string
          ussd_response?: string | null
          error_message?: string | null
          retry_count?: number
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          operator_id?: string
          sim_id?: string | null
          distributor_id?: string
          amount?: number
          commission?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          recipient_phone?: string
          ussd_response?: string | null
          error_message?: string | null
          retry_count?: number
          updated_at?: string
          completed_at?: string | null
        }
      }
      pricing_rules: {
        Row: {
          id: string
          operator_id: string
          client_segment: 'VIP' | 'REGULAR' | 'NEW' | 'RISK' | 'ALL'
          min_amount: number
          max_amount: number | null
          commission_rate: number
          fixed_commission: number | null
          is_active: boolean
          valid_from: string
          valid_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          operator_id: string
          client_segment: 'VIP' | 'REGULAR' | 'NEW' | 'RISK' | 'ALL'
          min_amount: number
          max_amount?: number | null
          commission_rate: number
          fixed_commission?: number | null
          is_active?: boolean
          valid_from: string
          valid_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          operator_id?: string
          client_segment?: 'VIP' | 'REGULAR' | 'NEW' | 'RISK' | 'ALL'
          min_amount?: number
          max_amount?: number | null
          commission_rate?: number
          fixed_commission?: number | null
          is_active?: boolean
          valid_from?: string
          valid_until?: string | null
          updated_at?: string
        }
      }
      client_analytics: {
        Row: {
          id: string
          client_id: string
          date: string
          transactions_count: number
          total_amount: number
          avg_amount: number
          success_rate: number
          preferred_hours: number[]
          risk_indicators: Json
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          date: string
          transactions_count: number
          total_amount: number
          avg_amount: number
          success_rate: number
          preferred_hours: number[]
          risk_indicators: Json
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          date?: string
          transactions_count?: number
          total_amount?: number
          avg_amount?: number
          success_rate?: number
          preferred_hours?: number[]
          risk_indicators?: Json
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
  }
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]