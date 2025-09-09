# Script PowerShell para executar todos os testes do sistema
# Sistema de Gestão de Estoque

Write-Host "🚀 Iniciando todos os testes do Sistema de Gestão de Estoque" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js antes de continuar." -ForegroundColor Red
    exit 1
}

# Verificar se o projeto tem dependências instaladas
if (Test-Path "node_modules") {
    Write-Host "✅ Dependências do projeto já instaladas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Instalando dependências do projeto..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependências instaladas com sucesso" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🧪 Executando testes unitários e funcionais..." -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Cyan
npm test
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Testes unitários e funcionais concluídos com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro nos testes unitários e funcionais" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔗 Executando testes de integração abrangentes..." -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor Cyan
npx tsx tests/comprehensive-integration-test.ts
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Testes de integração concluídos com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro nos testes de integração" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Verificando configuração do banco de dados..." -ForegroundColor Cyan
Write-Host "----------------------------------------------" -ForegroundColor Cyan
npx tsx verify-database.ts
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Verificação do banco de dados concluída com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro na verificação do banco de dados" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Todos os testes foram executados com sucesso!" -ForegroundColor Green
Write-Host "📊 Resumo dos testes:" -ForegroundColor Green
Write-Host "   • Testes unitários e funcionais: ✅ Passaram" -ForegroundColor Green
Write-Host "   • Testes de integração abrangentes: ✅ Passaram" -ForegroundColor Green
Write-Host "   • Verificação do banco de dados: ✅ Passaram" -ForegroundColor Green
Write-Host ""
Write-Host "✅ O sistema está pronto para deploy em produção!" -ForegroundColor Green