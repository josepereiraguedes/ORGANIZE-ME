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

async function verificarAuthSupabase() {
  console.log('🔍 Verificando serviço de autenticação do Supabase...\n');
  
  try {
    // Testar registro de usuário
    console.log('👤 Testando registro de usuário...');
    const timestamp = Date.now();
    const testEmail = `teste-auth-${timestamp}@example.com`;
    const testPassword = 'Teste123!';
    
    console.log(`   Registrando usuário: ${testEmail}`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.error('❌ Erro ao registrar usuário:', signUpError.message);
      console.log('💡 Possíveis causas:');
      console.log('   - Credenciais do Supabase incorretas');
      console.log('   - Provedor de email não configurado');
      console.log('   - Limite de taxa excedido');
      console.log('   - Problemas com a configuração do projeto');
    } else {
      console.log('✅ Registro de usuário bem-sucedido!');
      console.log('   User ID:', signUpData.user?.id);
      console.log('   Email:', signUpData.user?.email);
      console.log('   Confirmed:', signUpData.user?.confirmed_at ? 'Sim' : 'Não');
      
      // Tentar fazer login
      console.log('\n🔐 Testando login...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        console.error('❌ Erro ao fazer login:', signInError.message);
      } else {
        console.log('✅ Login bem-sucedido!');
        console.log('   User ID:', signInData.user?.id);
        console.log('   Email:', signInData.user?.email);
        
        // Verificar se há sessão
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          console.log('✅ Sessão ativa estabelecida!');
        } else {
          console.log('⚠️  Nenhuma sessão ativa encontrada');
        }
      }
    }
    
    console.log('\n📋 Verificação do serviço de autenticação concluída!');
    
  } catch (error: any) {
    console.error('❌ Erro durante a verificação:', error.message);
    process.exit(1);
  }
}

// Executar verificação
verificarAuthSupabase();