# Script PowerShell para diagnosticar problemas de login
# Uso: .\diagnosticar-login.ps1 -Email "seu@email.com" -Senha "sua_senha"

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$Senha
)

Write-Host "=== DIAGNÓSTICO DE LOGIN ===" -ForegroundColor Green
Write-Host "Email: $Email" -ForegroundColor Yellow

# Verificar se o arquivo .env existe
$envPath = ".\.env"
if (Test-Path $envPath) {
    Write-Host "Arquivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "ERRO: Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

# Ler variáveis do arquivo .env
$envContent = Get-Content $envPath
$supabaseUrl = $envContent | Where-Object { $_ -match "VITE_SUPABASE_URL" } | ForEach-Object { ($_ -split "=")[1].Trim('"') }
$supabaseKey = $envContent | Where-Object { $_ -match "VITE_SUPABASE_ANON_KEY" } | ForEach-Object { ($_ -split "=")[1].Trim('"') }

Write-Host "URL do Supabase: $supabaseUrl" -ForegroundColor Cyan
Write-Host "Chave Anônima: $($supabaseKey.Substring(0, 10))..." -ForegroundColor Cyan

# Verificar se as variáveis estão definidas
if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "ERRO: Supabase URL e/ou Anon Key não estão definidos corretamente no arquivo .env" -ForegroundColor Red
    exit 1
}

# Criar arquivo temporário para testar as credenciais
$tempFile = [System.IO.Path]::GetTempFileName() + ".js"
$tempContent = @"
const {{ createClient }} = require('@supabase/supabase-js');

const supabase = createClient('$supabaseUrl', '$supabaseKey');

async function testLogin() {{
    console.log('Testando login...');
    try {{
        const result = await supabase.auth.signInWithPassword({{
            email: '$Email',
            password: '$Senha'
        }});
        
        if (result.error) {{
            console.error('ERRO NO LOGIN:', result.error.message);
            process.exit(1);
        }}
        
        console.log('LOGIN BEM SUCEDIDO!');
        console.log('Usuário ID:', result.data.user?.id);
        
        // Fazer logout
        await supabase.auth.signOut();
        console.log('Logout realizado');
    }} catch (error) {{
        console.error('ERRO INESPERADO:', error.message);
        process.exit(1);
    }}
}}

testLogin();
"@

$tempContent | Out-File -FilePath $tempFile -Encoding UTF8

try {
    # Executar o teste
    Write-Host "`nExecutando diagnóstico..." -ForegroundColor Yellow
    node $tempFile
    Write-Host "`nDiagnóstico concluído!" -ForegroundColor Green
} catch {
    Write-Host "ERRO AO EXECUTAR DIAGNÓSTICO: $_" -ForegroundColor Red
} finally {
    # Remover arquivo temporário
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}