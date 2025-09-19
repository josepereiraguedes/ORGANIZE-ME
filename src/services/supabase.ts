import { createClient, AuthResponse } from '@supabase/supabase-js';
import { handleError } from '../utils/errorHandler';
import bcrypt from 'bcryptjs';

// Garantir que as variáveis de ambiente sejam carregadas corretamente no contexto do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'CONFIGURADA' : 'NÃO CONFIGURADA');

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = !supabaseUrl 
    ? "Supabase URL não está definida. Configure VITE_SUPABASE_URL no arquivo .env" 
    : "Supabase Anon Key não está definida. Configure VITE_SUPABASE_ANON_KEY no arquivo .env";
  
  console.error('❌ Erro de configuração do Supabase:', errorMessage);
  const error = new Error(errorMessage);
  handleError(error, 'supabaseConfig');
  throw error;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função de login personalizada com Supabase Auth
export const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Tentando login com:', email);
    
    // Primeiro, tentar autenticação personalizada (mais confiável para nosso caso)
    console.log('Tentando autenticação personalizada primeiro...');
    const customAuthResult = await customSignIn(email, password);
    
    if (customAuthResult.success) {
      // Retornar um objeto que simula a resposta do Supabase Auth
      return {
        data: {
          user: customAuthResult.user,
          session: null // A sessão pode ser null para autenticação personalizada
        },
        error: null
      };
    }
    
    // Se a autenticação personalizada falhar, tentar usar a autenticação real do Supabase
    console.log('Autenticação personalizada falhou, tentando Supabase Auth...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Erro no login com Supabase Auth:', error.message);
      throw new Error(customAuthResult.error || 'Credenciais inválidas');
    }
    
    // Salvar usuário no localStorage para persistência
    if (data?.user) {
      saveUserToStorage(data.user);
    }
    
    return { data, error: null };
  } catch (error) {
    handleError(error, 'auth', true);
    throw error;
  }
};

// Função de autenticação personalizada
async function customSignIn(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Criar cliente admin para acessar dados sem RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Buscar usuário na tabela app_users
    const { data: users, error } = await supabaseAdmin
      .from('app_users')
      .select('*')
      .eq('email', email);
    
    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return { success: false, error: 'Erro ao buscar usuário' };
    }
    
    if (!users || users.length === 0) {
      console.log('Usuário não encontrado:', email);
      return { success: false, error: 'Credenciais inválidas' };
    }
    
    const user = users[0];
    console.log('Usuário encontrado:', user.email);
    
    // Verificar senha usando bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log('Senha inválida para:', email);
      return { success: false, error: 'Credenciais inválidas' };
    }
    
    console.log('Autenticação bem-sucedida para:', email);
    
    // Retornar um objeto que simula um usuário do Supabase
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name
        },
        created_at: user.created_at
      }
    };
  } catch (error) {
    console.error('Erro na autenticação personalizada:', error);
    return { success: false, error: 'Erro na autenticação' };
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Remover usuário do localStorage
    removeUserFromStorage();
    
    return { error: null };
  } catch (error) {
    handleError(error, 'auth', true);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    console.log('🔍 Tentando obter usuário atual...');
    
    // Primeiro, tentar obter do localStorage (autenticação personalizada)
    console.log('🔍 Tentando obter usuário do localStorage...');
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log('✅ Usuário encontrado no localStorage:', user.id);
        return user;
      } catch (parseError) {
        console.error('❌ Erro ao parsear usuário do localStorage:', parseError);
        localStorage.removeItem('user');
      }
    }
    
    // Se não houver usuário no localStorage, tentar obter da sessão do Supabase Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      console.log('✅ Usuário encontrado na sessão do Supabase:', session.user.id);
      // Salvar no localStorage para persistência futura
      saveUserToStorage(session.user);
      return session.user;
    }
    
    console.log('ℹ️ Nenhum usuário encontrado');
    return null;
  } catch (error) {
    console.error('❌ Erro ao obter usuário atual:', error);
    handleError(error, 'auth', true);
    throw error;
  }
};

// Função para salvar o usuário no localStorage (para autenticação personalizada)
export const saveUserToStorage = (user: any) => {
  try {
    console.log('💾 Salvando usuário no localStorage:', user.id);
    localStorage.setItem('user', JSON.stringify(user));
    console.log('✅ Usuário salvo com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar usuário no localStorage:', error);
  }
};

