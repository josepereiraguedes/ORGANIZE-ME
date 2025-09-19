// Script para corrigir problemas do banco de dados
console.log('🔧 Iniciando correção do banco de dados...');

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não definidas corretamente');
  console.log('Por favor, verifique o arquivo .env e adicione as credenciais corretas do Supabase');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente encontradas');
console.log('URL do Supabase:', supabaseUrl);

// Instruções para obter a chave correta
console.log(`
📋 INSTRUÇÕES PARA CORRIGIR A CHAVE DE API:

1. Acesse https://app.supabase.io/
2. Selecione seu projeto
3. Vá para Settings > API
4. Copie a "anon key" (chave anônima)
5. Cole no arquivo .env na variável VITE_SUPABASE_ANON_KEY

🔑 Credenciais de acesso:
- Usuário 1: pereiraguedes1988@gmail.com / 31051988
- Usuário 2: josepereiraguedes@yahoo.com.br / 31052025

📊 Tabelas que serão criadas:
- app_users (usuários da aplicação)
- products (produtos)
- clients (clientes)
- transactions (transações)

🔒 Políticas de segurança (RLS) serão aplicadas para isolar dados por usuário.
`);

console.log('✅ Script concluído. Execute o sistema após corrigir as credenciais do Supabase.');