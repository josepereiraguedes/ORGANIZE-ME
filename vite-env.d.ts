/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly NODE_ENV: string
  // Adicione outras variáveis de ambiente conforme necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}