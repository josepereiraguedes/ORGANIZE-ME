import { createClient } from '@supabase/supabase-js';
import { handleError } from '../utils/errorHandler';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  handleError(new Error("Supabase URL and Anon Key must be defined in .env file"), 'supabaseConfig');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções de autenticação

export const signUp = async (email: string, password: string) => {
  try {
    const result = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `http://localhost:5174/confirm.html`
      }
    });
    
    if (result.error) {
      throw new Error(`Erro de cadastro: ${result.error.message}`);
    }
    
    return result;
  } catch (error) {
    // Tratar especificamente o erro de rate limit
    if (error instanceof Error && error.message.includes('For security purposes, you can only request this after')) {
      throw new Error('Você está tentando criar conta muito rapidamente. Por favor, aguarde um momento e tente novamente.');
    }
    handleError(error, 'auth', true);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    // Tentar fazer login diretamente
    const result = await supabase.auth.signInWithPassword({ email, password });
    
    if (result.error) {
      // Tratar erro de email não confirmado
      if (result.error.message.includes('Email not confirmed')) {
        throw new Error('Por favor, verifique seu email e confirme sua conta antes de fazer login.');
      }
      throw new Error(`Erro de login: ${result.error.message}`);
    }
    
    return result;
  } catch (error) {
    handleError(error, 'auth', true);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const result = await supabase.auth.signOut();
    
    if (result.error) {
      throw new Error(`Falha ao sair: ${result.error.message}`);
    }
    
    return result;
  } catch (error) {
    handleError(error, 'auth', true);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      // Se o erro for "Auth session missing", isso é esperado quando o usuário não está logado
      if (error.message.includes('Auth session missing')) {
        return null; // Não há usuário logado, o que é normal
      }
      throw new Error(`Falha ao obter usuário: ${error.message}`);
    }
    
    return data.user;
  } catch (error) {
    handleError(error, 'auth', true);
    throw error;
  }
};