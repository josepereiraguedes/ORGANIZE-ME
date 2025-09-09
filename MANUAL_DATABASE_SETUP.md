# Configuração Manual do Banco de Dados Supabase

Este guia explica como configurar manualmente o banco de dados do Supabase para o sistema de gestão de estoque.

## Passo 1: Acessar o Painel do Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login com sua conta
3. Selecione o projeto correto (aquele com a URL que você configurou no [.env](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.env))

## Passo 2: Abrir o Editor SQL

1. No menu lateral, clique em "Table Editor"
2. Clique na aba "SQL Editor"

## Passo 3: Executar o Script SQL

1. Copie todo o conteúdo do arquivo [supabase-schema.sql](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/supabase-schema.sql)
2. Cole no editor SQL
3. Clique no botão "Run" (ou pressione Ctrl+Enter)

## Passo 4: Verificar as Tabelas Criadas

Após executar o script, você deve ver as seguintes tabelas no "Table Editor":

1. **products** - Tabela de produtos
2. **clients** - Tabela de clientes
3. **transactions** - Tabela de transações

## Passo 5: Configurar Autenticação

1. No menu lateral, clique em "Authentication"
2. Clique em "Providers"
3. Habilite o provedor "Email" clicando no botão de alternância
4. Mantenha as configurações padrão

## Passo 6: Verificar as Configurações de Segurança

1. Volte para "Table Editor"
2. Clique em cada tabela e verifique:
   - Na aba "RLS Policies", deve haver políticas configuradas
   - Na aba "Columns", deve haver uma coluna `user_id` em cada tabela

## Passo 7: Testar a Configuração

1. Reinicie o servidor de desenvolvimento:
   ```bash
   # Se estiver rodando, pressione Ctrl+C para parar
   yarn dev
   ```
2. Acesse [http://localhost:5173](http://localhost:5173)
3. Tente se registrar com um novo email
4. Verifique seu email para o link de confirmação
5. Após confirmar, tente fazer login

## Estrutura das Tabelas

### Tabela `products`
```sql
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    cost DECIMAL(10, 2) DEFAULT 0,
    sale_price DECIMAL(10, 2) DEFAULT 0,
    quantity INTEGER DEFAULT 0,
    supplier VARCHAR(255),
    min_stock INTEGER DEFAULT 0,
    image TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela `clients`
```sql
CREATE TABLE public.clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela `transactions`
```sql
CREATE TABLE public.transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sale', 'purchase', 'adjustment')),
    product_id INTEGER REFERENCES public.products(id),
    client_id INTEGER REFERENCES public.clients(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending')),
    description TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Políticas de Segurança (RLS)

As seguintes políticas são configuradas para cada tabela:

### Para `products`:
- Usuários autenticados podem ler seus próprios produtos
- Usuários autenticados podem inserir seus próprios produtos
- Usuários autenticados podem atualizar seus próprios produtos
- Usuários autenticados podem deletar seus próprios produtos

### Para `clients`:
- Usuários autenticados podem ler seus próprios clientes
- Usuários autenticados podem inserir seus próprios clientes
- Usuários autenticados podem atualizar seus próprios clientes
- Usuários autenticados podem deletar seus próprios clientes

### Para `transactions`:
- Usuários autenticados podem ler suas próprias transações
- Usuários autenticados podem inserir suas próprias transações
- Usuários autenticados podem atualizar suas próprias transações
- Usuários autenticados podem deletar suas próprias transações

## Índices

Os seguintes índices são criados para melhorar a performance:

1. `idx_products_name` - Índice na coluna `name` da tabela `products`
2. `idx_products_category` - Índice na coluna `category` da tabela `products`
3. `idx_transactions_type` - Índice na coluna `type` da tabela `transactions`
4. `idx_transactions_created_at` - Índice na coluna `created_at` da tabela `transactions`
5. `idx_transactions_product_id` - Índice na coluna `product_id` da tabela `transactions`
6. `idx_transactions_client_id` - Índice na coluna `client_id` da tabela `transactions`
7. `idx_products_user_id` - Índice na coluna `user_id` da tabela `products`
8. `idx_clients_user_id` - Índice na coluna `user_id` da tabela `clients`
9. `idx_transactions_user_id` - Índice na coluna `user_id` da tabela `transactions`

## Verificação Final

Após configurar tudo, execute o comando de verificação:
```bash
npm run test:supabase
```

Se tudo estiver configurado corretamente, você verá:
```
🔍 Verificando configuração do Supabase...
✅ Variáveis de ambiente configuradas
   URL: https://bsiayjdyqzptqoldrzbt.supabase.co...
🔌 Testando conexão com Supabase...
⚠️  Tabelas não encontradas. Isso pode ser esperado se o schema ainda não foi criado.
✅ Conexão com Supabase estabelecida com sucesso

🎉 Configuração do Supabase verificada com sucesso!

💡 Próximos passos:
   1. Execute o script SQL em supabase-schema.sql no painel do Supabase
   2. Habilite o provedor de autenticação "Email" no painel do Supabase
```

Se você seguir todos esses passos, o banco de dados estará configurado corretamente e o sistema funcionará como esperado.