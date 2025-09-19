// Script de inicialização completa para produção
import { createInterface } from 'readline';
import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
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

async function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  console.log(`   Comando: ${command}`);
  
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(`   Saída: ${stdout}`);
    if (stderr) console.log(`   Erro: ${stderr}`);
    return { success: true, stdout, stderr };
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return { success: false, error };
  }
}

async function setupProduction() {
  console.log('=== Setup Completo para Produção ===\n');
  
  console.log('Este script irá configurar completamente o sistema para produção.');
  console.log('Você precisará das credenciais do seu projeto Supabase.\n');
  
  const ready = await askQuestion('Deseja continuar? (s/n): ');
  if (ready.toLowerCase() !== 's') {
    console.log('Setup cancelado.');
    rl.close();
    return;
  }
  
  console.log('\n=== Passo 1: Verificação de Configuração ===');
  await runCommand('npm run verify:supabase', 'Verificando configuração do Supabase');
  
  console.log('\n=== Passo 2: Inicialização do Banco de Dados ===');
  await runCommand('npm run init:supabase', 'Inicializando banco de dados');
  
  console.log('\n=== Passo 3: Atualização de Senhas ===');
  await runCommand('npm run update:user-passwords', 'Atualizando senhas dos usuários');
  
  console.log('\n=== Passo 4: Verificação de Usuários ===');
  await runCommand('npm run check:users-admin', 'Verificando usuários no banco de dados');
  
  console.log('\n=== Passo 5: Teste de Autenticação ===');
  await runCommand('npm run test:auth-flow', 'Testando fluxo de autenticação');
  
  console.log('\n=== Passo 6: Build para Produção ===');
  await runCommand('npm run build', 'Construindo aplicação para produção');
  
  console.log('\n🎉 Setup completo para produção concluído!');
  console.log('\nPróximos passos:');
  console.log('1. Acesse o painel do Supabase');
  console.log('2. Vá para "SQL Editor"');
  console.log('3. Execute o conteúdo de scripts/supabase-setup.sql');
  console.log('4. Habilite RLS (Row Level Security) se necessário');
  console.log('5. Faça deploy dos arquivos da pasta "dist"');
  
  rl.close();
}

setupProduction();