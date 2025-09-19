// Script para verificar se o projeto Supabase existe
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
config({ path: resolve(process.cwd(), '.env') });

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('=== Verificação de Projeto Supabase ===');

if (!supabaseUrl || supabaseUrl === 'sua_url_do_projeto_aqui') {
  console.error('❌ ERRO: URL do Supabase não configurada!');
  console.error('Configure VITE_SUPABASE_URL no arquivo .env com a URL correta do seu projeto Supabase');
  console.error('Instruções:');
  console.error('1. Acesse https://app.supabase.io/');
  console.error('2. Crie um novo projeto');
  console.error('3. Copie a URL do projeto em "Project Settings" > "API"');
  process.exit(1);
}

if (!supabaseKey || supabaseKey === 'sua_chave_anonima_aqui') {
  console.error('❌ ERRO: Chave ANON KEY do Supabase não configurada!');
  console.error('Configure VITE_SUPABASE_ANON_KEY no arquivo .env com a chave correta');
  console.error('Instruções:');
  console.error('1. Acesse https://app.supabase.io/');
  console.error('2. Selecione seu projeto');
  console.error('3. Vá para "Project Settings" > "API"');
  console.error('4. Copie a chave "anon public" (não a "service_role")');
  process.exit(1);
}

console.log('URL do Supabase:', supabaseUrl);
console.log('Chave do Supabase: CONFIGURADA');

// Verificar formato da URL
try {
  new URL(supabaseUrl);
} catch (urlError) {
  console.error('❌ ERRO: URL do Supabase inválida!');
  console.error('A URL deve começar com https:// e seguir o formato: https://seu-projeto.supabase.co');
  process.exit(1);
}

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (clientError) {
  console.error('❌ ERRO: Não foi possível criar cliente Supabase');
  console.error('Verifique se a URL e a chave estão corretas');
  process.exit(1);
}

async function verifyProject() {
  console.log('\n🔍 Verificando projeto...');
  
  try {
    // Tentar fazer uma requisição simples para verificar se o projeto existe
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.status === 404) {
      console.error('\n❌ ERRO: Projeto Supabase não encontrado!');
      console.error('Verifique se a URL do projeto está correta.');
      console.error('Instruções:');
      console.error('1. Acesse https://app.supabase.io/');
      console.error('2. Crie um novo projeto');
      console.error('3. Copie a URL correta do projeto em "Project Settings" > "API"');
      process.exit(1);
    }
    
    if (response.status === 401) {
      console.error('\n❌ ERRO: Chave de API inválida!');
      console.error('Verifique se a chave ANON KEY está correta.');
      console.error('Instruções:');
      console.error('1. Acesse https://app.supabase.io/');
      console.error('2. Selecione seu projeto');
      console.error('3. Vá para "Project Settings" > "API"');
      console.error('4. Copie a chave "anon public" (não a "service_role")');
      process.exit(1);
    }
    
    if (response.ok) {
      console.log('✅ Projeto Supabase verificado com sucesso!');
      
      // Tentar acessar uma tabela para verificar permissões
      try {
        const { data, error } = await supabase
          .from('app_users')
          .select('count')
          .limit(1);
        
        if (error && error.message.includes('Invalid API key')) {
          console.error('\n❌ ERRO: Chave de API inválida!');
          process.exit(1);
        }
        
        console.log('✅ Conexão com banco de dados estabelecida!');
        console.log('\n🎉 Tudo pronto! Você pode iniciar a aplicação com "npm run dev"');
      } catch (dbError) {
        console.log('ℹ️  Banco de dados ainda não configurado. Execute o script de inicialização.');
        console.log('Execute: node scripts/init-database.js');
      }
    } else {
      console.error(`\n❌ ERRO: ${response.status} - ${response.statusText}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERRO de conexão:', error.message);
    console.error('Verifique sua conexão com a internet e tente novamente.');
    process.exit(1);
  }
}

verifyProject();