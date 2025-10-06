# Guia de Uso do Organize-Me com Integração Supabase

## Como Testar a Integração com Supabase

### 1. Acessar a Aplicação

1. Certifique-se de que o servidor de desenvolvimento está rodando:
   ```bash
   npm run dev
   ```

2. Acesse a aplicação através do navegador no endereço indicado (geralmente http://localhost:8082)

### 2. Navegar até as Configurações

1. Clique no ícone de configurações no menu lateral
2. Você verá a página de configurações com várias seções

### 3. Verificar a Conexão com Supabase

Na seção "Conexão com Supabase", você verá um indicador que mostra:
- ✅ Conectado com sucesso! (se a conexão estiver funcionando)
- ❌ Erro: mensagem de erro (se houver problemas)

### 4. Testar Funcionalidades

#### Teste de Conexão Simples
Na seção "Supabase", use os botões:
- "Sincronizar Dados" - Envia os dados locais para o Supabase
- "Carregar Dados" - Carrega dados do Supabase para o armazenamento local

#### Teste Completo
Na seção expandida "Teste Completo do Supabase", você pode:
- "Criar Dados de Teste" - Adiciona dados de exemplo ao armazenamento local
- "Sincronizar com Supabase" - Envia todos os dados locais para o Supabase
- "Carregar do Supabase" - Carrega dados do Supabase
- "Testar CRUD" - Testa todas as operações de criação, leitura, atualização e deleção

### 5. Verificar Sincronização Automática

1. Adicione, edite ou exclua qualquer item (login, tarefa, rotina, nota ou favorito)
2. Verifique no console do navegador (F12) se há mensagens de sincronização
3. A sincronização automática ocorre sempre que há mudanças nos dados

### 6. Testar em Múltiplos Dispositivos

1. Em outro dispositivo ou navegador, acesse a mesma URL
2. Verifique se os dados criados em um dispositivo aparecem no outro
3. Faça alterações em ambos os dispositivos e observe a sincronização

## Solução de Problemas

### Problemas Comuns

#### 1. "Conexão falhou" no teste de conexão
- Verifique se as variáveis de ambiente estão corretamente configuradas no arquivo `.env`
- Confirme que a URL e chave do Supabase estão corretas
- Verifique se as tabelas foram criadas no Supabase executando o script `supabase/init.sql`

#### 2. Dados não estão sincronizando
- Verifique o console do navegador (F12) para ver mensagens de erro
- Confirme que há conectividade com a internet
- Verifique se as políticas de segurança (RLS) estão configuradas corretamente no Supabase

#### 3. Erros de permissão
- No painel do Supabase, vá para Authentication > Policies
- Certifique-se de que as políticas permitem operações para usuários autenticados

### Verificação no Console

Abra o console do navegador (F12) e verifique:
- Mensagens de log indicando sincronização bem-sucedida
- Erros relacionados à conexão ou operações do Supabase
- Confirmação de que dados estão sendo enviados e recebidos

### Verificação no Supabase

No painel do Supabase:
1. Vá para Table Editor
2. Verifique se as tabelas (logins, tasks, routines, notes, favorites) existem
3. Verifique se há dados nas tabelas após sincronizar
4. Confirme que os esquemas das tabelas correspondem aos definidos no script de inicialização

## Funcionalidades Avançadas

### Configurações de Sincronização

Na página de configurações, você pode:
- Habilitar/desabilitar sincronização automática
- Configurar intervalo de backup automático
- Definir chave secreta para criptografia

### Monitoramento de Dados

A seção de estatísticas mostra:
- Número total de logins, tarefas, rotinas, notas e favoritos
- Permite verificar se os dados estão sendo sincronizados corretamente

## Dicas Úteis

1. **Primeira Sincronização**: Na primeira vez que usar a integração, todos os dados locais serão enviados para o Supabase

2. **Conflitos de Dados**: Se usar o aplicativo em múltiplos dispositivos, pode ocorrer conflitos. A sincronização manual pode ajudar a resolver

3. **Segurança**: Dados sensíveis como senhas são criptografados antes de serem enviados ao Supabase

4. **Backup**: A sincronização com o Supabase serve como backup automático dos seus dados

5. **Desempenho**: Em caso de muitos dados, a sincronização pode levar alguns segundos

## Suporte Adicional

Se encontrar problemas não resolvidos com este guia:
1. Verifique os logs no console do navegador
2. Confirme que todas as etapas de configuração foram seguidas
3. Consulte o arquivo SUPABASE_INTEGRATION_SUMMARY.md para detalhes técnicos
4. Verifique o arquivo SUPABASE_DATABASE_SETUP.md para instruções de configuração do banco de dados