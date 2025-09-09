-- Script SQL para criar as tabelas necessárias no Supabase

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    cost DECIMAL(10, 2) DEFAULT 0,
    sale_price DECIMAL(10, 2) DEFAULT 0,
    quantity INTEGER DEFAULT 0,
    supplier VARCHAR(255),
    min_stock INTEGER DEFAULT 0,
    image TEXT,
    user_id UUID REFERENCES auth.users(id), -- Adicionar referência ao usuário
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    user_id UUID REFERENCES auth.users(id), -- Adicionar referência ao usuário
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sale', 'purchase', 'adjustment')),
    product_id INTEGER REFERENCES public.products(id),
    client_id INTEGER REFERENCES public.clients(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending')),
    description TEXT,
    user_id UUID REFERENCES auth.users(id), -- Adicionar referência ao usuário
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON public.transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- Habilitar RLS (Row Level Security) para todas as tabelas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para usuários autenticados
CREATE POLICY "Users can read their own products" ON public.products 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" ON public.products 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON public.products 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON public.products 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own clients" ON public.clients 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON public.clients 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON public.clients 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON public.clients 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own transactions" ON public.transactions 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.transactions 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON public.transactions 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON public.transactions 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Garantir acesso aos usuários autenticados
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.transactions TO authenticated;
GRANT USAGE ON SEQUENCE public.products_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.clients_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.transactions_id_seq TO authenticated;