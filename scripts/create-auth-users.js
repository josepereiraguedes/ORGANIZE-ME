// Script para criar usuários de autenticação no Supabase
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
config({ path: resolve(process.cwd(), '.env') });

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Usar service role key para criar usuários
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('=== Criação de Usuários de Autenticação Supabase ===');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ ERRO: Credenciais do Supabase não configuradas!');
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase com service role key para acesso administrativo
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Usuários padrão
const defaultUsers = [
  {
    email: 'pereiraguedes1988@gmail.com',
    password: '31051988',
    name: 'Usuário 1'
  },
  {
    email: 'josepereiraguedes@yahoo.com.br',
    password: '31052025',
    name: 'Usuário 2'
  }
];

async function createAuthUsers() {
  console.log('\n🚀 Iniciando criação de usuários de autenticação...');
  
  try {
    // Verificar se já existem usuários
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('⚠️  Aviso: Não foi possível verificar usuários existentes:', listError.message);
      console.log('Continuando com a criação dos usuários...\n');
    } else {
      const existingEmails = existingUsers?.users?.map(u => u.email) || [];
      console.log(`✅ Encontrados ${existingUsers?.users?.length || 0} usuários existentes`);
      
      // Filtrar usuários que já existem
      const usersToCreate = defaultUsers.filter(user => !existingEmails.includes(user.email));
      
      if (usersToCreate.length === 0) {
        console.log('ℹ️  Todos os usuários padrão já existem. Nada a fazer.');
        process.exit(0);
      }
      
      console.log(`🔧 Criando ${usersToCreate.length} novos usuários...`);
    }
    
    // Criar usuários
    for (const user of defaultUsers) {
      console.log(`\n👤 Criando usuário: ${user.email}`);
      
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Confirmar e-mail automaticamente
        user_metadata: {
          name: user.name
        }
      });
      
      if (error) {
        console.log(`⚠️  Erro ao criar usuário ${user.email}:`, error.message);
        
        // Se for erro de usuário já existente, continuar
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`ℹ️  Usuário ${user.email} já existe. Continuando...`);
        }
      } else {
        console.log(`✅ Usuário ${user.email} criado com sucesso!`);
        console.log(`   ID: ${data.user.id}`);
      }
    }
    
    console.log('\n🎉 Criação de usuários concluída!');
    
    // Verificar novamente os usuários
    const { data: finalUsers, error: finalError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (!finalError && finalUsers) {
      console.log(`\n📋 Total de usuários agora: ${finalUsers.users.length}`);
      finalUsers.users.forEach((user, index) => {
        console.log(`\nUsuário ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Confirmed: ${user.email_confirmed_at ? 'Sim' : 'Não'}`);
      });
    }
    
    console.log('\n✅ Processo concluído! Agora você pode fazer login na aplicação.');
    
  } catch (error) {
    console.error('❌ ERRO durante a criação de usuários:', error.message);
    process.exit(1);
  }
}

createAuthUsers();