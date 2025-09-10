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

async function diagnosticarDados() {
  console.log('🔍 Diagnosticando dados no banco de dados...\n');
  
  try {
    // Verificar produtos
    console.log('📦 Verificando produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError.message);
    } else {
      console.log(`✅ Encontrados ${products?.length || 0} produtos`);
      if (products && products.length > 0) {
        console.log('   Primeiros 3 produtos:');
        products.slice(0, 3).forEach((product: any) => {
          console.log(`   - ${product.name} (ID: ${product.id}, user_id: ${product.user_id})`);
        });
      }
    }
    
    // Verificar clientes
    console.log('\n👥 Verificando clientes...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*');
    
    if (clientsError) {
      console.error('❌ Erro ao buscar clientes:', clientsError.message);
    } else {
      console.log(`✅ Encontrados ${clients?.length || 0} clientes`);
      if (clients && clients.length > 0) {
        console.log('   Primeiros 3 clientes:');
        clients.slice(0, 3).forEach((client: any) => {
          console.log(`   - ${client.name} (ID: ${client.id}, user_id: ${client.user_id})`);
        });
      }
    }
    
    // Verificar transações
    console.log('\n💰 Verificando transações...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*');
    
    if (transactionsError) {
      console.error('❌ Erro ao buscar transações:', transactionsError.message);
    } else {
      console.log(`✅ Encontradas ${transactions?.length || 0} transações`);
      if (transactions && transactions.length > 0) {
        console.log('   Primeiras 3 transações:');
        transactions.slice(0, 3).forEach((transaction: any) => {
          console.log(`   - ${transaction.type} (ID: ${transaction.id}, user_id: ${transaction.user_id})`);
        });
      }
    }
    
    // Verificar usuários
    console.log('\n👤 Verificando usuários...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError && !usersError.message.includes('The resource was not found')) {
      console.error('❌ Erro ao buscar usuários:', usersError.message);
    } else {
      console.log(`✅ Encontrados ${users?.length || 0} usuários`);
      if (users && users.length > 0) {
        console.log('   Primeiros 3 usuários:');
        users.slice(0, 3).forEach((user: any) => {
          console.log(`   - ${user.email} (ID: ${user.id})`);
        });
      }
    }
    
    console.log('\n📋 Diagnóstico concluído!');
    
  } catch (error: any) {
    console.error('❌ Erro durante o diagnóstico:', error.message);
    process.exit(1);
  }
}

// Executar diagnóstico
diagnosticarDados();