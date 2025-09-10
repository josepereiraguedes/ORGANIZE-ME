import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

console.log('🔍 Verificando variáveis de ambiente...\n');

// Verificar variáveis de ambiente
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY);

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.log('💡 Verifique se o arquivo .env existe e contém as variáveis corretas');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente carregadas com sucesso!');

// Verificar formato das variáveis
if (!process.env.VITE_SUPABASE_URL?.startsWith('https://')) {
  console.warn('⚠️  VITE_SUPABASE_URL não parece estar no formato correto');
}

if (process.env.VITE_SUPABASE_ANON_KEY?.length < 50) {
  console.warn('⚠️  VITE_SUPABASE_ANON_KEY parece estar muito curta');
}

console.log('\n📋 Verificação concluída!');