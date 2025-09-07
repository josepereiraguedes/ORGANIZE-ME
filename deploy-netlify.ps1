# Script de Deploy para Netlify
# Este script ajuda a configurar e fazer deploy no Netlify

# Verifica se estamos no diretório correto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "=== Script de Deploy para Netlify ===" -ForegroundColor Green
Write-Host ""

# Verifica se o build foi feito
if (-not (Test-Path "dist")) {
    Write-Host "Realizando build da aplicação..." -ForegroundColor Cyan
    yarn build
    
    if (-not (Test-Path "dist")) {
        Write-Host "Erro: Build não foi concluído com sucesso." -ForegroundColor Red
        Write-Host "Verifique se há erros no build e tente novamente." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Build verificado com sucesso!" -ForegroundColor Green
Write-Host ""

# Instruções para deploy no Netlify
Write-Host "Para fazer deploy no Netlify, siga estes passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Faça login no Netlify (https://netlify.com)" -ForegroundColor White
Write-Host "2. Crie um novo site a partir do Git" -ForegroundColor White
Write-Host "3. Conecte seu repositório do GitHub" -ForegroundColor White
Write-Host "4. Configure as opções de build:" -ForegroundColor White
Write-Host "   - Build command: yarn build" -ForegroundColor White
Write-Host "   - Publish directory: dist" -ForegroundColor White
Write-Host "5. Adicione as variáveis de ambiente no Netlify:" -ForegroundColor White
Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor White
Write-Host "   - VITE_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "6. Faça o deploy!" -ForegroundColor White
Write-Host ""
Write-Host "Nota: Certifique-se de que as variáveis de ambiente estão configuradas" -ForegroundColor Yellow
Write-Host "no Netlify para que a aplicação funcione corretamente." -ForegroundColor Yellow
Write-Host ""
Write-Host "Se preferir deploy manual, você pode arrastar a pasta 'dist'" -ForegroundColor Cyan
Write-Host "para a área de deploy do Netlify." -ForegroundColor Cyan
Write-Host ""
Write-Host "Processo concluído!" -ForegroundColor Green