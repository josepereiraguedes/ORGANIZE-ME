import { createClient } from '@supabase/supabase-js';

// Substitua essas variáveis com as credenciais corretas do seu projeto Supabase
const supabaseUrl = 'https://xjbuvtfbdpyoapmmsfeg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYnV2dGZiZHB5b2FwbW1zZmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2NzY4MjQsImV4cCI6MjA0MjI1MjgyNH0.K9z9v9z9v9z9v9z9v9z9v9z9v9z9v9z9v9z9v9z9v9z';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  try {
    // Testar conexão básica
    const { data, error } = await supabase
      .from('app_users')
      .select('count()', { count: 'exact' });
    
    if (error) {
      console.log('Erro ao conectar ao Supabase:', error);
      return;
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso!');
    console.log('Contagem de usuários:', data);
  } catch (error) {
    console.log('Erro ao conectar ao Supabase:', error);
  }
}

checkConnection();