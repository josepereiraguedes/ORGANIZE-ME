// Script para verificar configurações do Supabase
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
config({ path: resolve(process.cwd(), '.env') });

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('=== Verificação de Configurações do Supabase ===');
console.log('URL do Supabase:', supabaseUrl || 'NÃO CONFIGURADO');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Credenciais do Supabase não configuradas!');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabaseConfig() {
  console.log('\n🔍 Verificando configurações do Supabase...');
  
  try {
    // Testar conexão básica
    const { data, error } = await supabase
      .from('app_users')
      .select('count');
    
    if (error && error.message.includes('Invalid API key')) {
      console.error('❌ ERRO: Chave de API inválida!');
      console.error('Verifique se a VITE_SUPABASE_ANON_KEY está correta.');
      process.exit(1);
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    
    // Verificar se as tabelas existem
    console.log('\n🔍 Verificando tabelas...');
    
    const tablesToCheck = ['app_users', 'products', 'clients', 'transactions'];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`⚠️  Tabela ${table}:`, error.message);
        } else {
          console.log(`✅ Tabela ${table}: OK`);
        }
      } catch (tableError) {
        console.log(`⚠️  Erro ao verificar tabela ${table}:`, tableError.message);
      }
    }
    
    // Verificar usuários na tabela app_users
    console.log('\n👥 Verificando usuários na tabela app_users...');
    try {
      const { data: users, error: userError } = await supabase
        .from('app_users')
        .select('*');
      
      if (userError) {
        console.log('⚠️  Erro ao buscar usuários:', userError.message);
      } else {
        console.log(`✅ Encontrados ${users.length} usuários na tabela app_users:`);
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.name} (${user.email})`);
        });
      }
    } catch (userError) {
      console.log('⚠️  Erro ao verificar usuários:', userError.message);
    }
    
    console.log('\n📋 Configuração verificada com sucesso!');
    console.log('\nℹ️  Lembrete: Para fazer login, você precisa criar usuários de autenticação.');
    console.log('Execute: npm run create:auth-users');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    process.exit(1);
  }
}

checkSupabaseConfig();