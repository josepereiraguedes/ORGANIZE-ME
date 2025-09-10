# Script para verificar e configurar o cadastro por email no Supabase

Write-Host "=== Verificação de Configuração de Cadastro no Supabase ===" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Problema identificado:" -ForegroundColor Red
Write-Host "   O cadastro por email está desativado no painel do Supabase" -ForegroundColor Red
Write-Host ""

Write-Host "🔧 Solução necessária:" -ForegroundColor Yellow
Write-Host "   1. Acesse https://app.supabase.com" -ForegroundColor White
Write-Host "   2. Selecione seu projeto" -ForegroundColor White
Write-Host "   3. Vá para Authentication > Settings" -ForegroundColor White
Write-Host "   4. Encontre a seção 'Email Auth'" -ForegroundColor White
Write-Host "   5. Ative a opção 'Enable email signups'" -ForegroundColor White
Write-Host "   6. Salve as alterações" -ForegroundColor White
Write-Host ""

Write-Host "✅ Após ativar essa opção, o cadastro de novos usuários funcionará corretamente" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️  Lembre-se também de desativar a confirmação de email:" -ForegroundColor Yellow
Write-Host "   1. Na mesma página, encontre 'Email Confirmations'" -ForegroundColor White
Write-Host "   2. Desative a opção 'Enable email confirmations'" -ForegroundColor White
Write-Host "   3. Salve as alterações" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Após fazer essas alterações, tente criar uma conta novamente" -ForegroundColor Green