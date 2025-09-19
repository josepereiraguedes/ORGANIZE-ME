import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
config();

// Garantir que as variáveis de ambiente sejam carregadas corretamente
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in .env file");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Script para inicializar o banco de dados com as tabelas necessárias
 */
const initDatabase = async () => {
  try {
    console.log('Este script deve ser executado manualmente no painel do Supabase usando o conteúdo do arquivo supabase-schema.sql');
    console.log('O arquivo supabase-schema.sql já contém todo o SQL necessário para criar as tabelas e inserir os usuários.');
    console.log('Por favor, copie o conteúdo do arquivo supabase-schema.sql e execute no SQL Editor do Supabase.');
  } catch (error) {
    console.error('Erro:', error);
  }
};

// Executar o script
initDatabase();