// Script para verificar usuários usando permissões administrativas
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
config({ path: resolve(process.cwd(), '.env') });

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Verificação de Usuários (Admin) ===');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ ERRO: Credenciais do Supabase não configuradas!');
  process.exit(1);
}

// Criar cliente Supabase com service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUsersAdmin() {
  console.log('\n🔍 Verificando usuários com permissões administrativas...');
  
  try {
    // Verificar usuários na tabela app_users
    const { data: users, error: userError } = await supabaseAdmin
      .from('app_users')
      .select('*');
    
    if (userError) {
      console.log('⚠️  Erro ao buscar usuários:', userError.message);
    } else {
      console.log(`✅ Encontrados ${users.length} usuários na tabela app_users:`);
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email})`);
        console.log(`     ID: ${user.id}`);
        console.log(`     Criado em: ${user.created_at}`);
      });
    }
    
    console.log('\n📋 Verificação concluída!');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    process.exit(1);
  }
}

checkUsersAdmin();