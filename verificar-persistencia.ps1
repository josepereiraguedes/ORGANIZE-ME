# Script PowerShell para verificar a persistência de dados
# Uso: .\verificar-persistencia.ps1

Write-Host "🔍 Verificando persistência de dados no sistema..." -ForegroundColor Yellow
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
Write-Host "🧪 Executando testes de persistência..." -ForegroundColor Cyan
Write-Host ""

# Teste 1: Verificar conexão com Supabase
Write-Host "1️⃣ Testando conexão com Supabase..." -ForegroundColor Cyan
try {
    npx ts-node testar-conexao-supabase.ts
    Write-Host "✅ Conexão com Supabase estabelecida" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro na conexão com Supabase" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 2: Verificar autenticação
Write-Host ""
Write-Host "2️⃣ Testando autenticação..." -ForegroundColor Cyan
try {
    npx ts-node verificar-auth-supabase.ts
    Write-Host "✅ Serviço de autenticação funcionando" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no serviço de autenticação" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 3: Simular fluxo completo
Write-Host ""
Write-Host "3️⃣ Testando fluxo completo de persistência..." -ForegroundColor Cyan
try {
    npx ts-node simular-fluxo-completo.ts
    Write-Host "✅ Fluxo completo de persistência funcionando" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no fluxo completo de persistência" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Todos os testes de persistência passaram!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo:" -ForegroundColor Cyan
Write-Host "   ✅ Conexão com Supabase estabelecida" -ForegroundColor Green
Write-Host "   ✅ Serviço de autenticação funcionando" -ForegroundColor Green
Write-Host "   ✅ Fluxo completo de persistência funcionando" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Se seus dados não estão aparecendo no sistema:" -ForegroundColor Yellow
Write-Host "   1. Verifique se você está usando a mesma conta que usou para criar os dados" -ForegroundColor Yellow
Write-Host "   2. Tente sair e entrar novamente com as mesmas credenciais" -ForegroundColor Yellow
Write-Host "   3. Confirme que não há diferenças de maiúsculas/minúsculas no email" -ForegroundColor Yellow
Write-Host ""
Write-Host "📄 Para mais informações, consulte:" -ForegroundColor Cyan
Write-Host "   - PERSISTENCIA-DADOS.md" -ForegroundColor White
Write-Host "   - SOLUCAO-PROBLEMAS-PERSISTENCIA.md" -ForegroundColor White