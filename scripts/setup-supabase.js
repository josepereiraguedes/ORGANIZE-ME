// Script interativo para configurar o Supabase
import { createInterface } from 'readline';
import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupSupabase() {
  console.log('=== Configuração Interativa do Supabase ===\n');
  
  console.log('Antes de continuar, você precisa ter:');
  console.log('1. Uma conta no Supabase (https://app.supabase.io/)');
  console.log('2. Um projeto criado');
  console.log('3. As credenciais do projeto (URL e ANON KEY)\n');
  
  const ready = await askQuestion('Você tem essas informações? (s/n): ');
  
  if (ready.toLowerCase() !== 's') {
    console.log('\nPor favor, crie seu projeto no Supabase primeiro e depois execute este script novamente.');
    console.log('Acesse: https://app.supabase.io/');
    rl.close();
    return;
  }
  
  console.log('\n=== Configuração das Credenciais ===');
  
  const supabaseUrl = await askQuestion('Digite a URL do seu projeto Supabase: ');
  const supabaseAnonKey = await askQuestion('Digite a ANON KEY do seu projeto Supabase: ');
  
  // Validar URL
  try {
    new URL(supabaseUrl);
  } catch (error) {
    console.error('❌ URL inválida. Certifique-se de digitar a URL completa começando com https://');
    rl.close();
    return;
  }
  
  if (!supabaseAnonKey || supabaseAnonKey.length < 20) {
    console.error('❌ ANON KEY inválida. A chave deve ter pelo menos 20 caracteres.');
    rl.close();
    return;
  }
  
  // Ler o arquivo .env atual
  const envPath = resolve(process.cwd(), '.env');
  let envContent;
  
  try {
    envContent = await readFile(envPath, 'utf8');
  } catch (error) {
    console.error('❌ Não foi possível ler o arquivo .env');
    rl.close();
    return;
  }
  
  // Atualizar as variáveis
  envContent = envContent.replace(
    'VITE_SUPABASE_URL=sua_url_do_projeto_aqui',
    `VITE_SUPABASE_URL=${supabaseUrl}`
  );
  
  envContent = envContent.replace(
    'VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui',
    `VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}`
  );
  
  // Salvar o arquivo atualizado
  try {
    await writeFile(envPath, envContent);
    console.log('\n✅ Arquivo .env atualizado com sucesso!');
    
    console.log('\n=== Próximos Passos ===');
    console.log('1. Execute o script de verificação:');
    console.log('   node scripts/verify-supabase-project.js');
    console.log('\n2. Se a verificação passar, execute o script de inicialização:');
    console.log('   node scripts/init-database.js');
    console.log('\n3. Depois, execute o script SQL no painel do Supabase:');
    console.log('   - Acesse https://app.supabase.io/');
    console.log('   - Selecione seu projeto');
    console.log('   - Vá para "SQL Editor"');
    console.log('   - Execute o conteúdo de scripts/supabase-setup.sql');
    
    console.log('\n🎉 Configuração concluída! Agora você pode iniciar a aplicação com "npm run dev"');
  } catch (error) {
    console.error('❌ Erro ao atualizar o arquivo .env:', error.message);
  }
  
  rl.close();
}

setupSupabase();