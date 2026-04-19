// Client Supabase (singleton côté navigateur)
// Les variables d'env doivent être préfixées NEXT_PUBLIC_ pour être exposées au client.
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let _supabase: SupabaseClient | null = null;

/**
 * Retourne le client Supabase (singleton).
 * Retourne null si les variables d'env ne sont pas configurées (mode dégradé).
 */
export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    if (typeof window !== "undefined") {
      // Prévient en console sans casser le rendu
      console.warn(
        "[Supabase] Variables d'env manquantes (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY). La connexion cloud est désactivée."
      );
    }
    return null;
  }
  _supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _supabase;
}

export const isSupabaseConfigured = (): boolean =>
  Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
