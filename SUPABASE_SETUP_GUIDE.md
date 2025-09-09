# Guia de Configuração do Supabase para Autenticação

Este guia explica como configurar corretamente o Supabase para autenticação de usuários no sistema de gestão de estoque.

## 1. Criar um Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha as informações do projeto:
   - Nome do projeto
   - Senha do banco de dados (guarde esta senha)
   - Região
5. Clique em "Create Project"

## 2. Obter Credenciais do Supabase

1. Após o projeto ser criado, vá para "Project Settings" > "API"
2. Copie as seguintes informações:
   - Project URL (será usado como VITE_SUPABASE_URL)
   - anon key (será usado como VITE_SUPABASE_ANON_KEY)

## 3. Configurar o Arquivo .env

Atualize o arquivo [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env) na raiz do projeto com as credenciais obtidas:

```env
VITE_SUPABASE_URL="sua_url_do_supabase_aqui"
VITE_SUPABASE_ANON_KEY="sua_chave_anonima_do_supabase_aqui"
```

Exemplo:
```env
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 4. Configurar Tabelas do Banco de Dados

1. No painel do Supabase, vá para "Table Editor"
2. Execute o script SQL do arquivo [supabase-schema.sql](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/supabase-schema.sql)
3. Isso criará as tabelas necessárias com as políticas RLS

## 5. Configurar Autenticação

1. No painel do Supabase, vá para "Authentication" > "Providers"
2. Habilite o provedor "Email" para permitir cadastro/login com email e senha
3. Configure as opções conforme necessário

## 6. Configurar Emails de Confirmação (Opcional)

1. Vá para "Authentication" > "URL Configuration"
2. Configure a "Site URL" para a URL do seu site (ex: https://seudominio.com)
3. Isso é importante para os links de confirmação de email

## 7. Testar a Configuração

1. Reinicie o servidor de desenvolvimento:
   ```bash
   yarn dev
   ```
2. Tente se registrar com um novo email
3. Verifique se você recebe um email de confirmação
4. Após confirmar o email, tente fazer login

## Erros Comuns e Soluções

### 429 (Too Many Requests)
- **Causa**: Muitas requisições em um curto período de tempo
- **Solução**: Aguarde alguns minutos antes de tentar novamente

### 400 (Bad Request)
- **Causa**: Dados inválidos na requisição (email inválido, senha muito curta, etc.)
- **Solução**: Verifique se os dados estão corretos e atendem aos requisitos

### 401 (Unauthorized)
- **Causa**: Credenciais inválidas ou usuário não confirmado
- **Solução**: Verifique email/senha ou confirme o email de cadastro

### Network Errors
- **Causa**: Problemas de conexão com o Supabase
- **Solução**: Verifique sua conexão com a internet e as credenciais do Supabase

## Verificação de Configuração

Para verificar se tudo está configurado corretamente:

1. Confirme que as variáveis de ambiente estão definidas no [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env)
2. Verifique que o script [supabase-schema.sql](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/supabase-schema.sql) foi executado
3. Confirme que o provedor de autenticação "Email" está habilitado no Supabase
4. Teste o cadastro e login na aplicação

## Dicas Adicionais

1. **Ambiente de Desenvolvimento**: Use credenciais diferentes para desenvolvimento e produção
2. **Segurança**: Nunca commite o arquivo [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env) para o repositório
3. **Monitoramento**: Use o painel do Supabase para monitorar usuários e atividades
4. **Backup**: Faça backup regular do banco de dados

Se você seguir todos esses passos, o sistema de autenticação deve funcionar corretamente.