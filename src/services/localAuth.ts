import bcrypt from 'bcryptjs';

// Interface para usuário local
export interface LocalUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Usuários pré-cadastrados
const PRE_REGISTERED_USERS: LocalUser[] = [
  {
    id: 'c5539cba-f202-42cd-a31c-5b53eca09cb7',
    name: 'Usuário 1',
    email: 'pereiraguedes1988@gmail.com',
    password_hash: '$2a$10$AU.E8u5xSnMnkwKNkr/JteRieELWZwi5WP8zRhVkJxGhjuMQnFjVy', // 31051988
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'c436d6b4-9311-47d1-9115-2a91909ade5c',
    name: 'Usuário 2',
    email: 'josepereiraguedes@yahoo.com.br',
    password_hash: '$2a$10$YE/gypSViqRQxE/DCSYYreYCiucXODtgxUssxFE9rBDm7.mQfjPCO', // 31052025
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
  }
];

/**
 * Serviço para autenticação local
 */
class LocalAuthService {
  /**
   * Realiza o login do usuário
   * @param email E-mail do usuário
   * @param password Senha do usuário
   * @returns Promise<LocalUser | null>
   */
  async login(email: string, password: string): Promise<LocalUser | null> {
    try {
      console.log('🔍 Tentando login para:', email);
      
      // Buscar usuário nos usuários pré-cadastrados
      let user = PRE_REGISTERED_USERS.find(u => u.email === email);
      
      // Se não encontrar nos pré-cadastrados, verificar no localStorage
      if (!user) {
        const localUsers = this.getFromLocalStorage<LocalUser[]>('local_users', []);
        user = localUsers.find(u => u.email === email);
      }
      
      if (!user) {
        console.log('❌ Usuário não encontrado:', email);
        return null;
      }
      
      console.log('👤 Usuário encontrado:', user.email, 'ID:', user.id);
      console.log('🔑 Hash armazenado:', user.password_hash);
      console.log('🔓 Senha fornecida:', password);
      
      // Verificar senha usando bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      console.log('✅ Senha válida:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ Senha inválida para:', email);
        return null;
      }
      
      console.log('🎉 Autenticação bem-sucedida para:', email, 'ID:', user.id);
      
      // Verificar se há uma versão atualizada do usuário no localStorage
      const localUsers = this.getFromLocalStorage<LocalUser[]>('local_users', []);
      const updatedUser = localUsers.find(u => u.id === user!.id);
      
      if (updatedUser) {
        console.log('🔄 Usando versão atualizada do usuário do localStorage:', updatedUser);
        return updatedUser;
      }
      
      return {
        ...user,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      console.error('💥 Erro na autenticação:', error);
      return null;
    }
  }
  
  /**
   * Obtém os usuários pré-cadastrados
   * @returns Array de usuários
   */
  getPreRegisteredUsers(): LocalUser[] {
    return [...PRE_REGISTERED_USERS];
  }
  
  /**
   * Obtém um usuário pelo ID
   * @param id ID do usuário
   * @returns Usuário ou null
   */
  getUserById(id: string): LocalUser | null {
    // Primeiro verificar no localStorage
    const localUsers = this.getFromLocalStorage<LocalUser[]>('local_users', []);
    const localUser = localUsers.find(u => u.id === id);
    if (localUser) {
      console.log('👤 Usuário encontrado no localStorage:', localUser);
      return localUser;
    }
    
    // Se não encontrar no localStorage, verificar nos pré-cadastrados
    const preRegisteredUser = PRE_REGISTERED_USERS.find(u => u.id === id);
    if (preRegisteredUser) {
      console.log('👤 Usuário encontrado nos pré-cadastrados:', preRegisteredUser);
      return preRegisteredUser;
    }
    
    console.log('❌ Usuário não encontrado para ID:', id);
    return null;
  }
  
