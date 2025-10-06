# Guia de Integração com Supabase

Este guia explica como configurar e usar a integração com o Supabase no projeto OrganizerPro.

## Configuração Inicial

### 1. Variáveis de Ambiente

As credenciais do Supabase já estão configuradas no arquivo `.env.example`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://mmovczfmizfjokffjjzu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tb3ZjemZtaXpmam9rZmZqanp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzU3NzUsImV4cCI6MjA3NTM1MTc3NX0.qUJ671XmvIvVkWrd77F_KzFXm8ap0Zue7l4W9k8R-4M
```

Para usar em desenvolvimento, crie um arquivo `.env` na raiz do projeto com essas variáveis:

```bash
cp .env.example .env
```

### 2. Estrutura do Banco de Dados

O projeto espera as seguintes tabelas no Supabase:

#### Tabela: logins
```sql
CREATE TABLE logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  username TEXT,
  password TEXT,
  url TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: tasks
```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('todo', 'in-progress', 'done')),
  due_date TIMESTAMP,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: routines
```sql
CREATE TABLE routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  time TEXT,
  days TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: notes
```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: favorites
```sql
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Serviços Disponíveis

### Serviços de Dados

O projeto inclui serviços específicos para cada tipo de dado:

1. `supabaseLoginService` - Gerencia logins
2. `supabaseTaskService` - Gerencia tarefas
3. `supabaseRoutineService` - Gerencia rotinas
4. `supabaseNoteService` - Gerencia notas
5. `supabaseFavoriteService` - Gerencia favoritos

### Exemplo de Uso

```typescript
import { supabaseLoginService } from '@/services/supabase/supabaseService'

// Criar um novo login
const newLogin = await supabaseLoginService.create({
  id: '1',
  title: 'Meu Login',
  username: 'usuario',
  password: 'senha',
  url: 'https://exemplo.com',
  category: 'trabalho',
  notes: 'Notas importantes',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

// Obter todos os logins
const logins = await supabaseLoginService.getAll()

// Atualizar um login
const updatedLogin = await supabaseLoginService.update('1', {
  password: 'nova-senha'
})

// Deletar um login
await supabaseLoginService.delete('1')
```

## Sincronização de Dados

### Sincronização Automática

O projeto sincroniza automaticamente os dados locais com o Supabase quando o aplicativo é iniciado. Isso é feito através do hook `useSupabaseSync`.

### Sincronização Manual

Você pode sincronizar os dados manualmente através da página de Configurações ou usando o contexto:

```typescript
import { useAppContext } from '@/contexts/AppContext'

const MyComponent = () => {
  const { syncWithSupabase } = useAppContext()
  
  const handleSync = async () => {
    await syncWithSupabase()
  }
  
  return (
    <button onClick={handleSync}>
      Sincronizar com Supabase
    </button>
  )
}
```

## Configuração no Supabase

### 1. Criar um Projeto

1. Acesse [https://app.supabase.io/](https://app.supabase.io/)
2. Crie um novo projeto
3. Anote a URL do projeto e a chave anônima

### 2. Criar as Tabelas

Use o SQL Editor no Supabase para criar as tabelas conforme mostrado na seção "Estrutura do Banco de Dados".

### 3. Configurar Políticas de Segurança

Para permitir acesso anônimo (apenas para testes), configure as políticas de segurança:

```sql
-- Para a tabela logins
CREATE POLICY "Enable read access for all users" ON "public"."logins"
AS PERMISSIVE FOR SELECT
TO anon
USING (true)

CREATE POLICY "Enable insert access for all users" ON "public"."logins"
AS PERMISSIVE FOR INSERT
TO anon
WITH CHECK (true)

-- Repita para as outras tabelas: tasks, routines, notes, favorites
```

**Nota de Segurança**: Em produção, você deve configurar autenticação adequada e políticas mais restritivas.

## Testando a Conexão

### 1. Interface de Teste

O projeto inclui uma interface de teste na página de Configurações onde você pode:

- Sincronizar dados manualmente
- Carregar dados do Supabase
- Verificar o status da conexão

### 2. Teste Programático

```typescript
import { supabase } from '@/services/supabase/client'

// Testar conexão
const { data, error } = await supabase
  .from('logins')
  .select('count()', { count: 'exact' })
  
if (error) {
  console.error('Erro de conexão:', error)
} else {
  console.log('Conexão bem-sucedida!')
}
```

## Considerações de Segurança

1. **Chaves de API**: Nunca exponha chaves de API em código do lado do cliente em produção
2. **Autenticação**: Implemente autenticação de usuários para proteger os dados
3. **Políticas de Segurança**: Configure políticas de segurança apropriadas no Supabase
4. **Criptografia**: Os dados sensíveis devem ser criptografados antes de serem enviados

## Troubleshooting

### Problemas Comuns

1. **"Missing VITE_SUPABASE_URL environment variable"**
   - Verifique se o arquivo `.env` existe e contém as variáveis corretas

2. **"Missing VITE_SUPABASE_ANON_KEY environment variable"**
   - Verifique se a chave anônima está configurada corretamente

3. **Erros de CORS**
   - Verifique se o URL do Supabase está correto
   - Confirme as políticas de segurança no Supabase

4. **Permissões de Acesso**
   - Verifique as políticas de segurança das tabelas no Supabase

### Logs e Debug

Os erros de sincronização são registrados no console do navegador. Para mais detalhes, verifique:

```typescript
// No arquivo supabaseService.ts
console.warn('Failed to sync login:', login.id, error)
```

## Próximos Passos

1. Implementar autenticação de usuários
2. Adicionar criptografia de dados no lado do servidor
3. Configurar políticas de segurança mais restritivas
4. Implementar sincronização em tempo real
5. Adicionar backup automático dos dados do Supabase