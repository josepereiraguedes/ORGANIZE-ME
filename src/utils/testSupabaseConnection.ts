import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
config();

// Garantir que as variáveis de ambiente sejam carregadas corretamente
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Carregada' : 'Não carregada');

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in .env file");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Testar conexão com o Supabase
 */
const testConnection = async () => {
  try {
    console.log('Testando conexão com o Supabase...');
    
    // Tentar buscar dados da tabela app_users
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Erro ao conectar ao Supabase:', error.message);
      return;
    }
    
    console.log('Conexão bem-sucedida!');
    console.log('Dados retornados:', data);
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
  }
};

// Executar o teste
testConnection();