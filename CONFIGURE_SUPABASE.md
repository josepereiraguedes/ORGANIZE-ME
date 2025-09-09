# Configuração do Supabase - Passo a Passo

## Passo 1: Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project" ou "Sign up"
3. Crie uma conta usando GitHub, Google ou email

## Passo 2: Criar um Novo Projeto

1. Após fazer login, clique em "New Project"
2. Preencha as informações:
   - **Name**: Escolha um nome para seu projeto (ex: "sistema-gestao-estoque")
   - **Database Password**: Crie uma senha segura (guarde ela!)
   - **Region**: Escolha a região mais próxima de você
3. Clique em "Create Project" (pode levar alguns minutos)

## Passo 3: Obter Credenciais do Projeto

1. Após o projeto ser criado, você será redirecionado para o painel
2. No menu lateral, clique em "Project Settings" (ícone de engrenagem)
3. Clique em "API"
4. Copie as seguintes informações:
   - **Project URL**: Será usado como `VITE_SUPABASE_URL`
   - **Project API keys** > **anon key**: Será usado como `VITE_SUPABASE_ANON_KEY`

## Passo 4: Configurar o Arquivo .env

1. Na raiz do projeto, abra o arquivo [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env)
2. Substitua os valores de exemplo pelas credenciais reais:

```env
# Antes (valores de exemplo):
VITE_SUPABASE_URL="sua_url_do_supabase_aqui"
VITE_SUPABASE_ANON_KEY="sua_chave_anonima_do_supabase_aqui"

# Depois (valores reais do seu projeto):
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Passo 5: Configurar Tabelas do Banco de Dados

1. No painel do Supabase, clique em "Table Editor" no menu lateral
2. Clique em "SQL Editor"
3. Cole o conteúdo do arquivo [supabase-schema.sql](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/supabase-schema.sql) na área de texto
4. Clique em "Run" para executar o script

## Passo 6: Configurar Autenticação

1. No menu lateral, clique em "Authentication"
2. Clique em "Providers"
3. Encontre "Email" e clique no botão de alternância para habilitá-lo
4. Você pode deixar as configurações padrão por enquanto

## Passo 7: Testar a Configuração

1. Reinicie o servidor de desenvolvimento:
   ```bash
   # Se estiver rodando, pressione Ctrl+C para parar
   yarn dev
   ```
2. Acesse [http://localhost:5173](http://localhost:5173)
3. Tente se registrar com um novo email
4. Verifique seu email para o link de confirmação
5. Após confirmar, tente fazer login

## Problemas Comuns e Soluções

### Erro: "429 (Too Many Requests)"
- **Causa**: Muitas tentativas de cadastro/login em um curto período
- **Solução**: Aguarde alguns minutos antes de tentar novamente

### Erro: "400 (Bad Request)"
- **Causa**: Dados inválidos (email inválido, senha muito curta)
- **Solução**: Verifique se o email é válido e a senha tem pelo menos 6 caracteres

### Erro: "Invalid API key"
- **Causa**: Chave `VITE_SUPABASE_ANON_KEY` incorreta
- **Solução**: Verifique se copiou a chave "anon key" correta do painel do Supabase

### Erro: "Could not connect to Supabase"
- **Causa**: URL do Supabase incorreta ou problemas de conexão
- **Solução**: Verifique se a `VITE_SUPABASE_URL` está correta e sua conexão com a internet

## Verificação Rápida

Execute o comando para verificar sua configuração:
```bash
npm run test:supabase
```

Se tudo estiver configurado corretamente, você verá:
```
🔍 Verificando configuração do Supabase...
✅ Variáveis de ambiente configuradas
   URL: https://seu-projeto.supabase.co...
🔌 Testando conexão com Supabase...
✅ Conexão com Supabase estabelecida com sucesso
🎉 Configuração do Supabase verificada com sucesso!
```

## Dúvidas Frequentes

### Preciso pagar para usar o Supabase?
O plano gratuito do Supabase é suficiente para desenvolvimento e pequenas aplicações. Você só precisa pagar quando ultrapassar os limites do plano gratuito.

### Posso usar o mesmo projeto para desenvolvimento e produção?
É recomendável usar projetos separados para desenvolvimento e produção para evitar conflitos de dados.

### Como reseto minha senha do banco de dados do Supabase?
Você pode redefinir a senha do banco de dados nas configurações do projeto no painel do Supabase.

Se você seguir todos esses passos, o sistema de autenticação deve funcionar corretamente!