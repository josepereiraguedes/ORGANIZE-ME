# Script PowerShell para verificar a configuração do Supabase

Write-Host "=== Verificação Automática da Configuração do Supabase ===" -ForegroundColor Green
Write-Host ""

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado. Por favor, instale o Node.js (que inclui o npm) primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se as dependências estão instaladas
if (Test-Path "node_modules") {
    Write-Host "✅ Dependências do projeto encontradas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dependências não encontradas. Instalando..." -ForegroundColor Yellow
    npm install
}

# Executar o script de verificação do Supabase
Write-Host ""
Write-Host "🔍 Executando verificação do Supabase..." -ForegroundColor Cyan

try {
    # Instalar dependências necessárias se não existirem
    Write-Host "📦 Verificando dependências..." -ForegroundColor Cyan
    
    # Verificar se @supabase/supabase-js está instalado
    if (-not (Test-Path "node_modules/@supabase/supabase-js")) {
        Write-Host "📥 Instalando @supabase/supabase-js..." -ForegroundColor Cyan
        npm install @supabase/supabase-js
    }
    
    # Verificar se dotenv está instalado
    if (-not (Test-Path "node_modules/dotenv")) {
        Write-Host "📥 Instalando dotenv..." -ForegroundColor Cyan
        npm install dotenv
    }
    
    # Executar o script de verificação
    Write-Host "🚀 Executando verificação..." -ForegroundColor Cyan
    node verificarSupabase.js
    
} catch {
    Write-Host "❌ Erro ao executar a verificação:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    Write-Host ""
    Write-Host "ℹ️  Como alternativa, você pode verificar manualmente:" -ForegroundColor Yellow
    Write-Host "   1. Execute 'npm run dev'" -ForegroundColor White
    Write-Host "   2. Acesse http://localhost:5211" -ForegroundColor White
    Write-Host "   3. Tente criar uma conta e fazer login" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Instruções Adicionais ===" -ForegroundColor Green
Write-Host ""
Write-Host "Se você encontrar problemas com a autenticação:" -ForegroundColor Yellow
Write-Host "1. Verifique se as credenciais no arquivo .env estão corretas" -ForegroundColor White
Write-Host "2. Acesse o painel do Supabase e desative a confirmação de email:" -ForegroundColor White
Write-Host "   - Authentication > Settings > Email Confirmations > Desative" -ForegroundColor White
Write-Host "3. Reinicie o servidor de desenvolvimento" -ForegroundColor White