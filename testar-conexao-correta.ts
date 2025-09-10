import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

console.log('🔍 Testando conexão com credenciais corretas...\n');

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

async function testarConexao() {
  try {
    console.log('\n🔌 Testando conexão com Supabase...');
    
    // Testar conexão básica
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
    
    console.log('\n🎉 Teste de conexão concluído com sucesso!');
    
  } catch (error: any) {
    console.error('❌ Erro durante o teste de conexão:', error.message);
    process.exit(1);
  }
}

// Executar teste
testarConexao();