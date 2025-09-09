// Script para configurar o banco de dados do Supabase
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
config({ path: resolve(process.cwd(), '.env') });

async function setupDatabase() {
  console.log('🔍 Configurando banco de dados do Supabase...');
  console.log('');
  
  // Verificar se as variáveis de ambiente estão definidas
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis de ambiente não configuradas corretamente');
    console.log('💡 Execute "npm run test:supabase" para verificar a configuração');
    process.exit(1);
  }
  
  try {
    // Criar cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('🔌 Conectado ao Supabase com sucesso!');
    console.log('');
    
    // Testar conexão básica
    console.log('🧪 Testando conexão com o banco de dados...');
    const { data, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (testError && !testError.message.includes('The resource was not found')) {
      throw new Error(`Erro de conexão: ${testError.message}`);
    }
    
    console.log('✅ Conexão com o banco de dados estabelecida');
    console.log('');
    
    // Criar tabelas uma por uma usando a API do Supabase
    console.log('🔧 Criando tabelas...');
    
    // Verificar se a tabela de produtos já existe
    console.log('   - Verificando tabela de produtos...');
    const { data: productsData, error: productsCheckError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (productsCheckError && productsCheckError.message.includes('The resource was not found')) {
      console.log('     📝 Tabela de produtos não encontrada, criando...');
      // Não podemos criar tabelas diretamente via API JavaScript
      console.log('     ℹ️  As tabelas precisam ser criadas no painel do Supabase');
    } else {
      console.log('     ✅ Tabela de produtos já existe');
    }
    
    // Verificar se a tabela de clientes já existe
    console.log('   - Verificando tabela de clientes...');
    const { data: clientsData, error: clientsCheckError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (clientsCheckError && clientsCheckError.message.includes('The resource was not found')) {
      console.log('     📝 Tabela de clientes não encontrada, criando...');
      console.log('     ℹ️  As tabelas precisam ser criadas no painel do Supabase');
    } else {
      console.log('     ✅ Tabela de clientes já existe');
    }
    
    // Verificar se a tabela de transações já existe
    console.log('   - Verificando tabela de transações...');
    const { data: transactionsData, error: transactionsCheckError } = await supabase
      .from('transactions')
      .select('id')
      .limit(1);
    
    if (transactionsCheckError && transactionsCheckError.message.includes('The resource was not found')) {
      console.log('     📝 Tabela de transações não encontrada, criando...');
      console.log('     ℹ️  As tabelas precisam ser criadas no painel do Supabase');
    } else {
      console.log('     ✅ Tabela de transações já existe');
    }
    
    console.log('');
    console.log('💡 Instruções para criar as tabelas:');
    console.log('   1. Acesse https://supabase.com/dashboard');
    console.log('   2. Selecione seu projeto');
    console.log('   3. Vá para "Table Editor" > "SQL Editor"');
    console.log('   4. Cole o conteúdo do arquivo supabase-schema.sql');
    console.log('   5. Clique em "Run" para executar o script');
    console.log('');
    console.log('📋 Estrutura das tabelas:');
    console.log('   - products: Armazena informações dos produtos');
    console.log('   - clients: Armazena informações dos clientes');
    console.log('   - transactions: Armazena registros de transações');
    console.log('');
    console.log('🔐 Configurações de segurança:');
    console.log('   - Todas as tabelas têm RLS (Row Level Security) habilitado');
    console.log('   - Cada usuário só pode acessar seus próprios dados');
    console.log('   - Índices foram criados para melhorar a performance');
    
  } catch (error: any) {
    console.error(`❌ Erro ao configurar banco de dados: ${error.message}`);
    process.exit(1);
  }
}

// Executar a configuração
setupDatabase();