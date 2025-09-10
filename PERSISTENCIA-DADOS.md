# Persistência de Dados no Sistema de Gestão

## Como Funciona

O sistema de gestão utiliza o Supabase como backend para armazenar todos os dados de forma persistente na nuvem. Cada usuário tem seus próprios dados isolados, garantindo segurança e privacidade.

## Isolamento de Dados por Usuário

1. **Cada usuário tem seus próprios dados**: Quando você se cadastra, todos os produtos, clientes e transações que você criar estarão associados ao seu usuário específico.

2. **Filtragem automática**: O sistema automaticamente filtra os dados para mostrar apenas os que pertencem ao usuário logado.

3. **Segurança**: Através do RLS (Row Level Security) do Supabase, é impossível acessar dados de outros usuários.

## Por Que os Dados "Somem" ao Sair e Entrar

### Cenário Normal (Mesma Usuário)
- Se você sair e entrar **com a mesma conta**, seus dados continuarão lá
- O sistema reconhece seu usuário e carrega automaticamente seus dados

### Cenário Problemático (Contas Diferentes)
- Se você sair e entrar **com uma conta diferente**, não verá os dados da conta anterior
- Isso é uma característica de segurança, não um bug

## Testando a Persistência de Dados

Para verificar se a persistência está funcionando corretamente, você pode executar o seguinte teste:

1. **Crie uma nova conta** no sistema
2. **Adicione alguns produtos, clientes e transações**
3. **Saia do sistema** (clique em "Sair")
4. **Entre novamente com as mesmas credenciais**
5. **Verifique se seus dados ainda estão lá**

Se os dados continuarem visíveis, a persistência está funcionando corretamente.

## Verificando Seus Dados

### No Painel do Supabase
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para "Table Editor"
4. Verifique as tabelas:
   - `products` - Seus produtos
   - `clients` - Seus clientes
   - `transactions` - Suas transações

### Através do Script de Diagnóstico
Execute o script para verificar seus dados:
```bash
npx ts-node diagnosticar-dados.ts
```

Este script mostrará:
- Quantos produtos, clientes e transações existem no banco
- Os primeiros registros de cada tipo
- A qual usuário (user_id) cada registro pertence

## Solução para o Problema

### 1. Certifique-se de Usar a Mesma Conta
- Anote seu email e senha
- Use sempre a mesma conta para acessar seus dados

### 2. Recuperação de Dados
Se você tem certeza de que criou dados anteriormente, mas não os vê:
1. Tente fazer login com as credenciais que usou anteriormente
2. Verifique se o email está correto (maiúsculas/minúsculas importam)
3. Use o script de diagnóstico para verificar se os dados existem

### 3. Compartilhamento de Dados (Avançado)
Se você precisa compartilhar dados entre contas:
1. Exporte os dados da conta original (relatórios PDF/CSV)
2. Importe os dados na nova conta
3. Ou crie um sistema de compartilhamento no futuro

## Dicas Importantes

1. **Sempre use a mesma conta**: Seus dados estão vinculados ao seu usuário
2. **Guarde suas credenciais**: Não há recuperação de senha automática
3. **Os dados estão seguros**: Mesmo que não os veja, eles continuam no banco de dados
4. **Cada conta é independente**: É como ter pastas separadas para cada usuário

## Problemas Comuns e Soluções

### "Criei dados mas não os vejo mais"
- **Solução**: Faça login com a mesma conta que usou para criar os dados

### "Perdi minha senha"
- **Solução**: Atualmente não há recuperação de senha automática
- Crie uma nova conta e importe seus dados

### "Quero ver todos os dados do sistema"
- **Solução**: Isso não é possível por razões de segurança
- Cada usuário só pode ver seus próprios dados

## Para Desenvolvedores

### Estrutura de Dados
- Todos os registros têm um campo `user_id` que os vincula ao usuário
- As políticas RLS garantem que apenas o dono veja seus dados
- O frontend filtra automaticamente os dados pelo usuário logado

### Debugando Problemas
1. Verifique se o `user_id` está sendo salvo corretamente
2. Confirme que as políticas RLS estão configuradas
3. Verifique se o contexto de autenticação está funcionando