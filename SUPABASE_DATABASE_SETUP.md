# Configuração do Banco de Dados Supabase para Organize-Me

Este guia descreve como configurar as tabelas necessárias no Supabase para o aplicativo Organize-Me.

## Estrutura do Banco de Dados

### Tabela: logins
```sql
CREATE TABLE logins (
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
```

### Tabela: tasks
```sql
CREATE TABLE tasks (
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
```

### Tabela: routines
```sql
CREATE TABLE routines (
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
```

### Tabela: notes
```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category VARCHAR(100) DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela: favorites
```sql
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url TEXT,
  category VARCHAR(100) DEFAULT 'general',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuração de Políticas de Segurança (RLS)

Para cada tabela, configure as políticas de segurança da seguinte forma:

```sql
-- Habilitar RLS para todas as tabelas
ALTER TABLE logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir operações para usuários autenticados
CREATE POLICY "Users can access their own data" ON logins
  FOR ALL USING (auth.uid() = 'authenticated');

CREATE POLICY "Users can access their own data" ON tasks
  FOR ALL USING (auth.uid() = 'authenticated');

CREATE POLICY "Users can access their own data" ON routines
  FOR ALL USING (auth.uid() = 'authenticated');

CREATE POLICY "Users can access their own data" ON notes
  FOR ALL USING (auth.uid() = 'authenticated');

CREATE POLICY "Users can access their own data" ON favorites
  FOR ALL USING (auth.uid() = 'authenticated');
```

## Configuração do Projeto Supabase

1. Acesse https://app.supabase.io/
2. Crie um novo projeto ou selecione um existente
3. Vá para o Editor SQL (SQL Editor)
4. Execute os comandos SQL acima para criar as tabelas
5. Configure as políticas de segurança conforme necessário
6. Obtenha a URL do projeto e a chave anônima em Settings > API
7. Adicione essas informações ao seu arquivo .env:

```
VITE_SUPABASE_URL=sua_url_do_projeto
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## Testando a Conexão

Após configurar as tabelas, você pode testar a conexão:

1. Inicie o aplicativo localmente com `npm run dev`
2. Navegue até a página de Configurações
3. Use o componente de teste do Supabase para verificar a conexão
4. Tente sincronizar alguns dados de teste

## Solução de Problemas

Se encontrar problemas com a conexão:

1. Verifique se as variáveis de ambiente estão corretamente configuradas
2. Confirme se as tabelas foram criadas com os nomes e estruturas corretas
3. Verifique as políticas de segurança (RLS) estão configuradas corretamente
4. Certifique-se de que a chave da API tem as permissões adequadas