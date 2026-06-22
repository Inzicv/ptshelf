"use client";

import React, { useState } from "react";
import { useLibrary } from "@/context/LibraryContext";
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle, LogOut } from "lucide-react";

export default function SettingsPage() {
  const {
    googleClientId,
    googleAccessToken,
    googleUser,
    autoSync,
    syncStatus,
    lastSyncedAt,
    syncError,
    setGoogleClientId,
    setAutoSync,
    loginGoogle,
    logoutGoogle,
    syncPull,
    syncPush,
  } = useLibrary();

  const [inputClientId, setInputClientId] = useState(googleClientId);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveClientId = () => {
    setGoogleClientId(inputClientId.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

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
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="clientId">
                  {"Identifiant client OAuth (Client ID) Google"}
                </label>
                <div className="flex gap-2">
                  <input
                    id="clientId"
                    type="text"
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    placeholder="ex: 123456-abcde.apps.googleusercontent.com"
                    className="flex-1 rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                  <button
                    onClick={handleSaveClientId}
                    className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-500 transition-colors cursor-pointer shrink-0"
                  >
                    Enregistrer
                  </button>
                </div>
                {saveSuccess && (
                  <p className="text-[10px] text-emerald-400 font-medium">Client ID enregistré avec succès !</p>
                )}
              </div>

              <div className="pt-2 border-t border-border/30">
                {googleAccessToken && googleUser ? (
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
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Associez votre compte Google pour activer la synchronisation automatique et manuelle de vos données (dossiers, templates, presets).
                    </p>
                    <button
                      onClick={loginGoogle}
                      disabled={!googleClientId}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/30 text-white font-medium text-xs px-4 py-2.5 transition-colors cursor-pointer shadow-md shadow-violet-500/10 disabled:cursor-not-allowed"
                    >
                      <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.324 0-6.023-2.7-6.023-6.023 0-3.324 2.7-6.023 6.023-6.023 1.482 0 2.837.542 3.89 1.436l3.123-3.123C18.966 2.052 15.827 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.82 0 10.8-4.148 10.8-11.24 0-.693-.075-1.39-.2-1.955H12.24z"/>
                      </svg>
                      Se connecter avec Google
                    </button>
                    {!googleClientId && (
                      <p className="text-[10px] text-amber-500 flex items-center gap-1 font-medium mt-0.5">
                        <AlertCircle className="size-3 shrink-0" />
                        Configurez et enregistrez un Client ID ci-dessus pour vous connecter.
                      </p>
                    )}
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

        {/* Step-by-Step Instructions */}
        <div className="rounded-xl border border-border/40 bg-card/25 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Guide pas-à-pas pour obtenir un Client ID Google</h3>
          
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/20 font-bold text-xs text-violet-400 mt-0.5">1</span>
              <div>
                <p className="font-semibold text-foreground">{"Créez un projet sur la Google Cloud Console"}</p>
                <p>{"Ouvrez la "}<strong><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Google Cloud Console</a></strong>{", créez un nouveau projet (ex: \"PTShelf\")."}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/20 font-bold text-xs text-violet-400 mt-0.5">2</span>
              <div>
                <p className="font-semibold text-foreground">{"Configurez l'écran de consentement OAuth"}</p>
                <p>{"Dans le menu latéral, allez dans "}<strong>{"APIs & Services > Écran de consentement OAuth"}</strong>{" :"}</p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                  <li>{"Sélectionnez le type d'utilisateur "}<strong>{"Externe"}</strong>{" (ou Interne si vous êtes sur Workspace)."}</li>
                  <li>{"Remplissez les informations obligatoires (Nom de l'application : \"PTShelf\", email d'assistance et développeur)."}</li>
                  <li>{"À l'étape "}<strong>{"Champs d'application (Scopes)"}</strong>{", ajoutez le scope "}<code>{"https://www.googleapis.com/auth/drive.file"}</code>{" pour restreindre l'accès de l'application à ses propres fichiers."}</li>
                  <li>{"À l'étape "}<strong>{"Utilisateurs de test"}</strong>{", ajoutez votre adresse e-mail Google."}</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/20 font-bold text-xs text-violet-400 mt-0.5">3</span>
              <div>
                <p className="font-semibold text-foreground">{"Créez des identifiants client OAuth 2.0"}</p>
                <p>{"Allez dans l'onglet "}<strong>{"Identifiants"}</strong>{" (colonne de gauche) > cliquez sur "}<strong>{"+ CRÉER DES IDENTIFIANTS"}</strong>{" > sélectionnez "}<strong>{"Identifiant client OAuth"}</strong>{" :"}</p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                  <li>{"Type d'application : "}<strong>{"Application Web"}</strong>.</li>
                  <li>{"Nom : \"PTShelf Local\"."}</li>
                  <li>{"Dans la section "}<strong>{"Origines JavaScript autorisées"}</strong>{", cliquez sur ajouter et saisissez : "}<code>{"http://localhost:3000"}</code>{" (ou le port sur lequel PTShelf tourne localement)."}</li>
                  <li>{"Cliquez sur "}<strong>{"Créer"}</strong>{"."}</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/20 font-bold text-xs text-violet-400 mt-0.5">4</span>
              <div>
                <p className="font-semibold text-foreground">{"Copiez et Enregistrez le Client ID"}</p>
                <p>{"Copiez l'"}<strong>{"Identifiant client"}</strong>{" généré (qui se termine par "}<code>{".apps.googleusercontent.com"}</code>{") et collez-le ci-dessus, puis enregistrez et connectez-vous !"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
