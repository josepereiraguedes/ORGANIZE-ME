// Script simples para testar a autenticação do Supabase
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://bsiayjdyqzptqoldrzbt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzaWF5amR5cXpwdHFvbGRyemJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDQ3OTMsImV4cCI6MjA3MzAyMDc5M30.NtXnYByvWGes3-3aZ-BZ1FtHl8d88iFMeFxJ3Vveexw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarAutenticacao() {
  console.log('=== Teste de Autenticação do Supabase ===\n');
  
  try {
    // Testar criação de usuário
    console.log('🔍 Testando criação de usuário...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.log('❌ Erro ao criar usuário:', signUpError.message);
      return;
    }
    
    console.log('✅ Usuário criado com sucesso');
    console.log('👤 ID do usuário:', signUpData.user?.id);
    
    // Tentar fazer login imediatamente
    console.log('\n🔍 Testando login imediato...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ Erro ao fazer login:', signInError.message);
      return;
    }
    
    console.log('✅ Login realizado com sucesso');
    console.log('🔑 Sessão ativa:', !!signInData.session);
    
    // Testar obtenção do usuário atual
    console.log('\n🔍 Testando obtenção do usuário atual...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Erro ao obter usuário:', userError.message);
      return;
    }
    
    console.log('✅ Usuário obtido com sucesso');
    console.log('📧 Email do usuário:', userData.user?.email);
    
    // Testar logout
    console.log('\n🔍 Testando logout...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('❌ Erro ao fazer logout:', signOutError.message);
      return;
    }
    
    console.log('✅ Logout realizado com sucesso');
    
    console.log('\n=== Todos os testes passaram! ===');
    console.log('✅ O sistema de autenticação está funcionando corretamente');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testarAutenticacao();