# Checklist de Configuração para Produção

Este documento fornece um guia passo a passo para configurar todas as variáveis e secrets necessárias para implantação em produção.

## 1. Configuração do Supabase

### Variáveis Necessárias:
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do projeto Supabase

### Como obter:
1. Acesse https://app.supabase.com/
2. Selecione seu projeto
3. Vá para "Project Settings" > "API"
4. Copie a URL do projeto e a chave anônima

## 2. Configuração do Netlify

### Variáveis Necessárias:
- `NETLIFY_AUTH_TOKEN`: Token de autenticação do Netlify
- `NETLIFY_SITE_ID`: ID do site no Netlify

### Como obter o NETLIFY_AUTH_TOKEN:
1. Acesse https://app.netlify.com/user/applications
2. Vá para "Access tokens"
3. Clique em "New access token"
4. Dê um nome ao token e gere-o
5. Copie o token gerado

### Como obter o NETLIFY_SITE_ID:
1. Acesse https://app.netlify.com/
2. Selecione seu site
3. O ID do site está na URL: `https://app.netlify.com/sites/{SITE_ID}`

## 3. Configuração das Secrets no GitHub

### Passos:
1. Acesse https://github.com/serginhoguedes/Atelie/settings/secrets/actions
2. Clique em "New repository secret"
3. Adicione cada uma das variáveis abaixo:

| Nome da Secret | Valor |
|----------------|-------|
| `VITE_SUPABASE_URL` | Sua URL do Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sua chave anônima do Supabase |
| `NETLIFY_AUTH_TOKEN` | Seu token do Netlify |
| `NETLIFY_SITE_ID` | Seu ID do site no Netlify |

## 4. Verificação do Arquivo de Workflow

O workflow do CI/CD está configurado em `.github/workflows/deploy.yml` e utiliza essas secrets para:

1. Executar testes automatizados
2. Construir o projeto
3. Fazer deploy no Netlify

## 5. Teste de Configuração

Após configurar todas as secrets, você pode testar a configuração fazendo um push para o repositório:

```bash
git add .
git commit -m "Teste de configuração de secrets"
git push origin main
```

O GitHub Actions irá automaticamente:
1. Executar os testes
2. Construir o projeto
3. Fazer deploy no Netlify

## 6. Verificação do Deploy

Após o workflow ser concluído com sucesso:
1. Verifique o status em https://github.com/serginhoguedes/Atelie/actions
2. Acesse seu site no Netlify para confirmar que o deploy foi realizado