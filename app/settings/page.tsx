"use client";

import React from "react";
import { useLibrary } from "@/context/LibraryContext";
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle, LogOut } from "lucide-react";

export default function SettingsPage() {
  const {
    googleAccessToken,
    googleUser,
    autoSync,
    syncStatus,
    lastSyncedAt,
    syncError,
    setAutoSync,
    logoutGoogle,
    syncPull,
    syncPush,
  } = useLibrary();

  return (
    <div className="flex min-h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border/40 px-6 py-6 sm:px-8 bg-card/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Configuration</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Paramètres de Synchronisation
        </h1>
      </div>

      {/* Main Settings Panel */}
      <div className="flex-1 space-y-8 p-6 sm:p-8 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Form & Action Box */}
          <div className="flex flex-col gap-6 rounded-xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm shadow-md transition-all hover:border-violet-500/20 hover:shadow-violet-500/5">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Cloud className="size-5 text-violet-400" />
              Lier Google Drive
            </h2>
            
            <div className="space-y-4">
              {/* Profile details */}
              <div className="pt-2">
                {googleAccessToken && googleUser && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-3">
                      {googleUser.picture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={googleUser.picture}
                          alt={googleUser.name}
                          className="size-8 rounded-full border border-emerald-500/20"
                        />
                      ) : (
                        <div className="grid size-8 place-items-center rounded-full bg-violet-500/10 text-violet-400 font-bold text-xs">
                          {googleUser.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground leading-normal">{googleUser.name}</span>
                        <span className="text-[10px] text-muted-foreground leading-none">{googleUser.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={logoutGoogle}
                      className="flex items-center gap-1 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-rose-400 font-medium text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="size-3.5" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/30">
                <button
                  onClick={syncPull}
                  disabled={!googleAccessToken || syncStatus === "syncing"}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-background/60 hover:bg-muted px-3 py-2 text-xs font-medium transition-colors text-foreground cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`size-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                  Importer (Pull)
                </button>

                <button
                  onClick={() => syncPush()}
                  disabled={!googleAccessToken || syncStatus === "syncing"}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-background/60 hover:bg-muted px-3 py-2 text-xs font-medium transition-colors text-foreground cursor-pointer disabled:opacity-50"
                >
                  Exporter (Push)
                </button>
              </div>

              {/* Auto Sync checkbox */}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <input
                    id="autoSync"
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    disabled={!googleAccessToken}
                    className="size-4 rounded border-border/50 bg-background/50 text-violet-600 focus:ring-violet-500/50 cursor-pointer disabled:opacity-50"
                  />
                  <label
                    htmlFor="autoSync"
                    className={`text-sm font-medium cursor-pointer ${!googleAccessToken ? "text-muted-foreground/50 cursor-not-allowed" : "text-muted-foreground"}`}
                  >
                    Sauvegarde automatique (Auto-sync)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Status Info Box */}
          <div className="flex flex-col gap-6 rounded-xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm shadow-md transition-all hover:border-fuchsia-500/20 hover:shadow-fuchsia-500/5">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              {googleAccessToken ? (
                <Cloud className={`size-5 ${syncStatus === "error" ? "text-rose-400" : "text-emerald-400"}`} />
              ) : (
                <CloudOff className="size-5 text-muted-foreground" />
              )}
              État de la connexion
            </h2>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Statut actuel</span>
                <div className="flex items-center gap-2">
                  {!googleAccessToken ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border/50">
                      Non connecté
                    </span>
                  ) : syncStatus === "syncing" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-400 border border-violet-500/20">
                      <RefreshCw className="size-3 animate-spin" />
                      Synchronisation en cours
                    </span>
                  ) : syncStatus === "success" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="size-3" />
                      Synchronisé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
                      <AlertCircle className="size-3" />
                      Erreur de synchro
                    </span>
                  )}
                </div>
              </div>

              {lastSyncedAt && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Dernière synchronisation</span>
                  <span className="text-sm font-mono text-foreground bg-background/40 p-1.5 rounded border border-border/30 inline-block w-fit">
                    {new Date(lastSyncedAt).toLocaleString("fr-FR")}
                  </span>
                </div>
              )}

              {syncError && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">{"Détail de l'erreur"}</span>
                  <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-400 font-mono">
                    {syncError}
                  </div>
                </div>
              )}

              {!googleAccessToken && (
                <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                  La connexion Google Drive vous permet de sauvegarder vos prompts et presets dans votre espace cloud personnel de manière sécurisée. Vos données restent privées et stockées dans un fichier `ptshelf_data.json` à la racine de votre Drive.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