  /**
   * Atualiza o perfil do usuário
   * @param userId ID do usuário
   * @param updates Dados a serem atualizados
   * @returns Promise<LocalUser | null>
   */
  async updateUserProfile(userId: string, updates: Partial<LocalUser>): Promise<LocalUser | null> {
    try {
      console.log('🔄 Atualizando perfil do usuário:', userId, updates);
      
      // Obter usuários do localStorage
      let users = this.getFromLocalStorage<LocalUser[]>('local_users', []);
      console.log('📂 Usuários atuais no localStorage:', users);
      
      // Encontrar o usuário
      const userIndex = users.findIndex(u => u.id === userId);
      
      let updatedUser: LocalUser;
      
      if (userIndex === -1) {
        // Se o usuário não existir no localStorage, pode ser um usuário pré-cadastrado
        const preRegisteredUser = PRE_REGISTERED_USERS.find(u => u.id === userId);
        if (preRegisteredUser) {
          // Criar uma cópia do usuário pré-cadastrado no localStorage
          updatedUser = {
            ...preRegisteredUser,
            ...updates,
            updated_at: new Date().toISOString()
          };
          users.push(updatedUser);
          console.log('🆕 Adicionando usuário pré-cadastrado ao localStorage:', updatedUser);
        } else {
          console.log('❌ Usuário não encontrado para atualização:', userId);
          return null;
        }
      } else {
        // Atualizar dados do usuário existente
        updatedUser = {
          ...users[userIndex],
          ...updates,
          updated_at: new Date().toISOString()
        };
        users[userIndex] = updatedUser;
        console.log('✏️ Atualizando usuário existente no localStorage:', updatedUser);
      }
      
      // Salvar no localStorage para persistência
      this.saveToLocalStorage('local_users', users);
      
      console.log('✅ Usuário atualizado e salvo no localStorage:', updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('💥 Erro ao atualizar perfil:', error);
      return null;
    }
  }
  
  /**
   * Atualiza as credenciais do usuário (senha)
   * @param userId ID do usuário
   * @param currentPassword Senha atual
   * @param newPassword Nova senha
   * @returns Promise<boolean>
   */
  async updateUserCredentials(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      console.log('🔄 Atualizando credenciais do usuário:', userId);
      
      // Obter o usuário atual
      const currentUser = this.getUserById(userId);
      if (!currentUser) {
        console.log('❌ Usuário não encontrado para atualização de credenciais:', userId);
        return false;
      }
      
      // Verificar se a senha atual está correta
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password_hash);
      if (!isCurrentPasswordValid) {
        console.log('❌ Senha atual inválida para usuário:', userId);
        return false;
      }
      
      // Gerar hash da nova senha
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      
      // Atualizar a senha do usuário
      const updatedUser = {
        ...currentUser,
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      };
      
      // Obter usuários do localStorage
      let users = this.getFromLocalStorage<LocalUser[]>('local_users', []);
      
      // Se não houver usuários no localStorage, usar os pré-cadastrados como base
      if (users.length === 0) {
        users = [...PRE_REGISTERED_USERS];
      }
      
      // Encontrar o usuário
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        // Se o usuário não existir no localStorage, adicionar
        users.push(updatedUser);
      } else {
        // Atualizar o usuário existente
        users[userIndex] = updatedUser;
      }
      
      // Salvar no localStorage para persistência
      this.saveToLocalStorage('local_users', users);
      
      console.log('✅ Credenciais do usuário atualizadas e salvas no localStorage:', userId);
      
      return true;
    } catch (error) {
      console.error('💥 Erro ao atualizar credenciais:', error);
      return false;
    }
  }
  
  /**
   * Obtém dados do localStorage com fallback para valor padrão
   */
  private getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      console.log(`📥 Obtendo ${key} do localStorage:`, item ? item.substring(0, 100) + '...' : 'null');
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao obter ${key} do localStorage:`, error);
      return defaultValue;
    }
  }
  
  /**
   * Salva dados no localStorage
   */
  private saveToLocalStorage<T>(key: string, value: T): void {
    try {
      console.log(`💾 Salvando ${key} no localStorage. Tamanho:`, JSON.stringify(value).length);
      localStorage.setItem(key, JSON.stringify(value));
      console.log(`✅ ${key} salvo com sucesso no localStorage`);
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  }
}

// Instância singleton do serviço
export const localAuthService = new LocalAuthService();