-- Script de inicialização do banco de dados para Organize-Me

-- Criar tabela de logins
CREATE TABLE IF NOT EXISTS logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password TEXT NOT NULL,
  url TEXT,
  category VARCHAR(100) DEFAULT 'general',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(15) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  due_date TIMESTAMP WITH TIME ZONE,
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de rotinas
CREATE TABLE IF NOT EXISTS routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(10) DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  time VARCHAR(5) DEFAULT '09:00',
  days TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de notas
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category VARCHAR(100) DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de favoritos
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url TEXT,
  category VARCHAR(100) DEFAULT 'general',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) para todas as tabelas
ALTER TABLE logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir operações para usuários autenticados
-- Para simplificar, vamos permitir todas as operações para usuários autenticados
-- Em produção, você deve configurar políticas mais restritivas

CREATE POLICY "Enable all for authenticated users" ON logins
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON routines
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON notes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON favorites
  FOR ALL USING (true) WITH CHECK (true);

-- Conceder permissões para as tabelas
GRANT ALL ON logins TO anon, authenticated;
GRANT ALL ON tasks TO anon, authenticated;
GRANT ALL ON routines TO anon, authenticated;
GRANT ALL ON notes TO anon, authenticated;
GRANT ALL ON favorites TO anon, authenticated;

-- Criar função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar o campo updated_at automaticamente
CREATE TRIGGER update_logins_updated_at 
  BEFORE UPDATE ON logins 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at 
  BEFORE UPDATE ON routines 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at 
  BEFORE UPDATE ON notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_favorites_updated_at 
  BEFORE UPDATE ON favorites 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();