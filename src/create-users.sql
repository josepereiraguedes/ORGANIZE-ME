-- Criar tabela de usuários da aplicação
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir usuários solicitados
INSERT INTO app_users (name, email, password_hash) 
VALUES 
  ('Usuário Principal', 'pereiraguedes1988@gmail.com', '31051988'),
  ('Usuário Secundário', 'josepereiraguedes@yahoo.com.br', '31052025')
ON CONFLICT (email) DO NOTHING;

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id),
  name TEXT NOT NULL,
  category TEXT,
  cost DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  supplier TEXT,
  min_stock INTEGER DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id),
  type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'adjustment')),
  product_id UUID REFERENCES products(id),
  client_id UUID REFERENCES clients(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'pending')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar políticas de segurança (Row Level Security)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Criar políticas para usuários
CREATE POLICY "Users can view their own data" ON app_users
  FOR SELECT USING (id = auth.uid());

-- Criar políticas para produtos
CREATE POLICY "Users can view their own products" ON products
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (user_id = auth.uid());
  
CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (user_id = auth.uid());

-- Criar políticas para clientes
CREATE POLICY "Users can view their own clients" ON clients
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY "Users can insert their own clients" ON clients
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY "Users can update their own clients" ON clients
  FOR UPDATE USING (user_id = auth.uid());
  
CREATE POLICY "Users can delete their own clients" ON clients
  FOR DELETE USING (user_id = auth.uid());

-- Criar políticas para transações
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (user_id = auth.uid());
  
CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (user_id = auth.uid());