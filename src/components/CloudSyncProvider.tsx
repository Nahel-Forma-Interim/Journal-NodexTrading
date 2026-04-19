"use client";

// Provider qui relie l'auth Supabase au store localStorage.
// - Au login : pull du cloud (ou push du local si cloud vide).
// - À chaque mutation (event `nodex-data-changed`) : push discret vers le cloud.
//
// L'état de synchro est exposé via un context léger consommable avec `useCloudSync`.

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import type { SyncPayload } from "@/lib/store";
import {
  syncAfterLogin,
  pushTrade,
  deleteTradeRemote,
  pushPlan,
  deletePlanRemote,
  pushNote,
  deleteNoteRemote,
  pushSettings,
} from "@/lib/cloudSync";

type SyncStatus = "idle" | "initial-sync" | "syncing" | "ok" | "error" | "offline";

type CloudSyncContext = {
  status: SyncStatus;
  lastError: string | null;
  lastSyncedAt: Date | null;
};

const Ctx = createContext<CloudSyncContext>({
  status: "idle",
  lastError: null,
  lastSyncedAt: null,
});

export function useCloudSync(): CloudSyncContext {
  return useContext(Ctx);
}

export default function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const initialSyncDone = useRef<string | null>(null); // userId de la dernière sync initiale

  // === Sync initiale au login ===
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setStatus("idle");
      initialSyncDone.current = null;
      return;
    }
    if (initialSyncDone.current === user.id) return; // déjà fait pour cet user

    setStatus("initial-sync");
    setLastError(null);
    syncAfterLogin(user.id)
      .then(() => {
        initialSyncDone.current = user.id;
        setStatus("ok");
        setLastSyncedAt(new Date());
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[CloudSync] initial sync failed:", msg);
        setLastError(msg);
        setStatus("error");
      });
  }, [user, loading]);

  // === Écoute des mutations ===
  useEffect(() => {
    if (!user) return;

    const handler = async (e: Event) => {
      const payload = (e as CustomEvent<SyncPayload>).detail;
      if (!payload) return;

      setStatus("syncing");
      setLastError(null);
      try {
        if (payload.collection === "trade") {
          if (payload.op === "upsert") await pushTrade(user.id, payload.item);
          else await deleteTradeRemote(user.id, payload.id);
        } else if (payload.collection === "plan") {
          if (payload.op === "upsert") await pushPlan(user.id, payload.item);
          else await deletePlanRemote(user.id, payload.id);
        } else if (payload.collection === "note") {
          if (payload.op === "upsert") await pushNote(user.id, payload.item);
          else await deleteNoteRemote(user.id, payload.id);
        } else if (payload.collection === "settings") {
          await pushSettings(user.id, payload.item);
        }
        setLastSyncedAt(new Date());
        setStatus("ok");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[CloudSync] push failed:", msg);
        setLastError(msg);
        setStatus("error");
      }
    };

    window.addEventListener("nodex-data-changed", handler);
    return () => window.removeEventListener("nodex-data-changed", handler);
  }, [user]);

  return (
    <Ctx.Provider value={{ status, lastError, lastSyncedAt }}>{children}</Ctx.Provider>
  );
}
