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
- **Autenticação por e-mail e senha**

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Supabase (backend e autenticação)
- ECharts (visualização de dados)
- jsPDF e xlsx (relatórios)

## Como executar localmente

1. Instale as dependências:
   ```bash
   yarn install
   ```

2. Configure as variáveis de ambiente:
   - Copie o arquivo [.env.example](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env.example) para [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env)
   - Preencha as credenciais do Supabase conforme o guia abaixo

3. Configure o banco de dados:
   - Acesse o painel do Supabase em https://app.supabase.io/
   - Crie um novo projeto
   - Execute o script SQL do arquivo [scripts/supabase-setup.sql](file://c:\Users\perei\OneDrive\Área%20de%20Trabalho\gestão%20dri\scripts\supabase-setup.sql) para criar as tabelas necessárias

4. Inicie o servidor de desenvolvimento:
   ```bash
   yarn dev
   ```

5. Acesse `http://localhost:5173`

## Configuração do Banco de Dados (Supabase)

1. Crie uma conta no [Supabase](https://supabase.com/)
2. Crie um novo projeto
3. No painel do projeto, vá para "Table Editor"
4. Execute o script SQL do arquivo [scripts/supabase-setup.sql](file://c:\Users\perei\OneDrive\Área%20de%20Trabalho\gestão%20dri\scripts\supabase-setup.sql) para criar as tabelas necessárias
5. Obtenha a URL do projeto e a chave anônima em "Project Settings" > "API"
6. Atualize o arquivo [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env) com essas informações:
   ```
   VITE_SUPABASE_URL="sua_url_do_supabase"
   VITE_SUPABASE_ANON_KEY="sua_chave_anonima"
   ```

## Autenticação por E-mail e Senha

O sistema agora suporta autenticação tradicional por e-mail e senha:

1. **Cadastro simplificado**: Os usuários podem se registrar usando e-mail e senha
2. **Acesso imediato**: Após o cadastro, o usuário pode acessar o sistema imediatamente
3. **Segurança**: Cada usuário tem acesso apenas aos seus próprios dados
4. **Privacidade**: Os dados são isolados por usuário através de políticas RLS (Row Level Security)

### Usuários Padrão

O sistema já vem com dois usuários pré-configurados:

1. **Usuário 1**:
   - E-mail: pereiraguedes1988@gmail.com
   - Senha: 31051988

2. **Usuário 2**:
   - E-mail: josepereiraguedes@yahoo.com.br
   - Senha: 31052025

## Persistência de Dados

O sistema utiliza o Supabase para armazenar todos os dados de forma persistente na nuvem. Cada usuário tem seus próprios dados isolados:

- **Isolamento por usuário**: Cada conta tem seus próprios produtos, clientes e transações
- **Segurança**: RLS (Row Level Security) garante que usuários só vejam seus próprios dados
- **Persistência**: Os dados permanecem no banco mesmo após sair do sistema

## Como construir para produção

```bash
yarn build
```

Os arquivos serão gerados no diretório `dist/`.

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

## Guia de Configuração Detalhado

Para instruções detalhadas sobre como configurar o Supabase, consulte o [SUPABASE_SETUP_GUIDE.md](file://c:\Users\perei\OneDrive\Área%20de%20Trabalho\gestão%20dri\SUPABASE_SETUP_GUIDE.md)