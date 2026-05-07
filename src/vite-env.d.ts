/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KID_FACT_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
