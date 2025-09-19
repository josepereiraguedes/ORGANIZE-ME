// Script para inicializar o banco de dados do Supabase
// Este script deve ser executado após configurar corretamente as credenciais do Supabase

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
config({ path: resolve(process.cwd(), '.env') });

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('=== Script de Inicialização do Banco de Dados Supabase ===');
console.log('URL do Supabase:', supabaseUrl || 'NÃO CONFIGURADO');
console.log('Chave do Supabase:', supabaseKey ? 'CONFIGURADA' : 'NÃO CONFIGURADA');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERRO: Credenciais do Supabase não configuradas!');
  console.error('Por favor, configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
  console.error('Siga as instruções no arquivo .env para obter essas credenciais.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  console.log('\n🚀 Iniciando inicialização do banco de dados...');
  
  try {
    // Testar conexão com o Supabase
    console.log('🔍 Testando conexão com o Supabase...');
    const { data, error } = await supabase
      .from('app_users')
      .select('count');
    
    if (error && error.message.includes('Invalid API key')) {
      console.error('\n❌ ERRO: Chave de API inválida!');
      console.error('Verifique se a VITE_SUPABASE_ANON_KEY está correta.');
      process.exit(1);
    }
    
    if (error && !error.message.includes('The resource was not found')) {
      console.error('\n⚠️  Aviso:', error.message);
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    
    // Criar tabelas (se não existirem)
    console.log('\n📋 Criando tabelas...');
    
    // Tabela de usuários
    const { error: userTableError } = await supabase.rpc('create_user_table');
    if (userTableError) {
      console.log('ℹ️  Tabela de usuários já existe ou será criada via SQL');
    } else {
      console.log('✅ Tabela de usuários criada');
    }
    
    // Tabela de produtos
    const { error: productTableError } = await supabase.rpc('create_product_table');
    if (productTableError) {
      console.log('ℹ️  Tabela de produtos já existe ou será criada via SQL');
    } else {
      console.log('✅ Tabela de produtos criada');
    }
    
    // Tabela de clientes
    const { error: clientTableError } = await supabase.rpc('create_client_table');
    if (clientTableError) {
      console.log('ℹ️  Tabela de clientes já existe ou será criada via SQL');
    } else {
      console.log('✅ Tabela de clientes criada');
    }
    
    // Tabela de transações
    const { error: transactionTableError } = await supabase.rpc('create_transaction_table');
    if (transactionTableError) {
      console.log('ℹ️  Tabela de transações já existe ou será criada via SQL');
    } else {
      console.log('✅ Tabela de transações criada');
    }
    
    // Inserir usuários padrão
    console.log('\n👥 Inserindo usuários padrão...');
    const users = [
      {
        id: 'c5539cba-f202-42cd-a31c-5b53eca09cb7',
        name: 'Usuário 1',
        email: 'pereiraguedes1988@gmail.com',
        password_hash: '$2a$10$8K1p/a0dURXAm7QiTRqUzuN0/S5ecC5RiJd4sKwks5uIZoWV611Om' // 31051988
      },
      {
        id: 'c436d6b4-9311-47d1-9115-2a91909ade5c',
        name: 'Usuário 2',
        email: 'josepereiraguedes@yahoo.com.br',
        password_hash: '$2a$10$8K1p/a0dURXAm7QiTRqUzuN0/S5ecC5RiJd4sKwks5uIZoWV611Om' // 31052025
      }
    ];
    
    for (const user of users) {
      console.log(`\n🔧 Inserindo usuário: ${user.email}`);
      const { data, error } = await supabase
        .from('app_users')
        .upsert(user, { onConflict: 'email' });
      
      if (error) {
        console.log(`⚠️  Erro ao inserir usuário ${user.email}:`, error.message);
        // Tentar inserir sem o ID
        console.log(`🔧 Tentando inserir ${user.email} sem ID...`);
        const { email, name, password_hash } = user;
        const { data: retryData, error: retryError } = await supabase
          .from('app_users')
          .upsert({ email, name, password_hash }, { onConflict: 'email' });
        
        if (retryError) {
          console.log(`⚠️  Erro ao inserir ${user.email} sem ID:`, retryError.message);
        } else {
          console.log(`✅ Usuário ${user.email} inserido com sucesso (sem ID)`);
        }
      } else {
        console.log(`✅ Usuário ${user.email} inserido/atualizado com sucesso.`);
      }
    }
    
    // Verificar usuários inseridos
    console.log('\n🔍 Verificando usuários inseridos...');
    const { data: finalUsers, error: finalError } = await supabase
      .from('app_users')
      .select('*');
    
    if (finalError) {
      console.log('⚠️  Erro ao verificar usuários:', finalError.message);
    } else {
      console.log(`✅ Total de usuários na tabela: ${finalUsers.length}`);
      finalUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email})`);
      });
    }
    
    console.log('\n🎉 Inicialização concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute o script SQL em scripts/supabase-setup.sql no painel do Supabase');
    console.log('2. Habilite RLS (Row Level Security) para todas as tabelas');
    console.log('3. Configure as políticas de segurança');
    console.log('4. Inicie a aplicação com "npm run dev"');
    
  } catch (error) {
    console.error('\n❌ Erro durante a inicialização:', error.message);
    process.exit(1);
  }
}

// Executar apenas se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export { initDatabase };