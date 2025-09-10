#!/usr/bin/env node

/**
 * Script para verificar os dados do usuário no sistema
 * 
 * Este script ajuda a diagnosticar problemas de persistência de dados
 * mostrando quantos registros existem para cada tipo de dado.
 */

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
  console.log('💡 Verifique se o arquivo .env existe e contém as variáveis corretas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarMeusDados() {
  console.log('🔍 Verificando seus dados no sistema...\n');
  
  try {
    // Verificar se há usuário logado
    console.log('🔐 Verificando sessão atual...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao verificar sessão:', sessionError.message);
      process.exit(1);
    }
    
    if (!sessionData.session) {
      console.log('⚠️  Nenhuma sessão ativa encontrada');
      console.log('💡 Você precisa estar logado para verificar seus dados');
      console.log('💡 Acesse o sistema e faça login primeiro');
      process.exit(1);
    }
    
    const userId = sessionData.session.user.id;
    console.log('✅ Sessão ativa encontrada');
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: ${sessionData.session.user.email}\n`);
    
    // Verificar produtos
    console.log('📦 Verificando seus produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError.message);
    } else {
      console.log(`✅ Você tem ${products?.length || 0} produtos cadastrados`);
      if (products && products.length > 0) {
        console.log('   Produtos recentes:');
        products.slice(0, 3).forEach((product: any) => {
          console.log(`   - ${product.name} (${product.quantity} em estoque)`);
        });
        if (products.length > 3) {
          console.log(`   ... e mais ${products.length - 3} produtos`);
        }
      }
    }
    
    // Verificar clientes
    console.log('\n👥 Verificando seus clientes...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);
    
    if (clientsError) {
      console.error('❌ Erro ao buscar clientes:', clientsError.message);
    } else {
      console.log(`✅ Você tem ${clients?.length || 0} clientes cadastrados`);
      if (clients && clients.length > 0) {
        console.log('   Clientes recentes:');
        clients.slice(0, 3).forEach((client: any) => {
          console.log(`   - ${client.name} (${client.email || 'Sem email'})`);
        });
        if (clients.length > 3) {
          console.log(`   ... e mais ${clients.length - 3} clientes`);
        }
      }
    }
    
    // Verificar transações
    console.log('\n💰 Verificando suas transações...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);
    
    if (transactionsError) {
      console.error('❌ Erro ao buscar transações:', transactionsError.message);
    } else {
      console.log(`✅ Você tem ${transactions?.length || 0} transações registradas`);
      if (transactions && transactions.length > 0) {
        console.log('   Transações recentes:');
        transactions.slice(0, 3).forEach((transaction: any) => {
          const date = new Date(transaction.created_at).toLocaleDateString('pt-BR');
          console.log(`   - ${transaction.type} de ${transaction.quantity} itens em ${date}`);
        });
        if (transactions.length > 3) {
          console.log(`   ... e mais ${transactions.length - 3} transações`);
        }
      }
    }
    
    console.log('\n📋 Resumo:');
    console.log(`   📦 Produtos: ${products?.length || 0}`);
    console.log(`   👥 Clientes: ${clients?.length || 0}`);
    console.log(`   💰 Transações: ${transactions?.length || 0}`);
    
    if ((products?.length || 0) + (clients?.length || 0) + (transactions?.length || 0) === 0) {
      console.log('\n💡 Dica: Se você esperava ver dados aqui, pode estar usando uma conta diferente.');
      console.log('   Verifique se você fez login com as mesmas credenciais que usou para criar os dados.');
    } else {
      console.log('\n✅ Seus dados estão sendo carregados corretamente!');
      console.log('   Eles continuarão disponíveis mesmo quando você sair e entrar novamente com a mesma conta.');
    }
    
  } catch (error: any) {
    console.error('❌ Erro durante a verificação:', error.message);
    process.exit(1);
  }
}

// Executar verificação
verificarMeusDados();