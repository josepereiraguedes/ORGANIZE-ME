import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

console.log('🔍 Verificando configuração do Supabase...\n');

// Verificar variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente carregadas');
console.log('   URL:', supabaseUrl);
console.log('   Key:', supabaseAnonKey.substring(0, 10) + '...');

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarConfigSupabase() {
  try {
    console.log('\n🔐 Verificando configuração de autenticação...');
    
    // Registrar um usuário de teste
    console.log('\n👤 Registrando usuário de teste...');
    const timestamp = Date.now();
    const testEmail = `config-test-${timestamp}@example.com`;
    const testPassword = 'ConfigTest123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.error('❌ Erro ao registrar usuário:', signUpError.message);
      
      // Verificar se é um erro de configuração
      if (signUpError.message.includes('Email signups are disabled')) {
        console.log('\n⚠️  Configuração do Supabase:');
        console.log('   - O registro por email está desativado');
        console.log('   - Acesse https://supabase.com/dashboard');
        console.log('   - Selecione seu projeto');
        console.log('   - Vá para Authentication > Settings');
        console.log('   - Ative "Enable email signups"');
      }
      
      process.exit(1);
    }
    
    console.log('✅ Usuário registrado com sucesso!');
    const userId = signUpData.user?.id;
    console.log('   User ID:', userId);
    
    // Verificar se o email precisa ser confirmado
    const emailConfirmed = signUpData.user?.confirmed_at !== null;
    console.log('   Email confirmado:', emailConfirmed ? 'Sim' : 'Não');
    
    if (!emailConfirmed) {
      console.log('\n⚠️  Configuração do Supabase:');
      console.log('   - A confirmação de email está ativada');
      console.log('   - Para autenticação imediata, desative "Enable email confirmations"');
      console.log('   - Acesse https://supabase.com/dashboard');
      console.log('   - Selecione seu projeto');
      console.log('   - Vá para Authentication > Settings');
      console.log('   - Desative "Enable email confirmations"');
    }
    
    // Tentar fazer login
    console.log('\n🔐 Testando login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Erro ao fazer login:', signInError.message);
      
      // Verificar tipos específicos de erros
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('\n💡 Possíveis causas:');
        console.log('   - Credenciais inválidas');
        console.log('   - Usuário não existe ou foi excluído');
        console.log('   - Problemas com a configuração do Supabase');
      } else if (signInError.message.includes('Email not confirmed')) {
        console.log('\n💡 O email não foi confirmado:');
        console.log('   - Verifique sua caixa de entrada');
        console.log('   - Verifique a pasta de spam');
        console.log('   - Ou desative "Enable email confirmations" no Supabase');
      }
      
      process.exit(1);
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('   User ID:', signInData.user?.id);
    console.log('   Email:', signInData.user?.email);
    
    // Verificar se há sessão
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      console.log('✅ Sessão ativa estabelecida!');
    } else {
      console.log('⚠️  Nenhuma sessão ativa encontrada');
    }
    
    // Fazer logout
    console.log('\n👋 Fazendo logout...');
    await supabase.auth.signOut();
    console.log('✅ Logout realizado com sucesso!');
    
    console.log('\n🎉 Verificação concluída com sucesso!');
    console.log('\n📋 Resumo:');
    console.log('   ✅ Conexão com Supabase estabelecida');
    console.log('   ✅ Registro de usuários funcionando');
    console.log('   ✅ Login de usuários funcionando');
    console.log('   ✅ Sessões gerenciadas corretamente');
    
    if (!emailConfirmed) {
      console.log('\n💡 Recomendação:');
      console.log('   Para autenticação imediata (sem confirmação de email):');
      console.log('   1. Acesse https://supabase.com/dashboard');
      console.log('   2. Selecione seu projeto');
      console.log('   3. Vá para Authentication > Settings');
      console.log('   4. Desative "Enable email confirmations"');
    }
    
  } catch (error: any) {
    console.error('❌ Erro durante a verificação:', error.message);
    process.exit(1);
  }
}

// Executar verificação
verificarConfigSupabase();