import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

console.log('🔍 Testando credenciais específicas...\n');

// Verificar variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarCredenciais(email: string, password: string) {
  try {
    console.log(`🔐 Testando login com: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ Erro ao fazer login:', error.message);
      
      // Verificar tipos específicos de erros
      if (error.message.includes('Invalid login credentials')) {
        console.log('💡 Possíveis causas:');
        console.log('   - Email ou senha incorretos');
        console.log('   - Usuário não existe');
        console.log('   - Senha incorreta');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('💡 O email não foi confirmado');
        console.log('   - Verifique sua caixa de entrada');
        console.log('   - Verifique a pasta de spam');
      }
      
      return false;
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('   User ID:', data.user?.id);
    console.log('   Email:', data.user?.email);
    
    // Fazer logout
    await supabase.auth.signOut();
    console.log('👋 Logout realizado');
    
    return true;
    
  } catch (error: any) {
    console.error('❌ Erro durante o teste:', error.message);
    return false;
  }
}

// Verificar se foram passados argumentos
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Uso: npx ts-node testar-credenciais-especificas.ts <email> <senha>');
  console.log('Exemplo: npx ts-node testar-credenciais-especificas.ts usuario@example.com senha123');
  process.exit(1);
}

// Executar teste
testarCredenciais(email, password).then(success => {
  if (success) {
    console.log('\n🎉 Teste concluído com sucesso!');
  } else {
    console.log('\n❌ Teste falhou!');
    process.exit(1);
  }
});