// Script para simular o processo de login
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';

// Carregar variáveis de ambiente do arquivo .env
config({ path: resolve(process.cwd(), '.env') });

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Simulação de Login ===');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Credenciais do Supabase não configuradas!');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Criar cliente Supabase com service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função de login personalizada (cópia da implementação no supabase.ts)
async function signInWithEmail(email, password) {
  try {
    console.log('Tentando login com Supabase Auth:', email);
    
    // Primeiro, tentar usar a autenticação real do Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.log('Erro no login com Supabase Auth:', error.message);
      
      // Se falhar, tentar autenticação personalizada
      console.log('Tentando autenticação personalizada...');
      const customAuthResult = await customSignIn(email, password);
      
      if (customAuthResult.success) {
        // Retornar um objeto que simula a resposta do Supabase Auth
        return {
          data: {
            user: customAuthResult.user,
            session: null
          },
          error: null
        };
      } else {
        throw new Error(customAuthResult.error || 'Credenciais inválidas');
      }
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Erro na função signInWithEmail:', error.message);
    throw error;
  }
}

// Função de autenticação personalizada
async function customSignIn(email, password) {
  try {
    console.log('Executando autenticação personalizada para:', email);
    
    // Buscar usuário na tabela app_users
    const { data: users, error } = await supabaseAdmin
      .from('app_users')
      .select('*')
      .eq('email', email);
    
    if (error) {
      console.error('Erro ao buscar usuário:', error.message);
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
    console.error('Erro na autenticação personalizada:', error.message);
    return { success: false, error: 'Erro na autenticação' };
  }
}

// Testar login
async function testLogin() {
  console.log('\n🚀 Iniciando simulação de login...\n');
  
  const testUsers = [
    { email: 'pereiraguedes1988@gmail.com', password: '31051988' },
    { email: 'josepereiraguedes@yahoo.com.br', password: '31052025' }
  ];
  
  for (const user of testUsers) {
    console.log(`\n🧪 Testando login para: ${user.email}`);
    
    try {
      const result = await signInWithEmail(user.email, user.password);
      
      if (result.error) {
        console.log(`❌ Erro no login: ${result.error.message || result.error}`);
      } else if (result.data?.user) {
        console.log(`✅ Login bem-sucedido!`);
        console.log(`   ID: ${result.data.user.id}`);
        console.log(`   Nome: ${result.data.user.user_metadata?.name}`);
        console.log(`   Email: ${result.data.user.email}`);
      } else {
        console.log(`⚠️  Resultado inesperado:`, result);
      }
    } catch (error) {
      console.log(`❌ Exceção no login: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Simulação de login concluída!');
}

testLogin();