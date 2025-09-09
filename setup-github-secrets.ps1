# Script para configurar secrets no GitHub
# Este script fornece instruções para configurar as secrets necessárias

Write-Host "=== Configuração de Secrets do GitHub ===" -ForegroundColor Green
Write-Host ""

Write-Host "Para configurar as secrets necessárias no repositório do GitHub, siga estas instruções:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Acesse seu repositório no GitHub" -ForegroundColor White
Write-Host "2. Clique em 'Settings' (Configurações)" -ForegroundColor White
Write-Host "3. No menu lateral, clique em 'Secrets and variables' > 'Actions'" -ForegroundColor White
Write-Host "4. Clique em 'New repository secret' (Nova secret de repositório)" -ForegroundColor White
Write-Host ""

Write-Host "Adicione as seguintes secrets:" -ForegroundColor Yellow
Write-Host ""

Write-Host "Nome: VITE_SUPABASE_URL" -ForegroundColor White
Write-Host "Valor: Sua URL do projeto Supabase" -ForegroundColor White
Write-Host "   Como obter: Painel do Supabase > Project Settings > API > URL" -ForegroundColor Gray
Write-Host ""

Write-Host "Nome: VITE_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "Valor: Sua chave anônima do Supabase" -ForegroundColor White
Write-Host "   Como obter: Painel do Supabase > Project Settings > API > anon key" -ForegroundColor Gray
Write-Host ""

Write-Host "Nome: NETLIFY_AUTH_TOKEN" -ForegroundColor White
Write-Host "Valor: Seu token de autenticação do Netlify" -ForegroundColor White
Write-Host "   Como obter: Painel do Netlify > User Settings > Applications > Personal Access Tokens" -ForegroundColor Gray
Write-Host ""

Write-Host "Nome: NETLIFY_SITE_ID" -ForegroundColor White
Write-Host "Valor: ID do seu site no Netlify" -ForegroundColor White
Write-Host "   Como obter: Painel do Netlify > Seu site > Site settings > General > Site details > API ID" -ForegroundColor Gray
Write-Host ""

Write-Host "Após configurar todas as secrets, o CI/CD pipeline funcionará automaticamente!" -ForegroundColor Green
Write-Host ""
Write-Host "O workflow está definido em .github/workflows/deploy.yml" -ForegroundColor Cyan