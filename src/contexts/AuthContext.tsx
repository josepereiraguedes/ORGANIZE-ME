import React, { createContext, useState, useEffect, useContext } from 'react';
import { localAuthService, LocalUser } from '../services/localAuth';
import { handleError } from '../utils/errorHandler';

interface AuthContextType {
  user: LocalUser | null;
  signIn: (email: string, password: string) => Promise<{ data: { user: LocalUser } | null; error: Error | null }>;
  signOut: () => Promise<void>;
  updateUser: (userId: string, updates: Partial<LocalUser>) => Promise<LocalUser | null>;
  updateUserCredentials: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>;
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
        console.log('💾 Dados do usuário no localStorage:', storedUser ? storedUser.substring(0, 100) + '...' : 'null');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('👤 Usuário atual definido:', parsedUser?.id || 'null');
          console.log('📧 Email do usuário:', parsedUser?.email || 'null');
          
          // Verificar se há uma versão atualizada do usuário no localStorage
          if (parsedUser.id) {
            console.log('🔍 Verificando se há versão atualizada do usuário:', parsedUser.id);
            const updatedUser = localAuthService.getUserById(parsedUser.id);
            if (updatedUser) {
              console.log('🔄 Usuário atualizado encontrado:', updatedUser);
              setUser(updatedUser);
              // Atualizar o localStorage com a versão mais recente
              localStorage.setItem('user', JSON.stringify(updatedUser));
              console.log('💾 Usuário atualizado salvo no localStorage');
            } else {
              console.log('ℹ️ Nenhuma versão atualizada encontrada, usando usuário do localStorage');
              setUser(parsedUser);
            }
          } else {
            console.log('ℹ️ Usuário sem ID, usando dados do localStorage');
            setUser(parsedUser);
          }
        } else {
          console.log('ℹ️ Nenhum usuário encontrado no localStorage');
          setUser(null);
        }
      } catch (error: any) {
        console.error('❌ Erro ao verificar usuário:', error);
        // Em caso de erro, garantir que o usuário seja definido como null
        setUser(null);
      } finally {
        console.log('✅ Verificação de usuário concluída. Usuário atual no estado:', user);
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);
  
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentando login:', email);
      const result = await localAuthService.login(email, password);
      
      if (result) {
        console.log('✅ Login bem-sucedido:', result.id);
        setUser(result);
        // Salvar usuário no localStorage para persistência
        try {
          localStorage.setItem('user', JSON.stringify(result));
          console.log('💾 Usuário salvo no localStorage com ID:', result.id);
          
          // Verificar se o usuário foi salvo corretamente
          const savedUser = localStorage.getItem('user');
          console.log('🔍 Verificação de salvamento do usuário:', savedUser ? savedUser.substring(0, 100) + '...' : 'null');
        } catch (storageError) {
          console.error('❌ Erro ao salvar usuário no localStorage:', storageError);
        }
        return { data: { user: result }, error: null };
      } else {
        console.log('❌ Credenciais inválidas para:', email);
        return { data: null, error: new Error('Credenciais inválidas') };
      }
    } catch (error: any) {
      console.error('💥 Erro no login:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Realizando logout. Usuário atual:', user);
      setUser(null);
      // Remover usuário do localStorage
      try {
        localStorage.removeItem('user');
        console.log('💾 Usuário removido do localStorage');
        
        // Verificar se o usuário foi removido corretamente
        const savedUser = localStorage.getItem('user');
        console.log('🔍 Verificação após remoção do usuário:', savedUser);
      } catch (storageError) {
        console.error('❌ Erro ao remover usuário do localStorage:', storageError);
      }
      console.log('✅ Logout concluído');
    } catch (error: any) {
      console.error('❌ Erro no logout:', error);
      handleError(error, 'auth', true);
      throw error;
    }
  };

  const updateUser = async (userId: string, updates: Partial<LocalUser>) => {
    try {
      console.log('🔄 Atualizando usuário:', userId, updates);
      const updatedUser = await localAuthService.updateUserProfile(userId, updates);
      
      // Atualizar o usuário no estado se for o usuário atual
      if (user && user.id === userId && updatedUser) {
        const newUser = {
          ...user,
          ...updates,
          updated_at: updatedUser.updated_at
        };
        setUser(newUser);
        // Atualizar no localStorage
        localStorage.setItem('user', JSON.stringify(newUser));
        console.log('💾 Usuário atualizado no localStorage');
      }
      
      return updatedUser;
    } catch (error: any) {
      handleError(error, 'auth', true);
      throw error;
    }
  };

  const updateUserCredentials = async (userId: string, currentPassword: string, newPassword: string) => {
    try {
      console.log('🔄 Atualizando credenciais do usuário:', userId);
      const success = await localAuthService.updateUserCredentials(userId, currentPassword, newPassword);
      
      if (success && user && user.id === userId) {
        // Se a atualização foi bem-sucedida e é o usuário atual, precisamos atualizar o hash da senha
        // Nota: Na prática, não devemos armazenar o hash da senha no localStorage por motivos de segurança
        // Mas para fins de demonstração neste sistema local, vamos atualizar
        console.log('✅ Credenciais atualizadas com sucesso');
      }
      
      return success;
    } catch (error: any) {
      handleError(error, 'auth', true);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateUser, updateUserCredentials, loading }}>
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