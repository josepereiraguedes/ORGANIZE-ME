import { createClient } from '@supabase/supabase-js'

// Tipos para as tabelas do Supabase
export interface SupabaseLogin {
  id: string
  title: string
  username: string
  password: string
  url: string
  category: string
  notes: string
  created_at: string
  updated_at: string
}

export interface SupabaseTask {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in-progress' | 'done'
  due_date: string
  category: string
  created_at: string
  updated_at: string
}

export interface SupabaseRoutine {
  id: string
  title: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  days: string[] // Array de dias da semana
  active: boolean
  created_at: string
  updated_at: string
}

export interface SupabaseNote {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface SupabaseFavorite {
  id: string
  title: string
  url: string
  category: string
  notes: string
  created_at: string
  updated_at: string
}

// Obter as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar as variáveis de ambiente
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Criar o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)