# Guia de Segurança para o Sistema de Gestão de Estoque

## Visão Geral

Este documento descreve as práticas de segurança implementadas no sistema e fornece recomendações para melhorar a segurança em ambientes de produção.

## Identificação de Riscos

### 1. Exposição de Credenciais Sensíveis

**Problema**: A chave de serviço (`VITE_SUPABASE_SERVICE_ROLE_KEY`) está exposta no arquivo `.env`, que é acessível no lado do cliente.

**Impacto**: Qualquer pessoa com acesso ao código do cliente pode obter a chave de serviço, permitindo acesso irrestrito ao banco de dados.

**Solução Implementada**:
- O sistema utiliza uma abordagem híbrida onde a maioria das operações usa o cliente administrativo com a chave de serviço apenas nos scripts do lado do servidor.
- Para operações do lado do cliente, o sistema usa autenticação personalizada que verifica senhas diretamente no banco de dados.

**Recomendações para Produção**:
1. **Migre para um Backend Próprio**: Crie uma API backend própria que gerencie todas as operações sensíveis do banco de dados.
2. **Use Funções do Supabase**: Implemente funções do lado do servidor no Supabase para operações sensíveis.
3. **Implemente RLS Corretamente**: Configure políticas de segurança de nível de linha (RLS) adequadas para proteger os dados.

### 2. Armazenamento de Senhas

**Problema**: As senhas dos usuários são armazenadas como hashes no banco de dados, o que é uma boa prática, mas o sistema depende de acesso administrativo para verificar senhas.

**Solução Implementada**:
- Uso de bcrypt para hashing de senhas.
- Verificação de senhas diretamente no banco de dados usando o cliente administrativo.

**Recomendações para Produção**:
1. **Use Autenticação do Supabase**: Configure corretamente a autenticação do Supabase em vez de usar autenticação personalizada.
2. **Implemente OAuth**: Adicione suporte para login via provedores OAuth (Google, Facebook, etc.).

## Recomendações de Segurança

### Para Ambiente de Desenvolvimento

1. **Não use credenciais reais**: Use credenciais de teste em ambientes de desenvolvimento.
2. **Gitignore**: Certifique-se de que o arquivo `.env` está no `.gitignore`.
3. **Variáveis de ambiente**: Use variáveis de ambiente para todas as credenciais sensíveis.

### Para Ambiente de Produção

1. **Backend Próprio**:
   - Crie uma API backend usando Node.js, Python, etc.
   - Mova todas as operações sensíveis do banco de dados para o backend.
   - Use o cliente Supabase apenas no backend com a chave de serviço.

2. **Configuração do Supabase**:
   - Habilite RLS (Row Level Security) para todas as tabelas.
   - Configure políticas adequadas para cada tabela.
   - Use funções do lado do servidor para operações complexas.

3. **Autenticação**:
   - Use a autenticação nativa do Supabase.
   - Implemente refresh tokens corretamente.
   - Use JWT tokens para autenticação entre frontend e backend.

4. **Monitoramento**:
   - Habilite logs de auditoria no Supabase.
   - Monitore acessos não autorizados.
   - Implemente rate limiting para prevenir ataques de força bruta.

## Práticas de Segurança Implementadas

1. **Hashing de Senhas**: Todas as senhas são armazenadas como hashes bcrypt.
2. **Autenticação Personalizada**: Sistema de fallback para autenticação quando o Supabase Auth não está disponível.
3. **Tratamento de Erros**: Mensagens de erro genéricas para evitar vazamento de informações.
4. **Persistência Segura**: Uso de localStorage para persistência de sessão com dados limitados.

## Próximos Passos

1. **Implementar Backend Próprio**: Crie uma API backend para gerenciar todas as operações do banco de dados.
2. **Configurar RLS Adequado**: Implemente políticas de segurança de nível de linha corretas.
3. **Migrar para Autenticação do Supabase**: Use a autenticação nativa do Supabase em vez da personalizada.
4. **Adicionar Monitoramento**: Implemente logs de auditoria e monitoramento de segurança.

## Conclusão

O sistema atual implementa práticas de segurança básicas, mas para uso em produção, recomenda-se fortemente a implementação de um backend próprio e a configuração adequada do Supabase RLS e Auth.