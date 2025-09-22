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
    password_hash: '$2a$10$8K1p/a0dURXAm7QiTRqUzuN0/S5ecC5RiJd4sKwks5uIZoWV611Om', // 31051988
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'c436d6b4-9311-47d1-9115-2a91909ade5c',
    name: 'Usuário 2',
    email: 'josepereiraguedes@yahoo.com.br',
    password_hash: '$2a$10$8K1p/a0dURXAm7QiTRqUzuN0/S5ecC5RiJd4sKwks5uIZoWV611Om', // 31052025
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
      // Buscar usuário nos usuários pré-cadastrados
      const user = PRE_REGISTERED_USERS.find(u => u.email === email);
      
      if (!user) {
        console.log('Usuário não encontrado:', email);
        return null;
      }
      
      // Verificar senha usando bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        console.log('Senha inválida para:', email);
        return null;
      }
      
      console.log('Autenticação bem-sucedida para:', email);
      return user;
    } catch (error) {
      console.error('Erro na autenticação:', error);
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
    return PRE_REGISTERED_USERS.find(u => u.id === id) || null;
  }
  
  /**
   * Atualiza o perfil do usuário
   * @param userId ID do usuário
   * @param updates Dados a serem atualizados
   * @returns Promise<LocalUser | null>
   */
  async updateUserProfile(userId: string, updates: Partial<LocalUser>): Promise<LocalUser | null> {
    try {
      const user = this.getUserById(userId);
      if (!user) {
        return null;
      }
      
      // Atualizar dados do usuário
      const updatedUser = {
        ...user,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Salvar no localStorage para persistência
      const users = this.getFromLocalStorage<LocalUser[]>('local_users', [...PRE_REGISTERED_USERS]);
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        this.saveToLocalStorage('local_users', users);
      } else {
        // Se o usuário não estiver no localStorage, adiciona
        users.push(updatedUser);
        this.saveToLocalStorage('local_users', users);
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return null;
    }
  }
  
  /**
   * Obtém dados do localStorage com fallback para valor padrão
   */
  private getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
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
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  }
}

// Instância singleton do serviço
export const localAuthService = new LocalAuthService();