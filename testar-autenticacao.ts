import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarAutenticacao() {
  console.log('🔍 Testando autenticação com Supabase...\n');
  
  try {
    // Verificar se há sessão ativa
    console.log('🔐 Verificando sessão atual...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao verificar sessão:', sessionError.message);
    } else {
      if (sessionData.session) {
        console.log('✅ Sessão ativa encontrada');
        console.log('   User ID:', sessionData.session.user.id);
        console.log('   Email:', sessionData.session.user.email);
      } else {
        console.log('⚠️  Nenhuma sessão ativa encontrada');
      }
    }
    
    // Verificar usuário atual
    console.log('\n👤 Verificando usuário atual...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erro ao obter usuário:', userError.message);
    } else {
      if (userData.user) {
        console.log('✅ Usuário logado');
        console.log('   User ID:', userData.user.id);
        console.log('   Email:', userData.user.email);
        console.log('   Confirmed At:', userData.user.confirmed_at || 'N/A');
        console.log('   Created At:', userData.user.created_at);
      } else {
        console.log('⚠️  Nenhum usuário logado');
      }
    }
    
    console.log('\n📋 Teste de autenticação concluído!');
    
  } catch (error: any) {
    console.error('❌ Erro durante o teste de autenticação:', error.message);
    process.exit(1);
  }
}

// Executar teste
testarAutenticacao();