import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarConexao() {
  console.log('🔍 Testando conexão com Supabase...\n');
  
  try {
    // Testar conexão básica
    console.log('🔌 Testando conexão básica...');
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error && !error.message.includes('The resource was not found')) {
      console.error('❌ Erro de conexão:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar autenticação
    console.log('\n🔐 Testando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError && !authError.message.includes('Auth session missing')) {
      console.error('❌ Erro de autenticação:', authError.message);
    } else if (authError) {
      console.log('⚠️  Nenhuma sessão ativa (isso é normal se não estiver logado)');
    } else {
      console.log('✅ Autenticação funcionando');
      console.log('   Usuário atual:', authData.user?.email);
    }
    
    // Listar tabelas disponíveis
    console.log('\n📋 Listando tabelas disponíveis...');
    // @ts-ignore - Ignorar tipo para acessar internal API
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    
    if (tablesError) {
      console.log('⚠️  Não foi possível listar tabelas (isso é normal em alguns casos)');
    } else {
      console.log('   Tabelas encontradas:', tables);
    }
    
    console.log('\n✅ Teste de conexão concluído com sucesso!');
    
  } catch (error: any) {
    console.error('❌ Erro durante o teste de conexão:', error.message);
    process.exit(1);
  }
}

// Executar teste
testarConexao();