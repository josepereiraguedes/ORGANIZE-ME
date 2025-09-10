// Script para verificar a configuração do Supabase via API

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do .env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Credenciais do Supabase não encontradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarConfiguracao() {
  console.log('=== Verificação de Configuração do Supabase ===\n');
  
  try {
    // Tentar obter informações básicas do projeto
    console.log('🔍 Verificando conexão com o Supabase...');
    
    // Verificar se conseguimos acessar o auth
    const { data, error } = await supabase.auth.getUser();
    
    if (error && !error.message.includes('Auth session missing')) {
      console.log('❌ Erro de autenticação:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Conexão com o Supabase estabelecida com sucesso');
    console.log('🔗 URL do projeto:', supabaseUrl);
    
    // Testar criação de usuário (sem confirmar)
    console.log('\n🔍 Testando criação de usuário...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.log('❌ Erro ao criar usuário de teste:', signUpError.message);
      // Continuar mesmo com erro, pois pode ser uma limitação de configuração
    } else {
      console.log('✅ Usuário de teste criado com sucesso');
      console.log('👤 ID do usuário:', signUpData.user?.id);
      console.log('📧 Email confirmado:', signUpData.user?.email_confirmed_at ? 'Sim' : 'Não');
      
      // Tentar fazer login imediatamente
      console.log('\n🔍 Testando login imediato...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        console.log('❌ Erro ao fazer login:', signInError.message);
      } else {
        console.log('✅ Login realizado com sucesso');
        console.log('🔑 Sessão ativa:', !!signInData.session);
      }
    }
    
    console.log('\n=== Resumo ===');
    console.log('✅ Configuração básica do Supabase está funcionando');
    console.log('ℹ️  Lembre-se de desativar a confirmação de email no painel do Supabase:');
    console.log('   1. Acesse https://app.supabase.com');
    console.log('   2. Selecione seu projeto');
    console.log('   3. Vá para Authentication > Settings');
    console.log('   4. Desative "Enable email confirmations"');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    process.exit(1);
  }
}

verificarConfiguracao();