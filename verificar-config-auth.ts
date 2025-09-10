import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

console.log('🔍 Verificando configuração de autenticação do Supabase...\n');

// Verificar variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarConfigAuth() {
  try {
    console.log('🔐 Verificando configuração de autenticação...');
    
    // Registrar um usuário de teste
    console.log('\n👤 Registrando usuário de teste...');
    const timestamp = Date.now();
    const testEmail = `config-auth-${timestamp}@example.com`;
    const testPassword = 'ConfigAuth123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.error('❌ Erro ao registrar usuário:', signUpError.message);
      process.exit(1);
    }
    
    console.log('✅ Usuário registrado com sucesso!');
    const userId = signUpData.user?.id;
    
    // Verificar se o usuário foi criado corretamente
    console.log('\n🔍 Verificando usuário criado...');
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId!);
    
    if (userError) {
      console.error('❌ Erro ao obter usuário:', userError.message);
    } else {
      console.log('✅ Usuário encontrado no sistema!');
      console.log('   User ID:', userData.user.id);
      console.log('   Email:', userData.user.email);
      console.log('   Confirmed:', userData.user.confirmed_at ? 'Sim' : 'Não');
      console.log('   Created At:', userData.user.created_at);
    }
    
    // Tentar fazer login
    console.log('\n🔐 Testando login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Erro ao fazer login:', signInError.message);
      
      // Verificar configurações específicas
      if (signInError.message.includes('Email not confirmed')) {
        console.log('⚠️  Email não confirmado - verificando configuração do Supabase');
        
        // Neste caso, vamos verificar se a confirmação de email está desativada
        console.log('💡 Para autenticação sem confirmação de email:');
        console.log('   1. Acesse https://supabase.com/dashboard');
        console.log('   2. Selecione seu projeto');
        console.log('   3. Vá para Authentication > Settings');
        console.log('   4. Desative "Enable email confirmations"');
      }
    } else {
      console.log('✅ Login realizado com sucesso!');
      
      // Fazer logout
      console.log('\n👋 Fazendo logout...');
      await supabase.auth.signOut();
      console.log('✅ Logout realizado com sucesso!');
    }
    
    console.log('\n📋 Verificação de configuração concluída!');
    
  } catch (error: any) {
    console.error('❌ Erro durante a verificação:', error.message);
    process.exit(1);
  }
}

// Executar verificação
verificarConfigAuth();