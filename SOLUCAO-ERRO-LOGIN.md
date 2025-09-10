# Solução de Erro de Login

Este guia ajudará você a resolver o erro "Invalid login credentials" que está ocorrendo ao tentar fazer login no sistema.

## 1. Verificação das Variáveis de Ambiente

Primeiro, verifique se as variáveis de ambiente estão corretamente configuradas no arquivo [.env](file:///c:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env):

```
VITE_SUPABASE_URL="https://bsiayjdyqzptqoldrzbt.supabase.co"
VITE_SUPABASE_ANON_KEY="sua_chave_aqui"
```

Certifique-se de que:
- Ambas as variáveis estão presentes
- Os valores estão entre aspas
- Não há espaços extras antes ou depois do `=`

## 2. Verificação no Painel de Configurações

Agora, as informações de ambiente podem ser visualizadas na página de **Configurações** do sistema:

1. Faça login no sistema (ou crie uma conta se ainda não tiver)
2. Acesse o menu e clique em "Configurações"
3. Role até a seção "Informações de Ambiente"
4. Verifique se:
   - [VITE_SUPABASE_URL](file:///c:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env#L3-L3) está preenchido corretamente
   - [VITE_SUPABASE_ANON_KEY](file:///c:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env#L4-L4) está preenchido (apenas os primeiros 10 caracteres serão mostrados por segurança)
   - [NODE_ENV](file:///c:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/node_modules/@types/node/process.d.ts#L26-L26) pode estar vazio, mas isso não afeta o funcionamento

## 3. Diagnóstico com Script PowerShell

Use o script PowerShell para diagnosticar problemas específicos com credenciais:

```powershell
.\diagnosticar-login.ps1 -Email "seu@email.com" -Senha "sua_senha"
```

Este script irá:
- Verificar se o arquivo [.env](file:///c:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env) existe e está configurado corretamente
- Testar a conexão com o Supabase
- Tentar fazer login com as credenciais fornecidas

## 4. Causas Comuns e Soluções

### Credenciais Incorretas
- Verifique se o email e senha estão corretos
- Certifique-se de que não há espaços extras
- Confirme se a conta foi criada corretamente

### Conta Não Confirmada
- Se você acabou de criar a conta, verifique seu email para o link de confirmação
- Contas não confirmadas podem não conseguir fazer login

### Problemas com o Supabase
- Verifique se o projeto Supabase está ativo
- Confirme se as credenciais do Supabase estão corretas no painel do Supabase

## 5. Solução de Problemas Avançada

Se os passos acima não resolverem o problema:

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Limpe o cache do navegador:
   - Pressione Ctrl+Shift+Delete
   - Selecione "Todos os tempos" e marque "Imagens e arquivos em cache"
   - Clique em "Limpar dados"

3. Verifique o console do navegador (F12) para erros adicionais

4. Tente criar uma nova conta para verificar se o problema é específico da conta

## 6. Suporte Adicional

Se você continuar enfrentando problemas, entre em contato com o suporte técnico com as seguintes informações:
- Captura de tela do erro
- Informações do componente de debug
- Resultado do script de diagnóstico