"use client";

// Hook d'authentification Supabase pour Nodex Trading.
// Fournit l'utilisateur courant, son état de chargement, et les méthodes login/logout.
import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export type AuthState = {
  user: User | null;
  loading: boolean;
  configured: boolean;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    configured: isSupabaseConfigured(),
  });

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setState({ user: null, loading: false, configured: false });
      return;
    }

    // Récupère la session existante (si l'utilisateur était déjà connecté)
    supabase.auth.getUser().then(({ data: { user } }) => {
      setState({ user: user ?? null, loading: false, configured: true });
    });

    // Écoute les changements d'auth (login, logout, refresh token…)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        loading: false,
        configured: true,
      });
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  /** Lance la connexion Google (redirige vers Google puis revient sur l'origine). */
  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error("Supabase non configuré — ajoute les variables d'env.");
    }
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/settings` : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
  }, []);

  /** Déconnecte l'utilisateur. */
  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return {
    ...state,
    signInWithGoogle,
    signOut,
  };
}
