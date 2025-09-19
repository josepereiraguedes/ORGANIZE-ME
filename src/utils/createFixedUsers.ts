import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
config();

// Garantir que as variáveis de ambiente sejam carregadas corretamente
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in .env file");
}

// Criar cliente com chave de serviço se disponível
const supabase = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : createClient(supabaseUrl, supabaseAnonKey);

/**
 * Função para criar usuários fixos no Supabase
 * Este script deve ser executado apenas uma vez para configurar os usuários
 */
const createFixedUsers = async () => {
  try {
    console.log('Criando usuários fixos...');
    
    // Criar usuário 1
    console.log('Criando Usuário 1...');
    const user1Result = await supabase.auth.signUp({
      email: '11999999999@whatsapp.com',
      password: 'senha123',
      options: {
        data: {
          name: 'Usuário 1',
          phone: '(11) 99999-9999'
        }
      }
    });
    
    if (user1Result.error) {
      console.log('Erro ao criar Usuário 1:', user1Result.error.message);
    } else {
      console.log('Usuário 1 criado com sucesso:', user1Result.data.user?.id);
      
      // Se tivermos chave de serviço, podemos tentar confirmar o usuário
      if (supabaseServiceRoleKey && user1Result.data.user) {
        console.log('Tentando confirmar Usuário 1...');
        const confirmResult = await supabase.auth.admin.updateUserById(
          user1Result.data.user.id,
          { email_confirm: true }
        );
        
        if (confirmResult.error) {
          console.log('Erro ao confirmar Usuário 1:', confirmResult.error.message);
        } else {
          console.log('Usuário 1 confirmado com sucesso');
        }
      }
    }
    
    // Criar usuário 2
    console.log('Criando Usuário 2...');
    const user2Result = await supabase.auth.signUp({
      email: '22999999999@whatsapp.com',
      password: 'senha456',
      options: {
        data: {
          name: 'Usuário 2',
          phone: '(22) 99999-9999'
        }
      }
    });
    
    if (user2Result.error) {
      console.log('Erro ao criar Usuário 2:', user2Result.error.message);
    } else {
      console.log('Usuário 2 criado com sucesso:', user2Result.data.user?.id);
      
      // Se tivermos chave de serviço, podemos tentar confirmar o usuário
      if (supabaseServiceRoleKey && user2Result.data.user) {
        console.log('Tentando confirmar Usuário 2...');
        const confirmResult = await supabase.auth.admin.updateUserById(
          user2Result.data.user.id,
          { email_confirm: true }
        );
        
        if (confirmResult.error) {
          console.log('Erro ao confirmar Usuário 2:', confirmResult.error.message);
        } else {
          console.log('Usuário 2 confirmado com sucesso');
        }
      }
    }
    
    console.log('Processo de criação de usuários concluído!');
  } catch (error) {
    console.error('Erro ao criar usuários:', error);
  }
};

// Executar o script
createFixedUsers();