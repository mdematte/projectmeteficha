import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Variaveis de ambiente injetadas pelo Lovable Cloud (Supabase).
// Nunca coloque chaves secretas/privilegiadas aqui: somente a chave publica (anon).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "meteficha-bet-auth",
  },
});

// Identificador de ambiente: este projeto roda EXCLUSIVAMENTE em modo demonstrativo.
// O backend (RLS + funcoes SECURITY DEFINER) tambem valida isso de forma independente do frontend.
export const APP_ENV = "demo" as const;
