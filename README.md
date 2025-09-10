# Sistema de Gestão de Estoque e Financeiro

Sistema completo de gestão de estoque e financeiro para pequenos negócios.

## Funcionalidades

- Gestão de produtos (cadastro, edição, exclusão)
- Controle de estoque com alertas de estoque baixo
- Gestão de clientes
- Registro de transações financeiras (vendas, compras)
- Relatórios em PDF e Excel
- Modo claro/escuro
- Funciona offline como PWA
- **Autenticação de usuários** (novidade!)

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Supabase (backend)
- Dexie.js (IndexedDB para armazenamento local)
- ECharts (visualização de dados)
- jsPDF e xlsx (relatórios)

## Como executar localmente

1. Instale as dependências:
   ```bash
   yarn install
   ```

2. Configure as variáveis de ambiente:
   - Copie o arquivo [.env.example](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env.example) para [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env)
   - Preencha as credenciais do Supabase conforme o [SUPABASE_SETUP_GUIDE.md](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/SUPABASE_SETUP_GUIDE.md)

3. Configure o banco de dados:
   - Siga as instruções em [MANUAL_DATABASE_SETUP.md](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/MANUAL_DATABASE_SETUP.md)
   - Ou execute o script SQL no painel do Supabase

4. Inicie o servidor de desenvolvimento:
   ```bash
   yarn dev
   ```

5. Acesse `http://localhost:5173`

## Testes

O sistema inclui uma suite abrangente de testes para garantir a qualidade e funcionamento correto de todas as funcionalidades.

### Executar Todos os Testes
```bash
# No Windows PowerShell
.\run-all-tests.ps1
```

### Testes Específicos

1. **Testes Unitários e Funcionais**:
   ```bash
   npm test
   ```

2. **Testes de Integração Abrangentes**:
   ```bash
   npm run test:integration
   ```

3. **Verificação do Banco de Dados**:
   ```bash
   npm run test:database
   ```

4. **Verificação da Configuração do Supabase**:
   ```bash
   npm run test:supabase
   ```

### Relatórios de Teste

- `TESTING_SUMMARY.md` - Resumo dos testes realizados
- `SYSTEM_TEST_REPORT.md` - Relatório detalhado dos testes de sistema
- `FINAL_TEST_REPORT.md` - Relatório final completo de todos os testes

### Cobertura de Testes

Os testes cobrem:
- Frontend (React components, rotas, funcionalidades)
- Backend (Supabase integration)
- Banco de dados (CRUD operations)
- Funcionalidades específicas (relatórios, dashboard)
- Infraestrutura (Netlify deployment)

## Verificação de Integrações

O sistema foi verificado quanto às integrações críticas para garantir o funcionamento correto de todos os componentes.

### Relatórios de Verificação

- `DATABASE_CONFIGURATION_REPORT.md` - Relatório detalhado da configuração do banco de dados
- `INTEGRATION_VERIFICATION_REPORT.md` - Relatório completo de verificação de todas as integrações
- `VERIFICATION_FILES_SUMMARY.md` - Resumo dos arquivos de verificação criados

### Status das Integrações

- ✅ **Banco de Dados Supabase**: Totalmente configurado e conectado
- ✅ **Frontend-Backend**: Conectividade plena com operações CRUD funcionais
- ⚠️ **GitHub**: Funcional para repositórios públicos, requer autenticação para recursos avançados

## Como construir para produção

```bash
yarn build
```

Os arquivos serão gerados no diretório `dist/`.

## Configuração do Banco de Dados (Supabase)

