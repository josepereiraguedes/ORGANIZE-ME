import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

console.log('🔍 Testando login com Supabase...\n');

// Verificar variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarLogin() {
  try {
    // Primeiro, tentar registrar um usuário de teste
    console.log('👤 Registrando usuário de teste...');
    const timestamp = Date.now();
    const testEmail = `teste-login-${timestamp}@example.com`;
    const testPassword = 'SenhaTeste123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.error('❌ Erro ao registrar usuário:', signUpError.message);
      process.exit(1);
    }
    
    console.log('✅ Usuário registrado com sucesso!');
    console.log('   User ID:', signUpData.user?.id);
    console.log('   Email:', signUpData.user?.email);
    
    // Agora tentar fazer login com o mesmo usuário
    console.log('\n🔐 Fazendo login com o usuário registrado...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Erro ao fazer login:', signInError.message);
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
    
    console.log('\n🎉 Teste de login concluído com sucesso!');
    
  } catch (error: any) {
    console.error('❌ Erro durante o teste de login:', error.message);
    process.exit(1);
  }
}

// Executar teste
testarLogin();