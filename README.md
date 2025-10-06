<<<<<<< HEAD
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/67fb5fe8-5e69-47a5-a3eb-c460cbdd6db1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/67fb5fe8-5e69-47a5-a3eb-c460cbdd6db1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Create a .env file from the example.
cp .env.example .env

# Step 4: Install the necessary dependencies.
npm i

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Context API for state management
- CryptoJS for enhanced security

## Environment Variables

The project uses environment variables for configuration. Copy the `.env.example` file to `.env` and adjust the values as needed:

```bash
cp .env.example .env
```

Refer to `.env.example` for all available configuration options.

## Testing

The project includes unit and integration tests using Vitest and Testing Library:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

Tests are located in `src/**/*.test.ts` and `src/**/*.test.tsx` files.

## Improvements Made

This project has been enhanced with several improvements:

1. **Enhanced Security**: 
   - Implemented AES encryption using CryptoJS for sensitive data
   - Centralized security functions in a dedicated service

2. **State Management**:
   - Added Context API for global state management
   - Created a centralized AppContext for all data operations

3. **Code Structure**:
   - Refactored large components into smaller, more manageable pieces
   - Created a service layer for data operations
   - Removed duplicate files and code

4. **Type Safety**:
   - Enabled strict TypeScript settings
   - Improved type definitions throughout the application

5. **Performance**:
   - Optimized component rendering
   - Reduced unnecessary re-renders

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/67fb5fe8-5e69-47a5-a3eb-c460cbdd6db1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
=======
# Sistema de Gestão de Estoque e Financeiro

Sistema completo de gestão de estoque e financeiro para pequenos negócios, totalmente local e offline-first.

## Funcionalidades

- Gestão de produtos (cadastro, edição, exclusão)
- Controle de estoque com alertas de estoque baixo
- Gestão de clientes
- Registro de transações financeiras (vendas, compras)
- Relatórios em PDF e Excel
- Modo claro/escuro
- Funciona offline como PWA
- **Autenticação por e-mail e senha**
- **Compartilhamento de dados entre dispositivos via importação/exportação**
- **Categorias e subcategorias de produtos**
- **Alertas automáticos de estoque baixo**
- **Interface aprimorada com dropdowns para categorias**

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- ECharts (visualização de dados)
- jsPDF e xlsx (relatórios)

## Como executar localmente

1. Instale as dependências:
   ```bash
   yarn install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   yarn dev
   ```

3. Acesse `http://localhost:5173`

## Autenticação por E-mail e Senha

O sistema suporta autenticação tradicional por e-mail e senha com usuários pré-configurados:

### Usuários Padrão

1. **Usuário 1**:
   - E-mail: pereiraguedes1988@gmail.com
   - Senha: 31051988

2. **Usuário 2**:
   - E-mail: josepereiraguedes@yahoo.com.br
   - Senha: 31052025

## Persistência de Dados Local

O sistema armazena todos os dados localmente no dispositivo do usuário:

- **Armazenamento local**: Todos os dados são salvos no localStorage do navegador
- **Isolamento por usuário**: Cada usuário tem seus próprios dados isolados
- **Funcionamento offline**: O sistema funciona completamente offline após o primeiro acesso
- **Compartilhamento entre dispositivos**: É possível exportar e importar dados entre dispositivos

## Compartilhamento de Dados entre Dispositivos

O sistema permite compartilhar dados entre dispositivos diferentes:

1. **Exportar dados**: Acesse "Configurações" > "Compartilhamento de Dados" e clique em "Exportar Dados"
2. **Transferir arquivo**: Envie o arquivo JSON gerado para o outro dispositivo
3. **Importar dados**: No dispositivo de destino, acesse "Configurações" > "Compartilhamento de Dados" e clique em "Importar Dados"
4. **Sincronização**: Os dados serão atualizados automaticamente

## Categorias e Subcategorias de Produtos

O sistema agora suporta organização avançada de produtos com:

- **Categorias principais**: Organização de produtos em categorias amplas
- **Subcategorias**: Classificação mais específica dentro de cada categoria
- **Filtros aprimorados**: Dropdowns interativos para fácil navegação
- **Visualização hierárquica**: Exibição clara da estrutura categoria/subcategoria

## Alertas Automáticos de Estoque Baixo

O sistema monitora automaticamente o estoque e notifica quando:

- **Nível mínimo atingido**: Alertas visuais quando o estoque chega ao nível mínimo configurado
- **Notificações em tempo real**: Toast notifications para produtos com estoque baixo
- **Destaque visual**: Produtos com estoque baixo são destacados na interface
- **Resumo de alertas**: Painel dedicado para monitorar todos os produtos com estoque baixo

## Como construir para produção

```bash
yarn build
```

Os arquivos serão gerados no diretório `dist/`.

## Testes

O sistema inclui uma suite abrangente de testes para garantir a qualidade e funcionamento correto de todas as funcionalidades.

### Executar Todos os Testes

```bash
npm test
```

### Testes de Integração Abrangentes

```bash
npm run test:integration
```

### Cobertura de Testes

Os testes cobrem:
- Frontend (React components, rotas, funcionalidades)
- Funcionalidades específicas (relatórios, dashboard)
- Importação e exportação de dados

## Segurança

Como o sistema é totalmente local, todos os dados permanecem no dispositivo do usuário:

- **Privacidade**: Os dados nunca deixam o dispositivo do usuário
- **Segurança**: Não há transmissão de dados pela internet
- **Controle**: O usuário tem controle total sobre seus dados
>>>>>>> 50c92e3b291624092effd74a4a15ca2bee16abbe
