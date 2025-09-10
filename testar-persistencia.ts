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

async function testarPersistencia() {
  console.log('🔍 Testando persistência de dados...\n');
  
  // Usar as credenciais do teste anterior
  const testEmail = 'fluxo-completo-1757462784170@example.com';
  const testPassword = 'Teste123!';
  
  try {
    console.log('1️⃣ Fazendo login com credenciais existentes...');
    console.log(`   Email: ${testEmail}`);
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Erro ao fazer login:', signInError.message);
      console.log('💡 Possivelmente as credenciais do teste anterior expiraram');
      console.log('💡 Execute o script simular-fluxo-completo.ts para gerar novas credenciais');
      process.exit(1);
    }
    
    console.log('✅ Login realizado com sucesso!');
    const userId = signInData.user?.id;
    console.log('   User ID:', userId);
    
    // Verificar se os dados criados anteriormente ainda existem
    console.log('\n2️⃣ Verificando dados persistidos...');
    
    // Verificar produtos
    console.log('   Verificando produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError.message);
    } else {
      console.log(`   ✅ Encontrados ${products?.length || 0} produtos`);
      if (products && products.length > 0) {
        products.forEach((product: any) => {
          console.log(`      - ${product.name} (ID: ${product.id})`);
        });
      }
    }
    
    // Verificar clientes
    console.log('   Verificando clientes...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);
    
    if (clientsError) {
      console.error('❌ Erro ao buscar clientes:', clientsError.message);
    } else {
      console.log(`   ✅ Encontrados ${clients?.length || 0} clientes`);
      if (clients && clients.length > 0) {
        clients.forEach((client: any) => {
          console.log(`      - ${client.name} (ID: ${client.id})`);
        });
      }
    }
    
    // Verificar transações
    console.log('   Verificando transações...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);
    
    if (transactionsError) {
      console.error('❌ Erro ao buscar transações:', transactionsError.message);
    } else {
      console.log(`   ✅ Encontradas ${transactions?.length || 0} transações`);
      if (transactions && transactions.length > 0) {
        transactions.forEach((transaction: any) => {
          console.log(`      - ${transaction.type} de ${transaction.quantity} itens (ID: ${transaction.id})`);
        });
      }
    }
    
    // Fazer logout
    console.log('\n3️⃣ Fazendo logout...');
    await supabase.auth.signOut();
    console.log('✅ Logout realizado com sucesso!');
    
    console.log('\n🎉 Teste de persistência concluído!');
    console.log('\n💡 Resultados:');
    console.log('   - Se você vê os dados listados acima, a persistência está funcionando corretamente');
    console.log('   - Os dados continuam no banco de dados mesmo após sair do sistema');
    console.log('   - Quando você fizer login novamente com as mesmas credenciais, os dados estarão lá');
    
  } catch (error: any) {
    console.error('❌ Erro durante o teste de persistência:', error.message);
    process.exit(1);
  }
}

// Executar teste de persistência
testarPersistencia();