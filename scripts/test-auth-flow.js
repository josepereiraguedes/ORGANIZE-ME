// Script para testar o fluxo completo de autenticação
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

console.log('=== Teste de Fluxo de Autenticação ===');

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

// Credenciais de teste
const testUsers = [
  { email: 'pereiraguedes1988@gmail.com', password: '31051988' },
  { email: 'josepereiraguedes@yahoo.com.br', password: '31052025' }
];

async function testAuthFlow() {
  console.log('\n🚀 Iniciando teste de fluxo de autenticação...\n');
  
  // 1. Verificar conexão com o banco de dados
  console.log('1. 🔍 Verificando conexão com o banco de dados...');
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro de conexão:', error.message);
      return;
    }
    console.log('✅ Conexão estabelecida com sucesso!');
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
    return;
  }
  
  // 2. Verificar usuários no banco de dados
  console.log('\n2. 👥 Verificando usuários no banco de dados...');
  try {
    const { data: users, error } = await supabaseAdmin
      .from('app_users')
      .select('*');
    
    if (error) {
      console.log('❌ Erro ao buscar usuários:', error.message);
      return;
    }
    
    console.log(`✅ Encontrados ${users.length} usuários:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
  } catch (error) {
    console.log('❌ Erro ao verificar usuários:', error.message);
    return;
  }
  
  // 3. Testar autenticação personalizada
  console.log('\n3. 🔐 Testando autenticação personalizada...');
  for (const user of testUsers) {
    console.log(`\n   Testando: ${user.email}`);
    
    try {
      // Buscar usuário na tabela app_users
      const { data: dbUsers, error: dbError } = await supabaseAdmin
        .from('app_users')
        .select('*')
        .eq('email', user.email);
      
      if (dbError) {
        console.log(`   ❌ Erro ao buscar usuário: ${dbError.message}`);
        continue;
      }
      
      if (!dbUsers || dbUsers.length === 0) {
        console.log(`   ❌ Usuário não encontrado no banco de dados`);
        continue;
      }
      
      const dbUser = dbUsers[0];
      console.log(`   ✅ Usuário encontrado: ${dbUser.name}`);
      
      // Verificar senha
      const isPasswordValid = await bcrypt.compare(user.password, dbUser.password_hash);
      if (isPasswordValid) {
        console.log(`   ✅ Senha correta para ${user.email}`);
      } else {
        console.log(`   ❌ Senha incorreta para ${user.email}`);
        console.log(`      Senha esperada: ${user.password}`);
        console.log(`      Hash armazenado: ${dbUser.password_hash}`);
      }
    } catch (error) {
      console.log(`   ❌ Erro ao testar autenticação: ${error.message}`);
    }
  }
  
  // 4. Testar autenticação do Supabase (se possível)
  console.log('\n4. 🌐 Testando autenticação do Supabase...');
  for (const user of testUsers) {
    console.log(`\n   Testando login do Supabase: ${user.email}`);
    
    try {
      // Tentar login com Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (error) {
        console.log(`   ⚠️  Erro no login do Supabase: ${error.message}`);
      } else {
        console.log(`   ✅ Login do Supabase bem-sucedido para ${user.email}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Erro ao testar login do Supabase: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Teste de fluxo de autenticação concluído!');
}

testAuthFlow();