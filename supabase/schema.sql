-- Script SQL para criar as tabelas necessárias no Supabase

-- Tabela de usuários simplificada para autenticação sem e-mail
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir usuários padrão
INSERT INTO public.app_users (id, name, email, password_hash) VALUES 
('c5539cba-f202-42cd-a31c-5b53eca09cb7', 'Usuário 1', 'pereiraguedes1988@gmail.com', '$2a$10$8K1p/a0dURXAm7QiTRqUzuN0/S5ecC5RiJd4sKwks5uIZoWV611Om') -- 31051988
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.app_users (id, name, email, password_hash) VALUES 
('c436d6b4-9311-47d1-9115-2a91909ade5c', 'Usuário 2', 'josepereiraguedes@yahoo.com.br', '$2a$10$8K1p/a0dURXAm7QiTRqUzuN0/S5ecC5RiJd4sKwks5uIZoWV611Om') -- 31052025
ON CONFLICT (email) DO NOTHING;

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
    user_id UUID REFERENCES public.app_users(id), -- Referência à tabela de usuários simplificada
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
    user_id UUID REFERENCES public.app_users(id), -- Referência à tabela de usuários simplificada
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
    user_id UUID REFERENCES public.app_users(id), -- Referência à tabela de usuários simplificada
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
CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users(email);

-- Habilitar RLS (Row Level Security) para tabelas de dados
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para usuários autenticados
CREATE POLICY "Users can read their own products" ON public.products 
FOR SELECT TO authenticated USING (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can insert their own products" ON public.products 
FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can update their own products" ON public.products 
FOR UPDATE TO authenticated USING (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can delete their own products" ON public.products 
FOR DELETE TO authenticated USING (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can read their own clients" ON public.clients 
FOR SELECT TO authenticated USING (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can insert their own clients" ON public.clients 
FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can update their own clients" ON public.clients 
FOR UPDATE TO authenticated USING (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can delete their own clients" ON public.clients 
FOR DELETE TO authenticated USING (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can read their own transactions" ON public.transactions 
FOR SELECT TO authenticated USING (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can insert their own transactions" ON public.transactions 
FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can update their own transactions" ON public.transactions 
FOR UPDATE TO authenticated USING (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can delete their own transactions" ON public.transactions 
FOR DELETE TO authenticated USING (user_id = (SELECT id FROM public.app_users WHERE email = current_user));

-- Políticas para a tabela de usuários
CREATE POLICY "Users can read their own user data" ON public.app_users 
FOR SELECT TO authenticated USING (id = (SELECT id FROM public.app_users WHERE email = current_user));

CREATE POLICY "Users can update their own user data" ON public.app_users 
FOR UPDATE TO authenticated USING (id = (SELECT id FROM public.app_users WHERE email = current_user));

-- Garantir acesso aos usuários autenticados
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.app_users TO authenticated;
GRANT USAGE ON SEQUENCE public.products_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.clients_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.transactions_id_seq TO authenticated;