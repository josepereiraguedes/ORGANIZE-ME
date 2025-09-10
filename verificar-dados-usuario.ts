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

async function verificarDadosUsuario(userId: string) {
  console.log(`🔍 Verificando dados para o usuário: ${userId}\n`);
  
  try {
    // Verificar produtos do usuário
    console.log('📦 Verificando produtos do usuário...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError.message);
    } else {
      console.log(`✅ Encontrados ${products?.length || 0} produtos para este usuário`);
      if (products && products.length > 0) {
        console.log('   Produtos:');
        products.forEach((product: any) => {
          console.log(`   - ${product.name} (ID: ${product.id}, Criado em: ${new Date(product.created_at).toLocaleString()})`);
        });
      }
    }
    
    // Verificar clientes do usuário
    console.log('\n👥 Verificando clientes do usuário...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);
    
    if (clientsError) {
      console.error('❌ Erro ao buscar clientes:', clientsError.message);
    } else {
      console.log(`✅ Encontrados ${clients?.length || 0} clientes para este usuário`);
      if (clients && clients.length > 0) {
        console.log('   Clientes:');
        clients.forEach((client: any) => {
          console.log(`   - ${client.name} (ID: ${client.id}, Criado em: ${new Date(client.created_at).toLocaleString()})`);
        });
      }
    }
    
    // Verificar transações do usuário
    console.log('\n💰 Verificando transações do usuário...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);
    
    if (transactionsError) {
      console.error('❌ Erro ao buscar transações:', transactionsError.message);
    } else {
      console.log(`✅ Encontradas ${transactions?.length || 0} transações para este usuário`);
      if (transactions && transactions.length > 0) {
        console.log('   Transações:');
        transactions.forEach((transaction: any) => {
          console.log(`   - ${transaction.type} de ${transaction.quantity} itens (ID: ${transaction.id}, Criado em: ${new Date(transaction.created_at).toLocaleString()})`);
        });
      }
    }
    
    console.log('\n📋 Verificação concluída!');
    
  } catch (error: any) {
    console.error('❌ Erro durante a verificação:', error.message);
    process.exit(1);
  }
}

// Verificar se foi passado um ID de usuário como argumento
const userId = process.argv[2];

if (!userId) {
  console.log('Uso: npx ts-node verificar-dados-usuario.ts <USER_ID>');
  console.log('Para obter seu USER_ID, faça login no sistema e verifique o console do navegador.');
  process.exit(1);
}

// Executar verificação
verificarDadosUsuario(userId);