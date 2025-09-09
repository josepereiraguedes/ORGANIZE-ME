// Script para verificar a configuração do Supabase
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
config({ path: resolve(process.cwd(), '.env') });

async function checkSupabaseConfig() {
  console.log('🔍 Verificando configuração do Supabase...');
  console.log('');
  
  // Verificar se as variáveis de ambiente estão definidas
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || supabaseUrl === 'sua_url_do_supabase_aqui') {
    console.error('❌ VITE_SUPABASE_URL não está configurada corretamente no arquivo .env');
    console.log('');
    console.log('💡 Como corrigir:');
    console.log('   1. Abra o arquivo .env na raiz do projeto');
    console.log('   2. Substitua "sua_url_do_supabase_aqui" pela URL real do seu projeto Supabase');
    console.log('   3. Siga o guia em CONFIGURE_SUPABASE.md para obter as credenciais');
    console.log('');
    process.exit(1);
  }
  
  if (!supabaseAnonKey || supabaseAnonKey === 'sua_chave_anonima_do_supabase_aqui') {
    console.error('❌ VITE_SUPABASE_ANON_KEY não está configurada corretamente no arquivo .env');
    console.log('');
    console.log('💡 Como corrigir:');
    console.log('   1. Abra o arquivo .env na raiz do projeto');
    console.log('   2. Substitua "sua_chave_anonima_do_supabase_aqui" pela chave real do seu projeto Supabase');
    console.log('   3. Siga o guia em CONFIGURE_SUPABASE.md para obter as credenciais');
    console.log('');
    process.exit(1);
  }
  
  console.log('✅ Variáveis de ambiente configuradas');
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
  
  try {
    // Validar formato da URL
    try {
      new URL(supabaseUrl);
    } catch (urlError) {
      console.error('❌ VITE_SUPABASE_URL não é uma URL válida');
      console.log('');
      console.log('💡 Como corrigir:');
      console.log('   Verifique se a URL está no formato correto: https://seu-projeto.supabase.co');
      console.log('');
      process.exit(1);
    }
    
    // Criar cliente do Supabase para teste
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Tentar conectar ao Supabase
    console.log('🔌 Testando conexão com Supabase...');
    
    // Testar uma operação simples
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.message.includes('Invalid API key')) {
        console.error('❌ Chave de API inválida (VITE_SUPABASE_ANON_KEY)');
        console.log('');
        console.log('💡 Como corrigir:');
        console.log('   1. Verifique se copiou a chave "anon key" correta do painel do Supabase');
        console.log('   2. Certifique-se de que não há espaços extras na chave');
        console.log('');
        process.exit(1);
      } else if (error.message.includes('Could not connect to Supabase') || error.message.includes('fetch failed')) {
        console.error('❌ Não foi possível conectar ao Supabase');
        console.log('');
        console.log('💡 Como corrigir:');
        console.log('   1. Verifique se a VITE_SUPABASE_URL está correta');
        console.log('   2. Confirme sua conexão com a internet');
        console.log('   3. Verifique se o projeto Supabase está ativo');
        console.log('');
        process.exit(1);
      } else if (error.message.includes('The resource was not found')) {
        console.warn('⚠️  Tabelas não encontradas. Isso pode ser esperado se o schema ainda não foi criado.');
        console.log('✅ Conexão com Supabase estabelecida com sucesso');
        console.log('');
        console.log('💡 Próximos passos:');
        console.log('   1. Acesse o painel do Supabase (https://supabase.com/dashboard)');
        console.log('   2. Vá para "Table Editor" > "SQL Editor"');
        console.log('   3. Cole o conteúdo do arquivo supabase-schema.sql');
        console.log('   4. Clique em "Run" para executar o script');
        console.log('   5. Consulte MANUAL_DATABASE_SETUP.md para instruções detalhadas');
        console.log('');
        process.exit(0);
      } else {
        console.error(`❌ Erro ao conectar ao Supabase: ${error.message}`);
        console.log('');
        console.log('💡 Tente seguir o guia em CONFIGURE_SUPABASE.md para verificar sua configuração');
        console.log('');
        process.exit(1);
      }
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso');
    console.log('');
    console.log('🎉 Configuração do Supabase verificada com sucesso!');
    console.log('');
    console.log('💡 Agora você pode:');
    console.log('   - Iniciar o servidor de desenvolvimento com "yarn dev"');
    console.log('   - Testar o cadastro e login na aplicação');
    console.log('');
    
  } catch (error: any) {
    console.error(`❌ Erro ao conectar ao Supabase: ${error.message}`);
    console.log('');
    console.log('💡 Tente seguir o guia em CONFIGURE_SUPABASE.md para verificar sua configuração');
    console.log('');
    process.exit(1);
  }
}

// Executar a verificação
checkSupabaseConfig();