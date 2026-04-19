"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings, DollarSign, Download, Upload, Check, Copy,
  AlertTriangle, RefreshCw, User, Shield, Link2, Link2Off, Clock,
  Cloud, LogOut, CloudOff,
} from "lucide-react";
import {
  getSettings, saveSettings, exportAllData, importAllData,
  getCurrentCapital, getStats, UserSettings,
  enableAutoBackup, disableAutoBackup, getAutoBackup, refreshAutoBackup,
} from "@/lib/store";
import { useAuth } from "@/lib/useAuth";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [currentCapital, setCurrentCapital] = useState(0);
  const [stats, setStats] = useState(getStats());
  const [exportCode, setExportCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [backupCopied, setBackupCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoBackup, setAutoBackup] = useState<{ code: string; updatedAt: string } | null>(null);

  // Auth cloud (Google via Supabase)
  const { user, loading: authLoading, configured: cloudConfigured, signInWithGoogle, signOut } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      await signInWithGoogle();
      // Le flow OAuth redirige vers Google puis revient, donc authBusy sera reset au retour.
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Connexion Google échouée");
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await signOut();
    } finally {
      setAuthBusy(false);
    }
  };

  useEffect(() => {
    setCurrentCapital(getCurrentCapital());
    setStats(getStats());
    setSettings(getSettings());
    setAutoBackup(getAutoBackup());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setCurrentCapital(getCurrentCapital());
    setStats(getStats());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const code = exportAllData();
    setExportCode(code);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBackup = () => {
    if (!autoBackup) return;
    navigator.clipboard.writeText(autoBackup.code);
    setBackupCopied(true);
    setTimeout(() => setBackupCopied(false), 2000);
  };

  const handleImport = () => {
    if (!importCode.trim()) return;
    const success = importAllData(importCode);
    setImportStatus(success ? "success" : "error");
    if (success) {
      setSettings(getSettings());
      setCurrentCapital(getCurrentCapital());
      setStats(getStats());
      setAutoBackup(getAutoBackup());
      setImportCode("");
    }
    setTimeout(() => setImportStatus("idle"), 3000);
  };

  const handleDisableSync = () => {
    disableAutoBackup();
    setSettings(getSettings());
    setAutoBackup(null);
  };

  const handleRefreshBackup = () => {
    refreshAutoBackup();
    setAutoBackup(getAutoBackup());
  };

  const formatBackupTime = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4 md:space-y-0">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xl md:text-3xl font-bold mb-1"
      >
        Paramètres
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-text-muted text-xs md:text-sm mb-4 md:mb-8"
      >
        Configuration de votre compte et synchronisation
      </motion.p>

      {/* Sync status banner */}
      {settings.autoBackupEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 md:p-4 mb-4 flex items-center justify-between gap-3 border border-accent-green/25"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent-green/15 flex items-center justify-center shrink-0">
              <Link2 size={16} className="text-accent-green" />
            </div>
            <div>
              <p className="text-xs font-semibold text-accent-green">Sauvegarde automatique active</p>
              {autoBackup && (
                <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                  <Clock size={9} /> Mis à jour le {formatBackupTime(autoBackup.updatedAt)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn-primary text-xs font-medium"
            >
              {backupCopied ? <Check size={13} /> : <Copy size={13} />}
              {backupCopied ? "Copié !" : "Copier"}
            </button>
            <button
              onClick={handleRefreshBackup}
              className="p-1.5 rounded-xl glass-btn text-text-muted"
              title="Rafraîchir"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleDisableSync}
              className="p-1.5 rounded-xl glass-btn text-text-muted hover:text-accent-red transition-colors"
              title="Désactiver"
            >
              <Link2Off size={14} />
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Profile & Capital */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 md:p-6 space-y-4 md:space-y-6"
        >
          <h2 className="text-base font-semibold flex items-center gap-2">
            <User size={18} className="text-primary" />
            Profil & Capital
          </h2>

          <div>
            <label className="text-xs text-text-muted mb-1.5 block uppercase tracking-wider">
              Nom d&apos;affichage
            </label>
            <input
              type="text"
              value={settings.displayName}
              onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
              placeholder="Nahel"
              className="glass-input w-full px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1.5 block uppercase tracking-wider">
              Capital de départ ($)
            </label>
            <input
              type="number"
              step="any"
              value={settings.startingCapital || ""}
              onChange={(e) => setSettings({ ...settings, startingCapital: parseFloat(e.target.value) || 0 })}
              placeholder="1000"
              className="glass-input w-full px-4 py-3 text-sm"
            />
            <p className="text-xs text-text-muted mt-2">
              Utilisé comme base pour le calcul du capital actuel.
            </p>
          </div>

          {/* Current capital display */}
          <div className="p-3 md:p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent-green/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted uppercase tracking-wider">Capital actuel</span>
              <DollarSign size={14} className="text-primary" />
            </div>
            <p className={`text-xl md:text-2xl font-bold ${currentCapital >= settings.startingCapital ? "text-accent-green neon-green" : "text-accent-red neon-red"}`}>
              {currentCapital.toLocaleString("fr-FR")} $
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs font-medium ${stats.capitalGrowthPercent >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                {stats.capitalGrowthPercent >= 0 ? "+" : ""}{stats.capitalGrowthPercent}%
              </span>
              <span className="text-xs text-text-muted">
                depuis {settings.startingCapital.toLocaleString("fr-FR")} $
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="text-center p-2.5 md:p-3 rounded-xl glass-btn">
              <p className="text-base md:text-lg font-bold text-primary">{stats.totalTrades}</p>
              <p className="text-[9px] md:text-[10px] text-text-muted uppercase">Trades</p>
            </div>
            <div className="text-center p-2.5 md:p-3 rounded-xl glass-btn">
              <p className={`text-base md:text-lg font-bold ${stats.totalPnl >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                {stats.totalPnl >= 0 ? "+" : ""}{stats.totalPnl.toFixed(0)} $
              </p>
              <p className="text-[9px] md:text-[10px] text-text-muted uppercase">PnL Total</p>
            </div>
            <div className="text-center p-2.5 md:p-3 rounded-xl glass-btn">
              <p className="text-base md:text-lg font-bold text-accent-green">{stats.winRate.toFixed(0)}%</p>
              <p className="text-[9px] md:text-[10px] text-text-muted uppercase">Win Rate</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 glass-btn-primary rounded-2xl font-medium transition-all flex items-center justify-center gap-2"
          >
            {saved ? <Check size={18} /> : <Settings size={18} />}
            {saved ? "Sauvegardé !" : "Sauvegarder"}
          </button>
        </motion.div>

        {/* Data Sync */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* === CONNEXION CLOUD (Google via Supabase) === */}
          <div className="glass-card p-4 md:p-6 space-y-3 md:space-y-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Cloud size={18} className="text-primary" />
              Connexion Cloud
            </h2>

            {/* Cloud non configuré : variables d'env manquantes */}
            {!cloudConfigured && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow text-xs">
                <CloudOff size={14} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Service cloud non configuré</p>
                  <p className="opacity-80">
                    Ajoute les variables{" "}
                    <code className="text-[10px] bg-black/20 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
                    <code className="text-[10px] bg-black/20 px-1 rounded">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{" "}
                    sur Vercel pour activer la connexion Google.
                  </p>
                </div>
              </div>
            )}

            {/* Chargement de la session */}
            {cloudConfigured && authLoading && (
              <div className="flex items-center gap-2 text-xs text-text-muted py-2">
                <RefreshCw size={14} className="animate-spin" />
                Vérification de la session...
              </div>
            )}

            {/* Non connecté : bouton Google */}
            {cloudConfigured && !authLoading && !user && (
              <>
                <p className="text-xs text-text-muted">
                  Connecte-toi avec Google pour synchroniser tes données sur tous tes appareils, automatiquement et sans code de transfert.
                </p>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authBusy}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white text-[#1f1f1f] px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <GoogleIcon />
                  {authBusy ? "Redirection..." : "Continuer avec Google"}
                </button>
                {authError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs">
                    <AlertTriangle size={13} className="shrink-0" />
                    {authError}
                  </div>
                )}
              </>
            )}

            {/* Connecté : infos user + logout */}
            {cloudConfigured && !authLoading && user && (
              <>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-accent-green/10 border border-accent-green/25">
                  {user.user_metadata?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(user.user_metadata?.full_name || user.email || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      {user.user_metadata?.full_name || user.user_metadata?.name || "Connecté"}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-accent-green uppercase tracking-wider shrink-0">
                    Cloud ok
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  Tes données seront bientôt synchronisées automatiquement sur le cloud — fini le code de transfert.
                </p>
                <button
                  onClick={handleSignOut}
                  disabled={authBusy}
                  className="w-full py-2.5 glass-btn rounded-2xl font-medium transition-all flex items-center justify-center gap-2 text-sm text-text-muted hover:text-accent-red disabled:opacity-50"
                >
                  <LogOut size={14} />
                  {authBusy ? "Déconnexion..." : "Se déconnecter"}
                </button>
              </>
            )}
          </div>

          {/* Export */}
          <div className="glass-card p-4 md:p-6 space-y-3 md:space-y-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Upload size={18} className="text-accent-green" />
              Exporter mes données
            </h2>
            <p className="text-xs text-text-muted">
              Générez un code pour transférer vos données vers un autre appareil.
            </p>

            <button
              onClick={handleExport}
              className="w-full py-2.5 glass-btn rounded-2xl font-medium transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw size={16} />
              Générer le code de transfert
            </button>

            {exportCode && (
              <div className="space-y-2">
                <textarea
                  readOnly
                  value={exportCode}
                  className="w-full h-20 px-3 py-2.5 rounded-xl text-xs font-mono resize-none"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className="w-full py-2.5 glass-btn-primary rounded-2xl font-medium transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copié !" : "Copier le code"}
                </button>
              </div>
            )}
          </div>

          {/* Import */}
          <div className="glass-card p-4 md:p-6 space-y-3 md:space-y-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Download size={18} className="text-primary" />
              Importer des données
            </h2>
            <p className="text-xs text-text-muted">
              Collez le code de transfert d&apos;un autre appareil. La sauvegarde automatique s&apos;activera et vos données seront synchronisées à chaque trade.
            </p>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow text-xs">
              <AlertTriangle size={13} className="shrink-0" />
              <span>L&apos;importation remplacera toutes vos données actuelles.</span>
            </div>

            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Collez votre code de transfert ici..."
              className="w-full h-20 px-3 py-2.5 rounded-xl text-xs font-mono resize-none"
            />

            <button
              onClick={handleImport}
              disabled={!importCode.trim()}
              className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                importCode.trim() ? "glass-btn-primary" : "glass-btn opacity-50 cursor-not-allowed"
              }`}
            >
              <Shield size={16} />
              Importer + Activer la sauvegarde auto
            </button>

            {importStatus === "success" && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm">
                <Check size={16} />
                Données importées ! Sauvegarde auto activée.
              </div>
            )}
            {importStatus === "error" && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
                <AlertTriangle size={16} />
                Code invalide. Vérifiez et réessayez.
              </div>
            )}

            {!settings.autoBackupEnabled && (
              <button
                onClick={() => { enableAutoBackup(); setSettings(getSettings()); setAutoBackup(getAutoBackup()); }}
                className="w-full py-2.5 glass-btn rounded-2xl font-medium transition-all flex items-center justify-center gap-2 text-sm text-accent-green"
              >
                <Link2 size={16} />
                Activer la sauvegarde auto sans importer
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Logo Google officiel (4 couleurs) pour le bouton de connexion
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
