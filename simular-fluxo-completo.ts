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

async function simularFluxoCompleto() {
  console.log('🔍 Simulando fluxo completo de autenticação e persistência...\n');
  
  try {
    // 1. Registrar novo usuário
    console.log('1️⃣ Registrando novo usuário...');
    const timestamp = Date.now();
    const testEmail = `fluxo-completo-${timestamp}@example.com`;
    const testPassword = 'Teste123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.error('❌ Erro ao registrar usuário:', signUpError.message);
      process.exit(1);
    }
    
    console.log('✅ Usuário registrado com sucesso!');
    const userId = signUpData.user?.id;
    console.log('   User ID:', userId);
    
    // 2. Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Erro ao fazer login:', signInError.message);
      process.exit(1);
    }
    
    console.log('✅ Login realizado com sucesso!');
    
    // 3. Criar produto
    console.log('\n3️⃣ Criando produto...');
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([{
        name: 'Produto Teste Fluxo Completo',
        category: 'Teste',
        cost: 10.00,
        sale_price: 15.00,
        quantity: 10,
        supplier: 'Fornecedor Teste',
        min_stock: 5,
        user_id: userId
      }])
      .select();
    
    if (productError) {
      console.error('❌ Erro ao criar produto:', productError.message);
      process.exit(1);
    }
    
    console.log('✅ Produto criado com sucesso!');
    const productId = productData[0].id;
    console.log('   Product ID:', productId);
    
    // 4. Criar cliente
    console.log('\n4️⃣ Criando cliente...');
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert([{
        name: 'Cliente Teste Fluxo Completo',
        email: 'cliente@fluxo.com',
        phone: '(11) 99999-9999',
        address: 'Endereço Teste',
        user_id: userId
      }])
      .select();
    
    if (clientError) {
      console.error('❌ Erro ao criar cliente:', clientError.message);
      process.exit(1);
    }
    
    console.log('✅ Cliente criado com sucesso!');
    const clientId = clientData[0].id;
    console.log('   Client ID:', clientId);
    
    // 5. Criar transação
    console.log('\n5️⃣ Criando transação...');
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        type: 'sale',
        product_id: productId,
        client_id: clientId,
        quantity: 2,
        unit_price: 15.00,
        total: 30.00,
        payment_status: 'paid',
        user_id: userId
      }])
      .select();
    
    if (transactionError) {
      console.error('❌ Erro ao criar transação:', transactionError.message);
      process.exit(1);
    }
    
    console.log('✅ Transação criada com sucesso!');
    const transactionId = transactionData[0].id;
    console.log('   Transaction ID:', transactionId);
    
    // 6. Verificar dados criados (com filtro de usuário)
    console.log('\n6️⃣ Verificando dados criados (com filtro de usuário)...');
    
    // Verificar produto
    const { data: verifiedProduct, error: verifyProductError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('user_id', userId)
      .single();
    
    if (verifyProductError) {
      console.error('❌ Erro ao verificar produto:', verifyProductError.message);
    } else if (verifiedProduct) {
      console.log('✅ Produto verificado com sucesso!');
    } else {
      console.log('⚠️  Produto não encontrado com filtro de usuário');
    }
    
    // Verificar cliente
    const { data: verifiedClient, error: verifyClientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single();
    
    if (verifyClientError) {
      console.error('❌ Erro ao verificar cliente:', verifyClientError.message);
    } else if (verifiedClient) {
      console.log('✅ Cliente verificado com sucesso!');
    } else {
      console.log('⚠️  Cliente não encontrado com filtro de usuário');
    }
    
    // Verificar transação
    const { data: verifiedTransaction, error: verifyTransactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', userId)
      .single();
    
    if (verifyTransactionError) {
      console.error('❌ Erro ao verificar transação:', verifyTransactionError.message);
    } else if (verifiedTransaction) {
      console.log('✅ Transação verificada com sucesso!');
    } else {
      console.log('⚠️  Transação não encontrada com filtro de usuário');
    }
    
    // 7. Verificar dados criados (sem filtro de usuário)
    console.log('\n7️⃣ Verificando dados criados (sem filtro de usuário)...');
    
    // Verificar produto
    const { data: allProduct, error: allProductError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (allProductError) {
      console.error('❌ Erro ao verificar produto (sem filtro):', allProductError.message);
    } else if (allProduct) {
      console.log('✅ Produto encontrado (sem filtro)!');
      console.log('   User ID no produto:', allProduct.user_id);
    } else {
      console.log('⚠️  Produto não encontrado (sem filtro)');
    }
    
    // 8. Fazer logout
    console.log('\n8️⃣ Fazendo logout...');
    await supabase.auth.signOut();
    console.log('✅ Logout realizado com sucesso!');
    
    console.log('\n🎉 Fluxo completo simulado com sucesso!');
    console.log('\n💡 Para testar a persistência:');
    console.log('   1. Execute novamente o login com as mesmas credenciais');
    console.log('   2. Verifique se os dados criados ainda estão lá');
    console.log(`   3. Use as credenciais: ${testEmail} / ${testPassword}`);
    
  } catch (error: any) {
    console.error('❌ Erro durante a simulação:', error.message);
    process.exit(1);
  }
}

// Executar simulação
simularFluxoCompleto();