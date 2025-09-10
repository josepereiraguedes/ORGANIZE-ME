import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('=== DIAGNÓSTICO DE LOGIN ===');
console.log('URL do Supabase:', supabaseUrl);
console.log('Chave Anônima:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'NÃO DEFINIDA');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NÃO DEFINIDO');

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: Supabase URL e/ou Anon Key não estão definidos no arquivo .env');
  process.exit(1);
}

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin(email: string, password: string) {
  console.log(`\n=== TESTANDO LOGIN PARA ${email} ===`);
  
  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    
    if (result.error) {
      console.error('ERRO NO LOGIN:', result.error.message);
      console.error('CÓDIGO DO ERRO:', result.error.status);
      return false;
    }
    
    console.log('LOGIN BEM SUCEDIDO!');
    console.log('Usuário ID:', result.data.user?.id);
    console.log('Email confirmado:', result.data.user?.email_confirmed_at ? 'SIM' : 'NÃO');
    
    // Fazer logout após o teste
    await supabase.auth.signOut();
    console.log('Logout realizado com sucesso');
    
    return true;
  } catch (error) {
    console.error('ERRO INESPERADO:', error);
    return false;
  }
}

async function testConnection() {
  console.log('\n=== TESTANDO CONEXÃO COM O SUPABASE ===');
  
  try {
    // Tentar obter informações básicas do Supabase
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      console.error('ERRO NA CONEXÃO:', error.message);
      return false;
    }
    
    console.log('CONEXÃO BEM SUCEDIDA!');
    console.log('Dados recebidos:', data);
    return true;
  } catch (error) {
    console.error('ERRO INESPERADO NA CONEXÃO:', error);
    return false;
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('USO: npm run diagnosticar-login <email> <senha>');
    console.log('OU: node diagnosticar-login.ts <email> <senha>');
    process.exit(1);
  }
  
  const [email, password] = args;
  
  // Testar conexão primeiro
  const connectionOk = await testConnection();
  
  if (!connectionOk) {
    console.log('\nNão foi possível conectar ao Supabase. Verifique as credenciais no arquivo .env');
    process.exit(1);
  }
  
  // Testar login
  const loginOk = await testLogin(email, password);
  
  if (!loginOk) {
    console.log('\nFalha no login. Verifique suas credenciais.');
    process.exit(1);
  }
  
  console.log('\n=== DIAGNÓSTICO CONCLUÍDO COM SUCESSO ===');
}

// Executar diagnóstico
main().catch(console.error);