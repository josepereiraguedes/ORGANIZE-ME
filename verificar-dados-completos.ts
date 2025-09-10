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

async function verificarDadosCompletos() {
  console.log('🔍 Verificando dados completos no banco de dados...\n');
  
  try {
    // Verificar produtos (com e sem filtro de usuário)
    console.log('📦 Verificando produtos...');
    const { data: allProducts, error: allProductsError } = await supabase
      .from('products')
      .select('*');
    
    if (allProductsError) {
      console.error('❌ Erro ao buscar todos os produtos:', allProductsError.message);
    } else {
      console.log(`✅ Encontrados ${allProducts?.length || 0} produtos no total`);
      if (allProducts && allProducts.length > 0) {
        console.log('   Todos os produtos:');
        allProducts.slice(0, 5).forEach((product: any) => {
          console.log(`   - ${product.name} (ID: ${product.id}, user_id: ${product.user_id || 'N/A'})`);
        });
        if (allProducts.length > 5) {
          console.log(`   ... e mais ${allProducts.length - 5} produtos`);
        }
      }
    }
    
    // Verificar clientes (com e sem filtro de usuário)
    console.log('\n👥 Verificando clientes...');
    const { data: allClients, error: allClientsError } = await supabase
      .from('clients')
      .select('*');
    
    if (allClientsError) {
      console.error('❌ Erro ao buscar todos os clientes:', allClientsError.message);
    } else {
      console.log(`✅ Encontrados ${allClients?.length || 0} clientes no total`);
      if (allClients && allClients.length > 0) {
        console.log('   Todos os clientes:');
        allClients.slice(0, 5).forEach((client: any) => {
          console.log(`   - ${client.name} (ID: ${client.id}, user_id: ${client.user_id || 'N/A'})`);
        });
        if (allClients.length > 5) {
          console.log(`   ... e mais ${allClients.length - 5} clientes`);
        }
      }
    }
    
    // Verificar transações (com e sem filtro de usuário)
    console.log('\n💰 Verificando transações...');
    const { data: allTransactions, error: allTransactionsError } = await supabase
      .from('transactions')
      .select('*');
    
    if (allTransactionsError) {
      console.error('❌ Erro ao buscar todas as transações:', allTransactionsError.message);
    } else {
      console.log(`✅ Encontradas ${allTransactions?.length || 0} transações no total`);
      if (allTransactions && allTransactions.length > 0) {
        console.log('   Todas as transações:');
        allTransactions.slice(0, 5).forEach((transaction: any) => {
          console.log(`   - ${transaction.type} (ID: ${transaction.id}, user_id: ${transaction.user_id || 'N/A'})`);
        });
        if (allTransactions.length > 5) {
          console.log(`   ... e mais ${allTransactions.length - 5} transações`);
        }
      }
    }
    
    // Verificar estrutura das tabelas
    console.log('\n📋 Verificando estrutura das tabelas...');
    
    // Verificar se as tabelas existem
    const tables = ['products', 'clients', 'transactions'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && !error.message.includes('The resource was not found')) {
          console.log(`   ❌ Erro ao acessar tabela ${table}:`, error.message);
        } else if (error) {
          console.log(`   ⚠️  Tabela ${table} não encontrada`);
        } else {
          console.log(`   ✅ Tabela ${table} acessível`);
        }
      } catch (error: any) {
        console.log(`   ❌ Erro ao verificar tabela ${table}:`, error.message);
      }
    }
    
    console.log('\n📋 Verificação completa!');
    console.log('\n💡 Dicas:');
    console.log('   - Se você vê produtos/clientes/transações com user_id, isso significa que foram criados por algum usuário');
    console.log('   - Se user_id é "N/A", pode significar que os dados foram criados antes da implementação do sistema de usuários');
    console.log('   - Se não há dados, você precisa criar alguns após fazer login no sistema');
    
  } catch (error: any) {
    console.error('❌ Erro durante a verificação:', error.message);
    process.exit(1);
  }
}

// Executar verificação
verificarDadosCompletos();