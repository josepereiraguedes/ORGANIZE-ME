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