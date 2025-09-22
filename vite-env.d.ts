/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly NODE_ENV: string
  // Adicione outras variáveis de ambiente conforme necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}