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

async function registrarUsuarioTeste() {
  console.log('🔍 Registrando usuário de teste...\n');
  
  // Gerar email único para teste
  const timestamp = Date.now();
  const testEmail = `teste-${timestamp}@example.com`;
  const testPassword = 'Teste123!';
  
  try {
    console.log(`📧 Registrando usuário: ${testEmail}`);
    
    // Registrar novo usuário
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      console.error('❌ Erro ao registrar usuário:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Usuário registrado com sucesso!');
    console.log('   User ID:', data.user?.id);
    console.log('   Email:', data.user?.email);
    
    // Fazer login com o usuário recém-criado
    console.log('\n🔐 Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.error('❌ Erro ao fazer login:', loginError.message);
      process.exit(1);
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('   User ID:', loginData.user?.id);
    console.log('   Email:', loginData.user?.email);
    
    // Criar alguns dados de teste
    console.log('\n📦 Criando dados de teste...');
    
    // Criar um produto de teste
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([{
        name: 'Produto de Teste',
        category: 'Teste',
        cost: 10.50,
        sale_price: 15.75,
        quantity: 5,
        supplier: 'Fornecedor Teste',
        min_stock: 2,
        user_id: loginData.user?.id
      }])
      .select();
    
    if (productError) {
      console.error('❌ Erro ao criar produto:', productError.message);
    } else {
      console.log('✅ Produto criado com sucesso!');
      console.log('   Product ID:', productData[0].id);
    }
    
    // Criar um cliente de teste
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert([{
        name: 'Cliente de Teste',
        email: 'cliente@teste.com',
        phone: '(11) 99999-9999',
        address: 'Endereço de Teste',
        user_id: loginData.user?.id
      }])
      .select();
    
    if (clientError) {
      console.error('❌ Erro ao criar cliente:', clientError.message);
    } else {
      console.log('✅ Cliente criado com sucesso!');
      console.log('   Client ID:', clientData[0].id);
    }
    
    // Criar uma transação de teste
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        type: 'sale',
        product_id: productData[0].id,
        client_id: clientData[0].id,
        quantity: 1,
        unit_price: 15.75,
        total: 15.75,
        payment_status: 'paid',
        user_id: loginData.user?.id
      }])
      .select();
    
    if (transactionError) {
      console.error('❌ Erro ao criar transação:', transactionError.message);
    } else {
      console.log('✅ Transação criada com sucesso!');
      console.log('   Transaction ID:', transactionData[0].id);
    }
    
    console.log('\n📋 Registro e criação de dados concluídos!');
    console.log(`\n💡 Para testar a persistência, execute o script verificar-dados-usuario.ts com o User ID: ${loginData.user?.id}`);
    
  } catch (error: any) {
    console.error('❌ Erro durante o registro:', error.message);
    process.exit(1);
  }
}

// Executar registro
registrarUsuarioTeste();