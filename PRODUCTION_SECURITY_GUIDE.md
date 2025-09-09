# Guia de Segurança para Implantação em Produção

Este guia fornece instruções detalhadas para configurar adequadamente a segurança do sistema em um ambiente de produção.

## 1. Configuração do Supabase com RLS

### Row Level Security (RLS)
A RLS foi habilitada no arquivo [supabase-schema.sql](file://c:\Users\perei\OneDrive\Área%20de%20Trabalho\Atelie\supabase-schema.sql) com políticas básicas que permitem acesso completo. Para produção, estas políticas devem ser ajustadas para restringir o acesso com base em usuários autenticados.

### Configuração Recomendada para Produção

1. **Criar políticas mais restritivas**:
   ```sql
   -- Exemplo de políticas mais seguras
   CREATE POLICY "Users can only view their own products" 
   ON public.products 
   FOR SELECT 
   USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can only insert their own products" 
   ON public.products 
   FOR INSERT 
   WITH CHECK (auth.uid() = user_id);
   ```

2. **Configurar autenticação de usuários**:
   - Implementar login/logout na aplicação
   - Usar `auth.uid()` para identificar usuários
   - Configurar provedores de autenticação (Email, Google, etc.)

3. **Definir permissões adequadas**:
   ```sql
   -- Revogar permissões públicas
   REVOKE ALL ON public.products FROM anon, authenticated;
   
   -- Conceder permissões específicas através das políticas
   GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
   ```

## 2. Configuração do GitHub

### Criar Personal Access Token (PAT)

1. Acesse [GitHub Settings](https://github.com/settings/tokens)
2. Clique em "Generate new token"
3. Selecione as permissões necessárias:
   - `repo` (para acesso completo aos repositórios)
   - `workflow` (para acesso às GitHub Actions)
4. Copie o token gerado e armazene-o com segurança

### Configurar o Repositório para CI/CD

1. **Adicionar secrets no GitHub**:
   - Acesse as configurações do repositório
   - Vá em "Settings" > "Secrets and variables" > "Actions"
   - Adicione as seguintes secrets:
     - `VITE_SUPABASE_URL`: URL do projeto Supabase
     - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
     - `NETLIFY_AUTH_TOKEN`: Token de autenticação do Netlify
     - `NETLIFY_SITE_ID`: ID do site no Netlify

## 3. Configuração do Netlify

### Criar Token de Autenticação

1. Acesse [Netlify User Settings](https://app.netlify.com/user/applications)
2. Vá em "Access tokens"
3. Clique em "New access token"
4. Dê um nome descritivo ao token
5. Copie o token gerado

### Configurar Variáveis de Ambiente

1. No painel do Netlify, acesse "Site settings" > "Build & deploy" > "Environment"
2. Adicione as seguintes variáveis:
   - `VITE_SUPABASE_URL`: URL do projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

## 4. Melhorias de Segurança no Código

### Proteger Chaves de API

1. **Não armazenar chaves em código fonte**:
   ```typescript
   // ❌ Incorreto
   const supabaseUrl = "https://seu-projeto.supabase.co";
   
   // ✅ Correto
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   ```

2. **Validar variáveis de ambiente**:
   ```typescript
   if (!supabaseUrl || !supabaseAnonKey) {
     throw new Error("Supabase configuration is missing");
   }
   ```

### Implementar Autenticação de Usuários

1. **Adicionar serviço de autenticação**:
   ```typescript
   // src/services/authService.ts
   import { supabase } from './supabase';
   
   export const signIn = async (email: string, password: string) => {
     const { data, error } = await supabase.auth.signInWithPassword({
       email,
       password,
     });
     return { data, error };
   };
   
   export const signOut = async () => {
     const { error } = await supabase.auth.signOut();
     return { error };
   };
   
   export const getCurrentUser = async () => {
     const { data: { user } } = await supabase.auth.getUser();
     return user;
   };
   ```

2. **Atualizar contexto de banco de dados**:
   ```typescript
   // src/contexts/SupabaseDatabaseContext.tsx
   // Adicionar verificação de autenticação nas operações
   const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
     try {
       const user = await getCurrentUser();
       if (!user) throw new Error("User not authenticated");
       
       const { error } = await supabase
         .from('products')
         .insert([{
           ...productData,
           user_id: user.id, // Associar ao usuário autenticado
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
         }])
         .select();
       
       if (error) throw error;
       await refreshProducts();
       toast.success('Produto adicionado com sucesso!');
     } catch (error) {
       handleSupabaseError(error, 'product');
       throw error;
     }
   };
   ```

## 5. Monitoramento e Logging

### Configurar Logging de Erros

1. **Adicionar serviço de logging**:
   ```typescript
   // src/services/loggingService.ts
   export const logError = (error: any, context: string) => {
     console.error(`[${new Date().toISOString()}] ${context}:`, error);
     // Integrar com serviço de logging externo (Sentry, LogRocket, etc.)
   };
   ```

2. **Atualizar tratamento de erros**:
   ```typescript
   // src/utils/errorHandler.ts
   import { logError } from '../services/loggingService';
   
   export const handleSupabaseError = (error: any, context: string, showToast = false) => {
     logError(error, `Supabase-${context}`);
     // ... restante da implementação
   };
   ```

## 6. Backup e Recuperação

### Configurar Backups Automáticos

1. **No Supabase**:
   - Acesse o painel do projeto
   - Vá em "Database" > "Backups"
   - Configure backups automáticos diários

2. **Backup do Código**:
   - Manter repositório GitHub atualizado
   - Criar tags para versões estáveis
   - Utilizar branches para desenvolvimento

## 7. Checklist de Segurança para Produção

- [ ] RLS habilitado e configurado corretamente
- [ ] Políticas de acesso restritivas implementadas
- [ ] Autenticação de usuários configurada
- [ ] Chaves de API armazenadas como secrets
- [ ] GitHub PAT criado e configurado
- [ ] Netlify tokens configurados
- [ ] Variáveis de ambiente definidas corretamente
- [ ] Logging de erros implementado
- [ ] Backups automáticos configurados
- [ ] CI/CD pipeline testado e funcional
- [ ] Testes automatizados configurados
- [ ] Monitoramento de desempenho implementado

## 8. Próximos Passos

1. **Implementar autenticação de usuários** na aplicação
2. **Refinar políticas RLS** com base nos requisitos de negócios
3. **Configurar monitoramento** contínuo do sistema
4. **Realizar testes de penetração** para identificar vulnerabilidades
5. **Documentar procedimentos de resposta a incidentes**