# Script para testar a autenticação do sistema

Write-Host "=== Teste de Autenticação do Sistema ===" -ForegroundColor Green
Write-Host ""

# Verificar se o servidor de desenvolvimento está rodando
Write-Host "Verificando se o servidor de desenvolvimento está ativo..." -ForegroundColor Cyan

# Tentar acessar localhost:5173 (porta padrão do Vite)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Servidor de desenvolvimento está rodando" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Servidor respondeu com status $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ℹ️  Servidor de desenvolvimento não está ativo ou não responde" -ForegroundColor Cyan
    Write-Host "Para iniciar o servidor, execute: npm run dev" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Teste Manual Necessário ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Inicie o servidor de desenvolvimento:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Acesse o sistema em http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "3. Tente criar uma nova conta:" -ForegroundColor White
Write-Host "   - Clique em 'Não tem uma conta? Criar conta'" -ForegroundColor White
Write-Host "   - Preencha um email válido e uma senha (mínimo 6 caracteres)" -ForegroundColor White
Write-Host "   - Clique em 'Criar conta'" -ForegroundColor White
Write-Host ""
Write-Host "4. Após criar a conta, faça login imediatamente:" -ForegroundColor White
Write-Host "   - Clique em 'Já tem uma conta? Entrar'" -ForegroundColor White
Write-Host "   - Use as mesmas credenciais que você acabou de criar" -ForegroundColor White
Write-Host "   - Clique em 'Entrar'" -ForegroundColor White
Write-Host ""
Write-Host "Se tudo estiver configurado corretamente, você deverá acessar o sistema" -ForegroundColor Green
Write-Host "sem a necessidade de confirmar o email." -ForegroundColor Green
Write-Host ""
Write-Host "Em caso de erros, verifique:" -ForegroundColor Yellow
Write-Host "1. As credenciais do Supabase no arquivo .env estão corretas" -ForegroundColor Yellow
Write-Host "2. A confirmação de email está desativada no painel do Supabase" -ForegroundColor Yellow
Write-Host "3. O script verificar-config-supabase.ps1 pode ajudar com a configuração" -ForegroundColor Yellow