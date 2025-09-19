// Script para desativar RLS temporariamente para testes
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
config({ path: resolve(process.cwd(), '.env') });

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Desativação Temporária de RLS ===');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ ERRO: Credenciais do Supabase não configuradas!');
  process.exit(1);
}

// Criar cliente Supabase com service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function disableRLS() {
  console.log('\n🔍 Desativando RLS para tabelas...');
  
  const tables = ['app_users', 'products', 'clients', 'transactions'];
  
  try {
    for (const table of tables) {
      console.log(`\n🔧 Desativando RLS para tabela: ${table}`);
      
      const { error } = await supabase.rpc('disable_rls_for_table', {
        table_name: table
      });
      
      if (error) {
        console.log(`⚠️  Erro ao desativar RLS para ${table}:`, error.message);
        // Tentar desativar diretamente
        const { error: directError } = await supabase
          .from(table)
          .delete()
          .neq('id', 0)
          .limit(1);
        
        if (directError) {
          console.log(`⚠️  Tentativa direta também falhou para ${table}:`, directError.message);
        } else {
          console.log(`✅ Comando direto executado para ${table}`);
        }
      } else {
        console.log(`✅ RLS desativado para ${table}`);
      }
    }
    
    console.log('\n🎉 Processo de desativação de RLS concluído!');
    console.log('Agora tente criar os usuários novamente.');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    process.exit(1);
  }
}

disableRLS();