import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, getCurrentUser } from '../services/supabase';
import { handleError } from '../utils/errorHandler';

interface AuthContextType {
  user: any;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>; // Corrigido o tipo de retorno
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Se for o erro esperado de sessão ausente, não é necessário mostrar um erro
        if (error instanceof Error && !error.message.includes('Auth session missing')) {
          handleError(error, 'auth', true);
        }
        // Em caso de erro, garantir que o usuário seja definido como null
        setUser(null);
      } finally {
        setLoading(false);
      }
      
      // Listener para mudanças no estado de autenticação
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      });
      
      // Cleanup listener on unmount
      return () => {
        authListener?.subscription.unsubscribe();
      };
    };
    
    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      
      if (result.error) {
        throw new Error(`Erro de login: ${result.error.message}`);
      }
      
      return result;
    } catch (error) {
      // Remover o tratamento de erro aqui, pois já está sendo tratado no LoginForm
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
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
      handleError(error, 'auth', true);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const result = await supabase.auth.signOut();
      
      if (result.error) {
        throw new Error(`Erro ao sair: ${result.error.message}`);
      }
      
      setUser(null);
      return result; // Retornar o resultado em vez de undefined
    } catch (error) {
      handleError(error, 'auth', true);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};