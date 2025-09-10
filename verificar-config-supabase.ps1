# Script para verificar e configurar o Supabase para não exigir confirmação de email

Write-Host "=== Verificação de Configuração do Supabase ===" -ForegroundColor Green
Write-Host ""

# Verificar se o arquivo .env existe
if (Test-Path ".env") {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
    $envContent = Get-Content ".env"
    
    # Extrair URL e ANON_KEY do .env
    $supabaseUrl = $envContent | Select-String "VITE_SUPABASE_URL" | ForEach-Object { ($_ -split "=")[1].Trim('"') }
    $supabaseAnonKey = $envContent | Select-String "VITE_SUPABASE_ANON_KEY" | ForEach-Object { ($_ -split "=")[1].Trim('"') }
    
    if ($supabaseUrl -and $supabaseAnonKey) {
        Write-Host "✅ Credenciais do Supabase encontradas no .env" -ForegroundColor Green
        Write-Host "URL: $supabaseUrl" -ForegroundColor Cyan
        Write-Host "ANON KEY: $supabaseAnonKey" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Credenciais do Supabase incompletas no .env" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Arquivo .env não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Instruções para Configurar o Supabase ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Acesse o painel do Supabase: https://app.supabase.com" -ForegroundColor White
Write-Host "2. Selecione seu projeto" -ForegroundColor White
Write-Host "3. Vá para Authentication > Settings" -ForegroundColor White
Write-Host "4. Encontre a seção 'Email Confirmations'" -ForegroundColor White
Write-Host "5. Desative a opção 'Enable email confirmations'" -ForegroundColor White
Write-Host "6. Salve as alterações" -ForegroundColor White
Write-Host ""
Write-Host "Isso permitirá que os usuários façam login imediatamente após o cadastro," -ForegroundColor Yellow
Write-Host "sem a necessidade de confirmar o email." -ForegroundColor Yellow
Write-Host ""
Write-Host "Após fazer essa alteração, tente criar uma nova conta no sistema." -ForegroundColor Green