import { createClient } from '@supabase/supabase-js';
import { handleError } from '../utils/errorHandler';

// Garantir que as variáveis de ambiente sejam carregadas corretamente no contexto do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error("Supabase URL and Anon Key must be defined in .env file");
  handleError(error, 'supabaseConfig');
  throw error;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções de autenticação

export const signUp = async (email: string, password: string) => {
  try {
    // Remover completamente a verificação de e-mail para simplificar o cadastro
    const result = await supabase.auth.signUp({ 
      email, 
      password
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
    // Tentar fazer login diretamente - ignorar status de confirmação de email
    const result = await supabase.auth.signInWithPassword({ email, password });
    
    if (result.error) {
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