// Função para remover o usuário do localStorage (logout)
export const removeUserFromStorage = () => {
  try {
    console.log('🗑️ Removendo usuário do localStorage');
    localStorage.removeItem('user');
    console.log('✅ Usuário removido com sucesso');
  } catch (error) {
    console.error('❌ Erro ao remover usuário do localStorage:', error);
  }
};

// Função para atualizar o perfil do usuário (incluindo avatar)
export const updateUserProfile = async (userId: string, updates: { name?: string; avatar_url?: string }) => {
  try {
    // Para nossa autenticação personalizada, precisamos atualizar o usuário na tabela app_users
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Preparar os dados para atualização
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
    
    // Adicionar timestamp de atualização
    updateData.updated_at = new Date().toISOString();
    
    console.log('Atualizando usuário:', userId, updateData);
    
    // Atualizar o usuário na tabela app_users
    const { data, error } = await supabaseAdmin
      .from('app_users')
      .update(updateData)
      .eq('id', userId);
    
    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error(error.message);
    }
    
    // Buscar o usuário atualizado
    const { data: updatedUser, error: fetchError } = await supabaseAdmin
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error('Erro ao buscar usuário atualizado:', fetchError);
      throw new Error(fetchError.message);
    }
    
    console.log('Usuário atualizado:', updatedUser);
    
    // Retornar um objeto que simula a resposta do Supabase Auth
    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        user_metadata: {
          name: updatedUser.name,
          avatar_url: updatedUser.avatar_url
        },
        created_at: updatedUser.created_at
      }
    };
  } catch (error) {
    handleError(error, 'auth', true);
    throw error;
  }
};

// Funções para manipulação de dados no banco de dados

// Funções para produtos
export const getProducts = async (userId: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    handleError(error, 'product', true);
    throw error;
  }
};

export const addProduct = async (product: any, userId: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{ ...product, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    handleError(error, 'product', true);
    throw error;
  }
};

export const updateProduct = async (id: number, product: any, userId: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(product)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    handleError(error, 'product', true);
    throw error;
  }
};

export const deleteProduct = async (id: number, userId: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    handleError(error, 'product', true);
    throw error;
  }
};

// Funções para clientes
export const getClients = async (userId: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    handleError(error, 'client', true);
    throw error;
  }
};

export const addClient = async (client: any, userId: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert([{ ...client, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    handleError(error, 'client', true);
    throw error;
  }
};

export const updateClient = async (id: number, client: any, userId: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(client)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    handleError(error, 'client', true);
    throw error;
  }
};

export const deleteClient = async (id: number, userId: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    handleError(error, 'client', true);
    throw error;
  }
};

// Funções para transações
export const getTransactions = async (userId: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        product:products(name),
        client:clients(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    handleError(error, 'transaction', true);
    throw error;
  }
};

export const addTransaction = async (transaction: any, userId: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([{ ...transaction, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    handleError(error, 'transaction', true);
    throw error;
  }
};

export const updateTransactionStatus = async (id: number, status: 'paid' | 'pending', userId: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .update({ payment_status: status })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    handleError(error, 'transaction', true);
    throw error;
  }
};

// Função para obter resumo financeiro
export const getFinancialSummary = async (userId: string, startDate?: string, endDate?: string) => {
  try {
    // Usar cliente admin para contornar RLS
    const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    let query = supabaseAdmin
      .from('transactions')
      .select('type, payment_status, total')
      .eq('user_id', userId);
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    const paidSales = data.filter(t => t.type === 'sale' && t.payment_status === 'paid');
    const pendingSales = data.filter(t => t.type === 'sale' && t.payment_status === 'pending');
    const purchases = data.filter(t => t.type === 'purchase');
    
    const totalRevenue = paidSales.reduce((sum, t) => sum + (t.total || 0), 0);
    const pendingReceivables = pendingSales.reduce((sum, t) => sum + (t.total || 0), 0);
    const totalCosts = purchases.reduce((sum, t) => sum + (t.total || 0), 0);
    
    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    return {
      totalRevenue,
      totalCosts,
      profit,
      profitMargin,
      pendingReceivables
    };
  } catch (error) {
    handleError(error, 'financial', true);
    throw error;
  }
};