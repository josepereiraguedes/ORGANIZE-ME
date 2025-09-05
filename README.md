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

2. Inicie o servidor de desenvolvimento:
   ```bash
   yarn dev
   ```

3. Acesse `http://localhost:5173`

## Como construir para produção

```bash
yarn build
```

Os arquivos serão gerados no diretório `dist/`.

## Implantação no Netlify

1. Faça login no Netlify
2. Crie um novo site a partir do repositório Git
3. Configure as seguintes opções:
   - Build command: `yarn build`
   - Publish directory: `dist`
4. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL` (sua URL do Supabase)
   - `VITE_SUPABASE_ANON_KEY` (sua chave anônima do Supabase)

O site será automaticamente implantado após o push para o repositório.

## Implantação no GitHub

Para implantar o código no GitHub, siga estas etapas:

1. Substitua "seu-usuario" e "nome-do-repositorio" no arquivo [deploy-github.ps1](file://c:\Users\perei\OneDrive\Área%20de%20Trabalho\Atelie\deploy-github.ps1) pelos seus valores reais
2. Crie um token de acesso pessoal no GitHub em https://github.com/settings/tokens
3. Execute o script no PowerShell:
   ```powershell
   .\deploy-github.ps1
   ```
4. Quando solicitado, insira seu token de acesso pessoal

Após a execução bem-sucedida, seu código estará disponível no repositório do GitHub.