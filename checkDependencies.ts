import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function checkDependencies() {
  console.log('Verificando dependências do projeto...\n');
  
  // Verificar Node.js
  console.log('Node.js:', process.version);
  
  // Verificar variáveis de ambiente
  console.log('\nVariáveis de ambiente:');
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓ Configurada' : '✗ Não configurada');
  console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✓ Configurada' : '✗ Não configurada');
  
  // Verificar dependências do Supabase
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('\n⚠️  Variáveis de ambiente do Supabase não configuradas');
      return;
    }
    
    // Tentar criar cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('\n✓ Cliente do Supabase criado com sucesso');
    
    // Tentar conectar ao Supabase
    console.log('\nTestando conexão com o Supabase...');
    const { data, error } = await supabase
      .from('logins')
      .select('count()', { count: 'exact', head: true });
    
    if (error) {
      console.log('✗ Erro ao conectar ao Supabase:', error.message);
    } else {
      console.log('✓ Conexão com o Supabase estabelecida com sucesso');
    }
  } catch (error) {
    console.log('✗ Erro ao verificar dependências do Supabase:', error);
  }
  
  console.log('\nVerificação concluída!');
}

// Executar verificação
checkDependencies();