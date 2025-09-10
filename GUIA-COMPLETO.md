# Guia Completo: Configuração e Teste do Sistema de Autenticação

## Visão Geral

Este guia fornece instruções passo a passo para configurar e testar o sistema de autenticação simplificado que não requer confirmação de email.

## Passo 1: Verificar Configuração do Supabase

### 1.1 Verificar Credenciais
Certifique-se de que o arquivo `.env` contém as credenciais corretas:

```
VITE_SUPABASE_URL="https://bsiayjdyqzptqoldrzbt.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzaWF5amR5cXpwdHFvbGRyemJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDQ3OTMsImV4cCI6MjA3MzAyMDc5M30.NtXnYByvWGes3-3aZ-BZ1FtHl8d88iFMeFxJ3Vveexw"
```

### 1.2 Desativar Confirmação de Email no Painel do Supabase
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá para **Authentication > Settings**
4. Encontre a seção **Email Confirmations**
5. **Desative** a opção "Enable email confirmations"
6. Clique em **Save**

## Passo 2: Testar o Sistema

### 2.1 Iniciar o Servidor de Desenvolvimento
Abra um terminal na pasta do projeto e execute:

```bash
npm run dev
```

O servidor estará disponível em http://localhost:5211 (ou outra porta se 5211 estiver em uso)

### 2.2 Testar Autenticação pelo Sistema
1. Acesse http://localhost:5211
2. Clique em "Não tem uma conta? Criar conta"
3. Preencha um email válido e uma senha (mínimo 6 caracteres)
4. Clique em "Criar conta"
5. Após criar a conta, clique em "Já tem uma conta? Entrar"
6. Use as mesmas credenciais e clique em "Entrar"

### 2.3 Teste Alternativo com HTML
Você também pode usar o arquivo `teste-autenticacao.html` para testar a autenticação:

1. Abra o arquivo `teste-autenticacao.html` diretamente no navegador
2. Preencha email e senha
3. Clique em "Criar Conta" ou "Fazer Login"

## Passo 3: Scripts Úteis

### 3.1 Verificar Configuração do Supabase
```powershell
.\verificar-config-supabase.ps1
```

### 3.2 Testar Autenticação
```powershell
.\testar-autenticacao.ps1
```

### 3.3 Verificar Supabase (avançado)
```powershell
.\verificar-supabase.ps1
```

## Passo 4: Publicar Alterações

### 4.1 Publicar no GitHub
```powershell
.\push-github.ps1
```

### 4.2 Configurar Autenticação do GitHub (se necessário)
```powershell
.\setup-github-auth.ps1
```

## Solução de Problemas

### Erro 429 (Too Many Requests)
- **Causa**: Muitas tentativas em curto período
- **Solução**: Aguarde alguns segundos entre as tentativas

### Erro 400 (Bad Request)
- **Causa**: Credenciais inválidas ou problema de configuração
- **Solução**: 
  1. Verifique as credenciais no arquivo `.env`
  2. Confirme que a confirmação de email está desativada no Supabase

### Problemas de Conexão
- **Causa**: Servidor não iniciado ou porta em uso
- **Solução**: 
  1. Certifique-se de que `npm run dev` está em execução
  2. Verifique a porta exibida no terminal (ex: 5211)

## Estrutura do Código

### Arquivos Modificados
1. **src/services/supabase.ts** - Serviço de autenticação simplificado
2. **src/contexts/AuthContext.tsx** - Contexto de autenticação
3. **src/components/Auth/LoginForm.tsx** - Interface de login/cadastro
4. **.env** - Credenciais do Supabase

### Scripts Criados
1. **verificar-config-supabase.ps1** - Verifica credenciais
2. **testar-autenticacao.ps1** - Instruções para teste
3. **verificar-supabase.ps1** - Verificação avançada
4. **teste-autenticacao.html** - Teste alternativo via HTML

## Considerações Finais

Com estas configurações, o sistema de autenticação agora permite:
- Cadastro imediato sem confirmação de email
- Login direto após cadastro
- Experiência de usuário simplificada
- Menos pontos de falha no processo de autenticação

Se encontrar problemas persistentes:
1. Verifique novamente a configuração do Supabase
2. Reinicie o servidor de desenvolvimento
3. Limpe o cache do navegador
4. Consulte os logs do terminal para mensagens de erro detalhadas