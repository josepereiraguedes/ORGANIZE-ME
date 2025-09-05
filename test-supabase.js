// Script para testar a conexão com o Supabase
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Definida' : 'Não definida');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Supabase URL e/ou Anon Key não estão definidos no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Testa a conexão
async function testConnection() {
  try {
    console.log('Testando conexão com o Supabase...');
    
    // Tenta buscar dados da tabela products (se existir)
    const { data, error } = await supabase
      .from('products')
      .select('count()');
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error.message);
      console.error('Detalhes do erro:', error);
    } else {
      console.log('Conexão com o Supabase estabelecida com sucesso!');
      console.log('Dados retornados:', data);
    }
  } catch (err) {
    console.error('Erro inesperado:', err);
  }
}

testConnection();