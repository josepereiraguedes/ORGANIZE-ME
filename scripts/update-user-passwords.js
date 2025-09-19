// Script para atualizar as senhas dos usuários
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';

// Carregar variáveis de ambiente do arquivo .env
config({ path: resolve(process.cwd(), '.env') });

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Atualização de Senhas dos Usuários ===');

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

// Senhas corretas para os usuários
const userPasswords = {
  'pereiraguedes1988@gmail.com': '31051988',
  'josepereiraguedes@yahoo.com.br': '31052025'
};

async function updateUserPasswords() {
  console.log('\n🔧 Atualizando senhas dos usuários...');
  
  try {
    // Para cada usuário, gerar um novo hash e atualizar
    for (const [email, password] of Object.entries(userPasswords)) {
      console.log(`\n🔧 Atualizando senha para: ${email}`);
      
      // Gerar hash da senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log(`  Novo hash: ${hashedPassword}`);
      
      // Atualizar o usuário na tabela app_users
      const { data, error } = await supabaseAdmin
        .from('app_users')
        .update({ password_hash: hashedPassword })
        .eq('email', email);
      
      if (error) {
        console.log(`⚠️  Erro ao atualizar ${email}:`, error.message);
      } else {
        console.log(`✅ Senha atualizada para ${email}`);
      }
    }
    
    console.log('\n📋 Atualização concluída!');
    
    // Verificar as senhas atualizadas
    console.log('\n🔍 Verificando senhas atualizadas...');
    const { data: users, error } = await supabaseAdmin
      .from('app_users')
      .select('*');
    
    if (error) {
      console.log('⚠️  Erro ao buscar usuários:', error.message);
      return;
    }
    
    for (const user of users) {
      console.log(`\nUsuário: ${user.email}`);
      console.log(`  Hash: ${user.password_hash}`);
      
      // Testar a senha correta
      const expectedPassword = userPasswords[user.email];
      if (expectedPassword) {
        const isMatch = await bcrypt.compare(expectedPassword, user.password_hash);
        if (isMatch) {
          console.log(`  ✅ Senha correta: ${expectedPassword}`);
        } else {
          console.log(`  ❌ Senha incorreta`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    process.exit(1);
  }
}

updateUserPasswords();