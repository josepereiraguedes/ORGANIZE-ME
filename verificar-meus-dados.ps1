# Script PowerShell para verificar os dados do usuário no sistema
# Uso: .\verificar-meus-dados.ps1

Write-Host "🔍 Verificando seus dados no sistema..." -ForegroundColor Yellow
Write-Host ""

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "💡 Por favor, instale o Node.js para executar este script" -ForegroundColor Yellow
    exit 1
}

# Verificar se o ts-node está instalado
try {
    $tsNodeVersion = npx ts-node --version 2>$null
    Write-Host "✅ ts-node disponível" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ts-node não encontrado, instalando..." -ForegroundColor Yellow
    npm install -g ts-node typescript @types/node
}

# Verificar se o arquivo .env existe
if (-not (Test-Path ".env")) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "💡 Certifique-se de estar no diretório raiz do projeto" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔧 Executando verificação de dados..." -ForegroundColor Cyan
Write-Host ""

# Executar o script de verificação
try {
    npx ts-node verificar-meus-dados.ts
} catch {
    Write-Host "❌ Erro ao executar o script de verificação" -ForegroundColor Red
    Write-Host "💡 Verifique se todas as dependências estão instaladas corretamente" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Verificação concluída!" -ForegroundColor Green