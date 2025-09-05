# Script simples para fazer push para o GitHub
# Instruções:
# 1. Crie um repositório vazio no GitHub
# 2. Execute este script

# Verifica se estamos no diretório correto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "=== Script de Push para GitHub ===" -ForegroundColor Green
Write-Host ""

# Verifica o status do git
Write-Host "Verificando status do repositório..." -ForegroundColor Cyan
git status

# Adiciona todas as alterações
Write-Host "Adicionando todas as alterações..." -ForegroundColor Cyan
git add .

# Verifica se há alterações para commit
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Fazendo commit..." -ForegroundColor Cyan
    git commit -m "Atualização do sistema de gestão"
} else {
    Write-Host "Nenhuma alteração para commit." -ForegroundColor Green
}

# Verifica se já existe um remote configurado
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "Remote já configurado: $remote" -ForegroundColor Green
    Write-Host "Fazendo push..." -ForegroundColor Cyan
    git push -u origin main
} else {
    Write-Host "Nenhum remote configurado." -ForegroundColor Yellow
    Write-Host "Instruções:" -ForegroundColor Cyan
    Write-Host "1. Crie um repositório vazio no GitHub" -ForegroundColor White
    Write-Host "2. Execute o comando: git remote add origin https://github.com/seu-usuario/seu-repositorio.git" -ForegroundColor White
    Write-Host "3. Depois execute: git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "Processo concluído!" -ForegroundColor Green