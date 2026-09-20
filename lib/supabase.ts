import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Standard client with anonymous public key for client & server operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key if available, falls back to anon client
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

export interface StudentRow {
  id: string;
  agent_id: string;
  name: string;
  prn: string;
  email: string;
  phone: string | null;
  college: string | null;
  team_name: string | null;
  team_size: string | null;
  domain: string;
  points: number;
  qr_code_url: string | null;
  checked_in?: boolean;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  registered_at: string;
  created_at?: string;
}

export interface PointTransactionRow {
  id: string;
  agent_id: string;
  event_id: string | null;
  points: number;
  reason: string;
  awarded_by: string;
  created_at: string;
}

export type TeamRole = "super_admin" | "coordinator" | "scanner" | "viewer";

export interface TeamMemberRow {
  id: number;
  user_id: string | null;
  name: string;
  email: string;
  role: TeamRole;
  department: string | null;
  active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at?: string;
}

export interface TeamAuditLogRow {
  id: number;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
