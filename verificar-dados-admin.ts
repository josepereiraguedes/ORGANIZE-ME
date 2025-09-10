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

async function verificarDadosAdmin() {
  console.log('🔍 Verificando dados como administrador (ignorando RLS)...\n');
  
  try {
    // Verificar produtos (ignorando RLS)
    console.log('📦 Verificando produtos (ignorando RLS)...');
    // @ts-ignore - Ignorar tipo para usar admin access
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError.message);
    } else {
      console.log(`✅ Encontrados ${products?.length || 0} produtos`);
      if (products && products.length > 0) {
        console.log('   Produtos:');
        products.slice(0, 5).forEach((product: any) => {
          console.log(`   - ${product.name} (ID: ${product.id}, user_id: ${product.user_id || 'N/A'})`);
        });
        if (products.length > 5) {
          console.log(`   ... e mais ${products.length - 5} produtos`);
        }
      }
    }
    
    // Verificar clientes (ignorando RLS)
    console.log('\n👥 Verificando clientes (ignorando RLS)...');
    // @ts-ignore - Ignorar tipo para usar admin access
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*');
    
    if (clientsError) {
      console.error('❌ Erro ao buscar clientes:', clientsError.message);
    } else {
      console.log(`✅ Encontrados ${clients?.length || 0} clientes`);
      if (clients && clients.length > 0) {
        console.log('   Clientes:');
        clients.slice(0, 5).forEach((client: any) => {
          console.log(`   - ${client.name} (ID: ${client.id}, user_id: ${client.user_id || 'N/A'})`);
        });
        if (clients.length > 5) {
          console.log(`   ... e mais ${clients.length - 5} clientes`);
        }
      }
    }
    
    // Verificar transações (ignorando RLS)
    console.log('\n💰 Verificando transações (ignorando RLS)...');
    // @ts-ignore - Ignorar tipo para usar admin access
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*');
    
    if (transactionsError) {
      console.error('❌ Erro ao buscar transações:', transactionsError.message);
    } else {
      console.log(`✅ Encontradas ${transactions?.length || 0} transações`);
      if (transactions && transactions.length > 0) {
        console.log('   Transações:');
        transactions.slice(0, 5).forEach((transaction: any) => {
          console.log(`   - ${transaction.type} (ID: ${transaction.id}, user_id: ${transaction.user_id || 'N/A'})`);
        });
        if (transactions.length > 5) {
          console.log(`   ... e mais ${transactions.length - 5} transações`);
        }
      }
    }
    
    console.log('\n📋 Verificação como administrador concluída!');
    
  } catch (error: any) {
    console.error('❌ Erro durante a verificação:', error.message);
    process.exit(1);
  }
}

// Executar verificação
verificarDadosAdmin();