#!/bin/bash

# Script para configurar autenticação do GitHub para CI/CD

echo "=== Configuração de Autenticação do GitHub ==="
echo

# Verificar se o usuário já tem um token
if [ -f ".github-token" ]; then
    echo "Token do GitHub já configurado."
    echo "Se precisar atualizar, delete o arquivo .github-token e execute este script novamente."
    exit 0
fi

echo "Para configurar a autenticação do GitHub, você precisará de um Personal Access Token (PAT)."
echo
echo "Passos para criar um PAT:"
echo "1. Acesse https://github.com/settings/tokens"
echo "2. Clique em 'Generate new token'"
echo "3. Dê um nome descritivo ao token (ex: sistema-gestao-estoque-ci)"
echo "4. Selecione as seguintes permissões:"
echo "   - repo (para acesso completo aos repositórios)"
echo "   - workflow (para acesso às GitHub Actions)"
echo "5. Clique em 'Generate token'"
echo "6. Copie o token gerado (você não poderá vê-lo novamente)"
echo

read -p "Cole seu Personal Access Token aqui: " github_token

if [ -z "$github_token" ]; then
    echo "Token não fornecido. Abortando."
    exit 1
fi

# Salvar o token em um arquivo (não versionado)
echo "$github_token" > .github-token
echo ".github-token" >> .gitignore

echo
echo "✅ Token do GitHub configurado com sucesso!"
echo "O token foi salvo em .github-token (arquivo não versionado)."
echo
echo "Próximos passos:"
echo "1. Configure as secrets no repositório do GitHub:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - NETLIFY_AUTH_TOKEN"
echo "   - NETLIFY_SITE_ID"
echo
echo "2. O CI/CD pipeline será executado automaticamente em cada push."