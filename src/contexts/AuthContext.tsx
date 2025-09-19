import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  supabase, 
  getCurrentUser, 
  signInWithEmail, 
  updateUserProfile,
  saveUserToStorage,
  removeUserFromStorage
} from '../services/supabase';
import { handleError } from '../utils/errorHandler';
import { AuthResponse } from '@supabase/supabase-js';

interface AuthContextType {
  user: any;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<any>;
  updateUser: (userId: string, updates: { name?: string; avatar_url?: string }) => Promise<any>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      console.log('🔄 Iniciando verificação de usuário...');
      
      // Pequeno atraso para garantir que o localStorage esteja disponível
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        const currentUser = await getCurrentUser();
        console.log('👤 Usuário atual definido:', currentUser?.id || 'null');
        setUser(currentUser);
      } catch (error: any) {
        console.error('❌ Erro ao verificar usuário:', error);
        // Em caso de erro, garantir que o usuário seja definido como null
        setUser(null);
      } finally {
        console.log('✅ Verificação de usuário concluída');
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('🔄 Estado de autenticação mudou:', _event, session?.user?.id || 'null');
        setUser(session?.user || null);
        setLoading(false);
      }
    );
    
    // Cleanup listener on unmount
    return () => {
      console.log('🧹 Limpando listener de autenticação');
      subscription.unsubscribe();
    };
  }, []);
  
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentando login:', email);
      const result = await signInWithEmail(email, password);
      
      if (result.data?.user) {
        console.log('✅ Login bem-sucedido:', result.data.user.id);
        setUser(result.data.user);
        // O usuário já foi salvo no localStorage pela função signInWithEmail
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Realizando logout');
      await supabase.auth.signOut();
      setUser(null);
      // Remover usuário do localStorage
      removeUserFromStorage();
      console.log('✅ Logout concluído');
      
      return { error: null };
    } catch (error: any) {
      console.error('❌ Erro no logout:', error);
      handleError(error, 'auth', true);
      throw error;
    }
  };

  const updateUser = async (userId: string, updates: { name?: string; avatar_url?: string }) => {
    try {
      const result = await updateUserProfile(userId, updates);
      
      // Atualizar o usuário no estado se for o usuário atual
      if (user && user.id === userId) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...updates
          }
        });
      }
      
      return result;
    } catch (error: any) {
      handleError(error, 'auth', true);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateUser, loading }}>
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