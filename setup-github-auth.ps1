# Script para configurar autenticação do GitHub para CI/CD

Write-Host "=== Configuração de Autenticação do GitHub ===" -ForegroundColor Green
Write-Host ""

# Verificar se o usuário já tem um token
if (Test-Path ".github-token") {
    Write-Host "Token do GitHub já configurado." -ForegroundColor Yellow
    Write-Host "Se precisar atualizar, delete o arquivo .github-token e execute este script novamente." -ForegroundColor Yellow
    exit 0
}

Write-Host "Para configurar a autenticação do GitHub, você precisará de um Personal Access Token (PAT)." -ForegroundColor Cyan
Write-Host ""
Write-Host "Passos para criar um PAT:" -ForegroundColor Cyan
Write-Host "1. Acesse https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "2. Clique em 'Generate new token'" -ForegroundColor Cyan
Write-Host "3. Dê um nome descritivo ao token (ex: sistema-gestao-estoque-ci)" -ForegroundColor Cyan
Write-Host "4. Selecione as seguintes permissões:" -ForegroundColor Cyan
Write-Host "   - repo (para acesso completo aos repositórios)" -ForegroundColor Cyan
Write-Host "   - workflow (para acesso às GitHub Actions)" -ForegroundColor Cyan
Write-Host "5. Clique em 'Generate token'" -ForegroundColor Cyan
Write-Host "6. Copie o token gerado (você não poderá vê-lo novamente)" -ForegroundColor Cyan
Write-Host ""

$githubToken = Read-Host "Cole seu Personal Access Token aqui"

if ([string]::IsNullOrEmpty($githubToken)) {
    Write-Host "Token não fornecido. Abortando." -ForegroundColor Red
    exit 1
}

# Salvar o token em um arquivo (não versionado)
$githubToken | Out-File -FilePath ".github-token" -Encoding UTF8
Add-Content -Path ".gitignore" -Value ".github-token"

Write-Host ""
Write-Host "✅ Token do GitHub configurado com sucesso!" -ForegroundColor Green
Write-Host "O token foi salvo em .github-token (arquivo não versionado)." -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Green
Write-Host "1. Configure as secrets no repositório do GitHub:" -ForegroundColor Green
Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor Green
Write-Host "   - VITE_SUPABASE_ANON_KEY" -ForegroundColor Green
Write-Host "   - NETLIFY_AUTH_TOKEN" -ForegroundColor Green
Write-Host "   - NETLIFY_SITE_ID" -ForegroundColor Green
Write-Host ""
Write-Host "2. O CI/CD pipeline será executado automaticamente em cada push." -ForegroundColor Green