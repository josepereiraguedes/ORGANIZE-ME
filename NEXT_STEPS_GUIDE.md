# Próximos Passos Recomendados - Guia Completo

Este documento fornece instruções detalhadas para concluir os próximos passos recomendados para o sistema de gestão de estoque.

## 1. Configuração do GitHub PAT (Personal Access Token)

### Passo 1: Executar o Script de Configuração
O script [setup-github-auth.ps1](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/setup-github-auth.ps1) já foi executado e está aguardando a entrada do token.

### Passo 2: Criar um Personal Access Token no GitHub
1. Acesse https://github.com/settings/tokens
2. Clique em "Generate new token" (ou "Fine-grained tokens" para tokens mais granulares)
3. Dê um nome descritivo ao token (ex: sistema-gestao-estoque-ci)
4. Selecione as seguintes permissões:
   - repo (para acesso completo aos repositórios)
   - workflow (para acesso às GitHub Actions)
5. Clique em "Generate token"
6. Copie o token gerado (você não poderá vê-lo novamente)

### Passo 3: Inserir o Token no Script
Cole o token no terminal onde o script está aguardando a entrada.

### Passo 4: Verificar Criação do Arquivo
Após inserir o token, o script criará um arquivo `.github-token` (não versionado) e adicionará esta entrada ao `.gitignore`.

## 2. Configurar Secrets no Repositório do GitHub

### Passo 1: Acessar as Configurações do Repositório
1. No seu repositório GitHub, clique em "Settings"
2. No menu lateral, clique em "Secrets and variables" > "Actions"

### Passo 2: Adicionar as Seguintes Secrets
Adicione as seguintes secrets com seus respectivos valores:

| Nome da Secret | Descrição | Fonte |
|----------------|-----------|-------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Painel do Supabase > Project Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase | Painel do Supabase > Project Settings > API |
| `NETLIFY_AUTH_TOKEN` | Token de autenticação do Netlify | Painel do Netlify > User Settings > Applications |
| `NETLIFY_SITE_ID` | ID do site no Netlify | Painel do Netlify > Site Settings > General |

### Passo 3: Verificar Workflow
O workflow em [.github/workflows/deploy.yml](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/.github/workflows/deploy.yml) já está configurado para usar essas secrets.

### Script Auxiliar
Você pode executar o script [setup-github-secrets.ps1](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/setup-github-secrets.ps1) para obter instruções detalhadas:
```powershell
.\setup-github-secrets.ps1
```

## 3. Refinar Políticas RLS (Row Level Security) para Usuários Autenticados

### Passo 1: Acessar o Painel do Supabase
1. Faça login no painel do Supabase
2. Selecione seu projeto

### Passo 2: Configurar Autenticação de Usuários
1. Vá para "Authentication" > "Users"
2. Configure os provedores de autenticação desejados (Email, Google, etc.)

### Passo 3: Refinar Políticas RLS
O arquivo [supabase-schema.sql](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/supabase-schema.sql) agora contém políticas RLS refinadas que restringem o acesso aos dados de cada usuário. As políticas foram atualizadas para:

```sql
-- Exemplo de políticas refinadas para usuários autenticados
-- Para produtos
CREATE POLICY "Users can read their own products" ON public.products 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" ON public.products 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON public.products 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON public.products 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Repetir para clients e transactions
```

### Passo 4: Adicionar Coluna user_id
O arquivo de schema foi atualizado para incluir a coluna `user_id` em cada tabela:

```sql
ALTER TABLE public.products ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.clients ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.transactions ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

## 4. Implementar Autenticação de Usuários na Aplicação

### Passo 1: Atualizar o Serviço Supabase
O serviço [src/services/supabase.ts](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/src/services/supabase.ts) foi atualizado para incluir funções de autenticação:

```typescript
// Funções de autenticação adicionadas
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};
```

### Passo 2: Criar Contexto de Autenticação
O contexto de autenticação foi criado em [src/contexts/AuthContext.tsx](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/src/contexts/AuthContext.tsx):

```typescript
// O contexto fornece:
// - user: informações do usuário autenticado
// - signIn: função para login
// - signUp: função para registro
// - signOut: função para logout
// - loading: estado de carregamento
```

### Passo 3: Atualizar o Contexto do Banco de Dados
O contexto [src/contexts/SupabaseDatabaseContext.tsx](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/src/contexts/SupabaseDatabaseContext.tsx) foi atualizado para incluir o ID do usuário nas operações:

```typescript
// Exemplo de atualização
const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { error } = await supabase
      .from('products')
      .insert([{
        ...productData,
        user_id: user?.id, // Adicionar o ID do usuário
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    // ... restante da implementação
  } catch (error) {
    // ... tratamento de erro
  }
};
```

### Passo 4: Criar Componentes de Autenticação
Componentes de autenticação foram criados em [src/components/Auth/](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/src/components/Auth/):

- [LoginForm.tsx](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/src/components/Auth/LoginForm.tsx): Formulário de login/registro
- [UserProfile.tsx](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/src/components/Auth/UserProfile.tsx): Componente para exibir perfil do usuário

### Passo 5: Atualizar App.tsx
O [src/App.tsx](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/src/App.tsx) foi atualizado para usar o contexto de autenticação:

```typescript
// Estrutura atual
<AuthProvider>
  <SupabaseDatabaseProvider>
    <ConfigProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ConfigProvider>
  </SupabaseDatabaseProvider>
</AuthProvider>
```

### Passo 6: Atualizar Layout
O [src/components/Layout/Layout.tsx](file://C:/Users/perei/OneDrive/%C3%81rea%20de%20Trabalho/Atelie/src/components/Layout/Layout.tsx) foi atualizado para incluir o perfil do usuário no cabeçalho.

## Conclusão

Seguindo estes passos, você terá:
1. ✅ Configurado a autenticação do GitHub com PAT
2. ✅ Adicionado as secrets necessárias no repositório do GitHub
3. ✅ Refinado as políticas RLS para usuários autenticados
4. ✅ Implementado autenticação de usuários na aplicação

Essas melhorias aumentarão significativamente a segurança e a usabilidade do sistema em um ambiente de produção.

## Próximos Passos Sugeridos

1. Testar a autenticação localmente executando `yarn dev`
2. Verificar se as políticas RLS estão funcionando corretamente no Supabase
3. Configurar o CI/CD com GitHub Actions
4. Fazer deploy em produção no Netlify