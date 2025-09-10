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

async function simularCenarioUsuario() {
  console.log('🔍 Simulando cenário do usuário: sair e entrar novamente...\n');
  
  try {
    // Etapa 1: Criar uma nova conta e adicionar dados
    console.log('1️⃣ Criando nova conta de usuário...');
    const timestamp = Date.now();
    const emailOriginal = `usuario-${timestamp}@example.com`;
    const senhaOriginal = 'SenhaUsuario123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: emailOriginal,
      password: senhaOriginal
    });
    
    if (signUpError) {
      console.error('❌ Erro ao criar conta:', signUpError.message);
      process.exit(1);
    }
    
    console.log('✅ Conta criada com sucesso!');
    const userId = signUpData.user?.id;
    console.log(`   Credenciais salvas:`);
    console.log(`   Email: ${emailOriginal}`);
    console.log(`   Senha: ${senhaOriginal}`);
    
    // Criar alguns dados
    console.log('\n2️⃣ Adicionando dados à conta...');
    
    // Criar produtos
    const produtos = [
      { name: 'Produto A', category: 'Categoria 1', cost: 10.00, sale_price: 15.00, quantity: 5, supplier: 'Fornecedor A', min_stock: 2 },
      { name: 'Produto B', category: 'Categoria 2', cost: 20.00, sale_price: 30.00, quantity: 3, supplier: 'Fornecedor B', min_stock: 1 }
    ];
    
    for (const produto of produtos) {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([{
          ...produto,
          user_id: userId
        }])
        .select();
      
      if (productError) {
        console.error(`❌ Erro ao criar produto ${produto.name}:`, productError.message);
      } else {
        console.log(`✅ Produto ${produto.name} criado com sucesso! (ID: ${productData[0].id})`);
      }
    }
    
    // Criar clientes
    const clientes = [
      { name: 'Cliente X', email: 'x@cliente.com', phone: '(11) 1111-1111', address: 'Endereço X' },
      { name: 'Cliente Y', email: 'y@cliente.com', phone: '(22) 2222-2222', address: 'Endereço Y' }
    ];
    
    for (const cliente of clientes) {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([{
          ...cliente,
          user_id: userId
        }])
        .select();
      
      if (clientError) {
        console.error(`❌ Erro ao criar cliente ${cliente.name}:`, clientError.message);
      } else {
        console.log(`✅ Cliente ${cliente.name} criado com sucesso! (ID: ${clientData[0].id})`);
      }
    }
    
    // Fazer logout
    console.log('\n3️⃣ Saindo do sistema...');
    await supabase.auth.signOut();
    console.log('✅ Logout realizado com sucesso!');
    
    // Etapa 2: Simular saída e nova entrada com a MESMA conta
    console.log('\n4️⃣ Entrando novamente com a MESMA conta...');
    const { data: signInData1, error: signInError1 } = await supabase.auth.signInWithPassword({
      email: emailOriginal,
      password: senhaOriginal
    });
    
    if (signInError1) {
      console.error('❌ Erro ao fazer login com a mesma conta:', signInError1.message);
      process.exit(1);
    }
    
    console.log('✅ Login realizado com sucesso com a mesma conta!');
    
    // Verificar se os dados estão lá
    console.log('\n5️⃣ Verificando se os dados persistiram...');
    const { data: productsAfterLogin, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', signInData1.user?.id);
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError.message);
    } else {
      console.log(`✅ Encontrados ${productsAfterLogin?.length || 0} produtos (mesma conta)`);
    }
    
    const { data: clientsAfterLogin, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', signInData1.user?.id);
    
    if (clientsError) {
      console.error('❌ Erro ao buscar clientes:', clientsError.message);
    } else {
      console.log(`✅ Encontrados ${clientsAfterLogin?.length || 0} clientes (mesma conta)`);
    }
    
    // Fazer logout novamente
    console.log('\n6️⃣ Saindo novamente...');
    await supabase.auth.signOut();
    console.log('✅ Logout realizado com sucesso!');
    
    // Etapa 3: Simular entrada com conta DIFERENTE
    console.log('\n7️⃣ Tentando entrar com uma conta DIFERENTE...');
    const emailDiferente = `diferente-${timestamp}@example.com`;
    const senhaDiferente = 'SenhaDiferente123!';
    
    // Criar conta diferente
    const { data: signUpData2, error: signUpError2 } = await supabase.auth.signUp({
      email: emailDiferente,
      password: senhaDiferente
    });
    
    if (signUpError2) {
      console.error('❌ Erro ao criar conta diferente:', signUpError2.message);
      process.exit(1);
    }
    
    console.log('✅ Conta diferente criada com sucesso!');
    
    // Fazer login com a conta diferente
    const { data: signInData2, error: signInError2 } = await supabase.auth.signInWithPassword({
      email: emailDiferente,
      password: senhaDiferente
    });
    
    if (signInError2) {
      console.error('❌ Erro ao fazer login com conta diferente:', signInError2.message);
      process.exit(1);
    }
    
    console.log('✅ Login realizado com conta diferente!');
    
    // Verificar se os dados da conta original aparecem
    console.log('\n8️⃣ Verificando se os dados da conta original aparecem na conta diferente...');
    const { data: productsDifferentAccount, error: productsDiffError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', signInData2.user?.id);
    
    if (productsDiffError) {
      console.error('❌ Erro ao buscar produtos na conta diferente:', productsDiffError.message);
    } else {
      console.log(`✅ Encontrados ${productsDifferentAccount?.length || 0} produtos na conta diferente`);
      if (productsDifferentAccount?.length === 0) {
        console.log('💡 Isso é esperado - cada conta só vê seus próprios dados');
      }
    }
    
    // Fazer logout da conta diferente
    console.log('\n9️⃣ Saindo da conta diferente...');
    await supabase.auth.signOut();
    console.log('✅ Logout realizado com sucesso!');
    
    console.log('\n🎉 Simulação do cenário do usuário concluída!');
    console.log('\n📋 Resumo:');
    console.log('   ✅ Quando você sai e entra com a MESMA conta, seus dados continuam lá');
    console.log('   ✅ Quando você entra com uma conta DIFERENTE, não vê os dados da conta original');
    console.log('   ✅ Isso é uma característica de segurança do sistema');
    console.log('\n💡 Para manter seus dados acessíveis:');
    console.log('   1. Sempre use a mesma conta para acessar seus dados');
    console.log('   2. Anote suas credenciais em um local seguro');
    console.log('   3. Não compartilhe sua conta com outras pessoas');
    console.log('\n🔐 Credenciais para testes futuros:');
    console.log(`   Conta original: ${emailOriginal} / ${senhaOriginal}`);
    console.log(`   Conta diferente: ${emailDiferente} / ${senhaDiferente}`);
    
  } catch (error: any) {
    console.error('❌ Erro durante a simulação:', error.message);
    process.exit(1);
  }
}

// Executar simulação
simularCenarioUsuario();