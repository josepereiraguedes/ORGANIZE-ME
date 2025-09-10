# Script para verificar todas as configurações do sistema

Write-Host "=== Verificação Completa do Sistema ===" -ForegroundColor Green
Write-Host ""

# 1. Verificar se o arquivo .env existe
Write-Host "1. Verificando arquivo .env..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "   ✅ Arquivo .env encontrado" -ForegroundColor Green
    $envContent = Get-Content ".env"
    
    # Verificar se as variáveis do Supabase estão presentes
    $supabaseUrl = $envContent | Select-String "VITE_SUPABASE_URL" | ForEach-Object { ($_ -split "=")[1].Trim('"') }
    $supabaseAnonKey = $envContent | Select-String "VITE_SUPABASE_ANON_KEY" | ForEach-Object { ($_ -split "=")[1].Trim('"') }
    
    if ($supabaseUrl -and $supabaseAnonKey) {
        Write-Host "   ✅ Credenciais do Supabase encontradas" -ForegroundColor Green
        Write-Host "   🔗 URL: $supabaseUrl" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Credenciais do Supabase incompletas" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Arquivo .env não encontrado" -ForegroundColor Red
    Write-Host "   ℹ️  Copie .env.example para .env e preencha as credenciais" -ForegroundColor Yellow
}

Write-Host ""
# 2. Verificar dependências do Node.js
Write-Host "2. Verificando dependências do Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js não encontrado" -ForegroundColor Red
    Write-Host "   ℹ️  Instale o Node.js para executar o sistema" -ForegroundColor Yellow
}

try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm não encontrado" -ForegroundColor Red
}

# Verificar se node_modules existe
if (Test-Path "node_modules") {
    Write-Host "   ✅ Dependências do projeto instaladas" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Dependências do projeto não instaladas" -ForegroundColor Yellow
    Write-Host "   ℹ️  Execute 'npm install' para instalar as dependências" -ForegroundColor Yellow
}

Write-Host ""
# 3. Verificar arquivos de configuração importantes
Write-Host "3. Verificando arquivos de configuração..." -ForegroundColor Cyan
$requiredFiles = @(
    "supabase-schema.sql",
    "SUPABASE_SETUP_GUIDE.md",
    "CONFIG-SUPABASE-COMPLETA.md"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file não encontrado" -ForegroundColor Red
    }
}

Write-Host ""
# 4. Verificar scripts de utilidade
Write-Host "4. Verificando scripts de utilidade..." -ForegroundColor Cyan
$scriptFiles = @(
    "verificar-config-supabase.ps1",
    "configurar-cadastro-supabase.ps1",
    "testar-autenticacao.ps1"
)

foreach ($script in $scriptFiles) {
    if (Test-Path $script) {
        Write-Host "   ✅ $script encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $script não encontrado" -ForegroundColor Red
    }
}

Write-Host ""
# 5. Instruções finais
Write-Host "=== Instruções Finais ===" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Para configurar corretamente o sistema:" -ForegroundColor Yellow
Write-Host "   1. Verifique se o arquivo .env contém as credenciais corretas do Supabase" -ForegroundColor White
Write-Host "   2. Acesse o painel do Supabase e configure as opções de autenticação:" -ForegroundColor White
Write-Host "      - Ative 'Enable email signups'" -ForegroundColor White
Write-Host "      - Desative 'Enable email confirmations'" -ForegroundColor White
Write-Host "   3. Execute 'npm install' se as dependências não estiverem instaladas" -ForegroundColor White
Write-Host "   4. Inicie o servidor com 'npm run dev'" -ForegroundColor White
Write-Host ""
Write-Host "✅ Após seguir essas instruções, o sistema de autenticação deve funcionar corretamente" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Se ainda encontrar problemas, consulte:" -ForegroundColor Yellow
Write-Host "   - CONFIG-SUPABASE-COMPLETA.md para instruções detalhadas" -ForegroundColor White
Write-Host "   - SUPABASE_SETUP_GUIDE.md para guia completo de configuração" -ForegroundColor White