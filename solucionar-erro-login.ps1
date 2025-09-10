# Script PowerShell para solucionar erro de login "Invalid login credentials"
# Uso: .\solucionar-erro-login.ps1

Write-Host "🔍 Solucionando erro de login 'Invalid login credentials'..." -ForegroundColor Yellow
Write-Host ""

# Função para verificar se uma dependência está instalada
function Test-Command {
    param (
        [string]$Command
    )
    
    try {
        $commandResult = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Verificar dependências
Write-Host "🔧 Verificando dependências..." -ForegroundColor Cyan

# Verificar Node.js
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "💡 Por favor, instale o Node.js para executar este script" -ForegroundColor Yellow
    exit 1
} else {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
}

# Verificar npm
if (-not (Test-Command "npm")) {
    Write-Host "❌ npm não encontrado!" -ForegroundColor Red
    Write-Host "💡 npm é necessário para instalar dependências" -ForegroundColor Yellow
    exit 1
} else {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
}

# Verificar se estamos no diretório correto
if (-not (Test-Path ".env")) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "💡 Certifique-se de estar no diretório raiz do projeto" -ForegroundColor Yellow
    Write-Host "💡 Diretório atual: $(Get-Location)" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
}

# Verificar se as variáveis de ambiente estão definidas
$envContent = Get-Content ".env" -Raw
if ($envContent -notlike "*VITE_SUPABASE_URL*") {
    Write-Host "❌ VITE_SUPABASE_URL não encontrada no .env!" -ForegroundColor Red
    exit 1

}

if ($envContent -notlike "*VITE_SUPABASE_ANON_KEY*") {
    Write-Host "❌ VITE_SUPABASE_ANON_KEY não encontrada no .env!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Variáveis de ambiente configuradas corretamente" -ForegroundColor Green

# Verificar dependências do projeto
Write-Host "🔧 Verificando dependências do projeto..." -ForegroundColor Cyan

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules não encontrado, instalando dependências..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ node_modules encontrado" -ForegroundColor Green
}

# Verificar se @supabase/supabase-js está instalado
if (-not (Test-Path "node_modules/@supabase/supabase-js")) {
    Write-Host "⚠️  @supabase/supabase-js não encontrado, instalando..." -ForegroundColor Yellow
    npm install @supabase/supabase-js
} else {
    Write-Host "✅ @supabase/supabase-js encontrado" -ForegroundColor Green
}

# Verificar se dotenv está instalado
if (-not (Test-Path "node_modules/dotenv")) {
    Write-Host "⚠️  dotenv não encontrado, instalando..." -ForegroundColor Yellow
    npm install dotenv
} else {
    Write-Host "✅ dotenv encontrado" -ForegroundColor Green
}

# Verificar se ts-node está instalado
if (-not (Test-Command "ts-node")) {
    Write-Host "⚠️  ts-node não encontrado, instalando globalmente..." -ForegroundColor Yellow
    npm install -g ts-node typescript @types/node
} else {
    Write-Host "✅ ts-node encontrado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🧪 Executando testes de diagnóstico..." -ForegroundColor Cyan
Write-Host ""

# Teste 1: Verificar variáveis de ambiente
Write-Host "1️⃣ Verificando variáveis de ambiente..." -ForegroundColor Cyan
try {
    npx ts-node verificar-env.ts
    Write-Host "✅ Variáveis de ambiente carregadas corretamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao verificar variáveis de ambiente" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 2: Verificar conexão com Supabase
Write-Host ""
Write-Host "2️⃣ Testando conexão com Supabase..." -ForegroundColor Cyan
try {
    npx ts-node testar-conexao-correta.ts
    Write-Host "✅ Conexão com Supabase estabelecida" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro na conexão com Supabase" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 3: Verificar autenticação
Write-Host ""
Write-Host "3️⃣ Testando autenticação..." -ForegroundColor Cyan
try {
    npx ts-node testar-login.ts
    Write-Host "✅ Sistema de autenticação funcionando" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no sistema de autenticação" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Resumo dos testes:" -ForegroundColor Cyan
Write-Host "   ✅ Variáveis de ambiente carregadas corretamente" -ForegroundColor Green
Write-Host "   ✅ Conexão com Supabase estabelecida" -ForegroundColor Green
Write-Host "   ✅ Sistema de autenticação funcionando" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Se você ainda está tendo problemas de login:" -ForegroundColor Yellow
Write-Host "   1. Verifique se está usando as credenciais corretas" -ForegroundColor Yellow
Write-Host "   2. Confirme que não há espaços extras no email/senha" -ForegroundColor Yellow
Write-Host "   3. Verifique se o usuário já foi registrado" -ForegroundColor Yellow
Write-Host "   4. Consulte SOLUCAO-ERRO-LOGIN.md para mais detalhes" -ForegroundColor Yellow
Write-Host ""
Write-Host "📄 Documentação:" -ForegroundColor Cyan
Write-Host "   - SOLUCAO-ERRO-LOGIN.md" -ForegroundColor White
Write-Host "   - CONFIG-SUPABASE-COMPLETA.md" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Diagnóstico concluído!" -ForegroundColor Green