import React, { createContext, useState, useEffect, useContext } from 'react';
import { localAuthService, LocalUser } from '../services/localAuth';
import { handleError } from '../utils/errorHandler';

interface AuthContextType {
  user: LocalUser | null;
  signIn: (email: string, password: string) => Promise<{ data: { user: LocalUser } | null; error: Error | null }>;
  signOut: () => Promise<void>;
  updateUser: (userId: string, updates: { name?: string; avatar_url?: string }) => Promise<LocalUser | null>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      console.log('🔄 Iniciando verificação de usuário...');
      
      // Pequeno atraso para garantir que o localStorage esteja disponível
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        // Verificar se há um usuário salvo no localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('👤 Usuário atual definido:', parsedUser?.id || 'null');
          setUser(parsedUser);
        } else {
          console.log('ℹ️ Nenhum usuário encontrado no localStorage');
          setUser(null);
        }
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
  }, []);
  
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentando login:', email);
      const user = await localAuthService.login(email, password);
      
      if (user) {
        console.log('✅ Login bem-sucedido:', user.id);
        setUser(user);
        // Salvar usuário no localStorage para persistência
        localStorage.setItem('user', JSON.stringify(user));
        return { data: { user }, error: null };
      } else {
        return { data: null, error: new Error('Credenciais inválidas') };
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Realizando logout');
      setUser(null);
      // Remover usuário do localStorage
      localStorage.removeItem('user');
      console.log('✅ Logout concluído');
    } catch (error: any) {
      console.error('❌ Erro no logout:', error);
      handleError(error, 'auth', true);
      throw error;
    }
  };

  const updateUser = async (userId: string, updates: { name?: string; avatar_url?: string }) => {
    try {
      const updatedUser = await localAuthService.updateUserProfile(userId, updates);
      
      // Atualizar o usuário no estado se for o usuário atual
      if (user && user.id === userId) {
        const newUser = {
          ...user,
          ...updates
        };
        setUser(newUser);
        // Atualizar no localStorage
        localStorage.setItem('user', JSON.stringify(newUser));
      }
      
      return updatedUser;
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