1. Crie uma conta no [Supabase](https://supabase.com/)
2. Crie um novo projeto
3. No painel do projeto, vá para "Table Editor"
4. Execute o script SQL do arquivo [supabase-schema.sql](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/supabase-schema.sql) para criar as tabelas necessárias
5. Obtenha a URL do projeto e a chave anônima em "Project Settings" > "API"
6. Atualize o arquivo [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env) com essas informações:
   ```
   VITE_SUPABASE_URL="sua_url_do_supabase"
   VITE_SUPABASE_ANON_KEY="sua_chave_anonima"
   ```

## Autenticação de Usuários

O sistema agora suporta autenticação de usuários através do Supabase Auth:

1. Configure o provedor de autenticação no painel do Supabase (Email, Google, etc.)
2. Os usuários podem se registrar e fazer login
3. Cada usuário tem acesso apenas aos seus próprios dados
4. A segurança é garantida através de políticas RLS (Row Level Security)

### Configuração Detalhada

Consulte o guia completo em [SUPABASE_SETUP_GUIDE.md](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/SUPABASE_SETUP_GUIDE.md) para instruções passo a passo.

### Configuração Específica para Autenticação Sem Confirmação de Email

Para que o sistema de autenticação simplificado funcione corretamente (sem confirmação de email), é necessário configurar corretamente o Supabase:

1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá para **Authentication > Settings**
4. **Ative** a opção **"Enable email signups"**
5. **Desative** a opção **"Enable email confirmations"**
6. Salve as alterações

Consulte o guia completo em [CONFIG-SUPABASE-COMPLETA.md](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/CONFIG-SUPABASE-COMPLETA.md) para mais detalhes.

## Persistência de Dados

O sistema utiliza o Supabase para armazenar todos os dados de forma persistente na nuvem. Cada usuário tem seus próprios dados isolados:

- **Isolamento por usuário**: Cada conta tem seus próprios produtos, clientes e transações
- **Segurança**: RLS (Row Level Security) garante que usuários só vejam seus próprios dados
- **Persistência**: Os dados permanecem no banco mesmo após sair do sistema

⚠️ **Importante**: Se você sair e entrar com uma conta diferente, não verá os dados da conta anterior. Isso é uma característica de segurança.

Consulte [PERSISTENCIA-DADOS.md](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/PERSISTENCIA-DADOS.md) para mais detalhes sobre como funciona a persistência de dados.

Se estiver enfrentando problemas com dados que "somem", consulte [SOLUCAO-PROBLEMAS-PERSISTENCIA.md](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/SOLUCAO-PROBLEMAS-PERSISTENCIA.md) para um guia passo a passo de solução de problemas.

## Segurança em Produção

Para implantação em ambiente de produção, siga as recomendações no guia de segurança:

- `PRODUCTION_SECURITY_GUIDE.md` - Guia completo de segurança para produção

### Recomendações Principais:

1. **Habilitar a Segurança de Nível de Linha (RLS)** no Supabase
2. **Configurar autenticação adequada** para o GitHub
3. **Implementar pipeline de CI/CD** para deploys automatizados

## CI/CD com GitHub Actions

O projeto inclui uma configuração de CI/CD usando GitHub Actions para deploy automático no Netlify.

### Configuração:

1. O workflow está definido em [.github/workflows/deploy.yml](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.github/workflows/deploy.yml)
2. Configure as secrets necessárias no repositório do GitHub:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `NETLIFY_AUTH_TOKEN`
   - `NETLIFY_SITE_ID`

### Funcionamento:

- Executa testes automaticamente em cada push
- Faz deploy no Netlify apenas quando há push na branch `main`
- Garante que apenas código testado seja implantado em produção

## Solução de Problemas

### Erro "Falha ao sincronizar produto com a nuvem"

Este erro geralmente ocorre devido a inconsistências entre os nomes dos campos no código e no banco de dados. Verifique:

1. Se as tabelas foram criadas corretamente no Supabase
2. Se as credenciais no arquivo [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env) estão corretas
3. Se o script [supabase-schema.sql](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/supabase-schema.sql) foi executado completamente

### Problemas com imagens

Se estiver tendo problemas com ícones, verifique se os arquivos [icon-192.png](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/public/icon-192.png) e [icon-512.png](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/public/icon-512.png) existem no diretório [public/](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/public/).

### Problemas de Autenticação

Se estiver tendo problemas com login/cadastro:

1. Verifique se as credenciais do Supabase estão corretas no [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env)
2. Confirme se o provedor de autenticação "Email" está habilitado no Supabase:
   - Acesse https://app.supabase.com
   - Selecione seu projeto
   - Vá para **Authentication > Settings**
   - **Ative** a opção **"Enable email signups"**
   - **Desative** a opção **"Enable email confirmations"**
3. Verifique se o script [supabase-schema.sql](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/supabase-schema.sql) foi executado
4. Consulte o [SUPABASE_SETUP_GUIDE.md](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/SUPABASE_SETUP_GUIDE.md) para mais detalhes
5. Consulte o [CONFIG-SUPABASE-COMPLETA.md](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/CONFIG-SUPABASE-COMPLETA.md) para instruções completas de configuração

### Problemas com o Banco de Dados

Se estiver tendo problemas com o banco de dados:

1. Execute `npm run test:supabase` para verificar a configuração
2. Siga as instruções em [MANUAL_DATABASE_SETUP.md](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/MANUAL_DATABASE_SETUP.md) para configurar as tabelas
3. Certifique-se de que o script SQL foi executado no painel do Supabase

### Problemas de Login

Se estiver tendo problemas com login/cadastro:

1. Consulte [SOLUCAO-ERRO-LOGIN.md](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/SOLUCAO-ERRO-LOGIN.md) para um guia completo de solução de problemas
2. Verifique se as credenciais do Supabase estão corretas no [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env)
3. Confirme se o provedor de autenticação "Email" está habilitado no Supabase:
   - Acesse https://app.supabase.com
   - Selecione seu projeto
   - Vá para **Authentication > Settings**
   - **Ative** a opção **"Enable email signups"**
   - **Desative** a opção **"Enable email confirmations"**

### Dados Não Persistem ao Sair e Entrar

Se os dados "somem" quando você sai e entra novamente:

1. **Verifique se está usando a mesma conta**: Cada usuário tem seus próprios dados
2. **Confirme suas credenciais**: Use o mesmo email e senha
3. **Consulte [PERSISTENCIA-DADOS.md](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/PERSISTENCIA-DADOS.md) para mais detalhes**

## Implantação no Netlify

### Método 1: Deploy Automático (Recomendado)

1. **Preparação do código**:
   ```bash
   # Execute o script de preparação para deploy
   powershell -ExecutionPolicy Bypass -File .\deploy-netlify.ps1
   ```

2. **Faça login no Netlify** (https://netlify.com)

3. **Crie um novo site** a partir do repositório Git

4. **Configure as opções de build**:
   - Build command: `yarn build`
   - Publish directory: `dist`

5. **Adicione as variáveis de ambiente** no painel do Netlify:
   - `VITE_SUPABASE_URL` (sua URL do Supabase)
   - `VITE_SUPABASE_ANON_KEY` (sua chave anônima do Supabase)

6. **O site será automaticamente implantado** após cada push para o repositório

### Método 2: Deploy Manual

1. **Gere os arquivos de produção**:
   ```bash
   yarn build
   ```

2. **Faça login no Netlify**

3. **Arraste a pasta `dist`** para a área de deploy do Netlify

4. **Configure as variáveis de ambiente** no painel do Netlify