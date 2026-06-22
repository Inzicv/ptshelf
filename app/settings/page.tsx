"use client";

import React, { useState } from "react";
import { useLibrary } from "@/context/LibraryContext";
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";

export default function SettingsPage() {
  const {
    syncUrl,
    autoSync,
    syncStatus,
    lastSyncedAt,
    syncError,
    setSyncUrl,
    setAutoSync,
    syncPull,
    syncPush,
  } = useLibrary();

  const [inputUrl, setInputUrl] = useState(syncUrl);
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const handleSaveUrl = () => {
    setSyncUrl(inputUrl);
    setTestStatus("idle");
    setTestMessage(null);
  };

  const handleTestConnection = async () => {
    if (!inputUrl) {
      setTestStatus("error");
      setTestMessage("Veuillez saisir une URL valide.");
      return;
    }

    setTestStatus("testing");
    setTestMessage(null);

    try {
      const response = await fetch(`/api/sync?url=${encodeURIComponent(inputUrl)}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setTestStatus("success");
      setTestMessage("Connexion établie avec succès ! Le script répond correctement.");
    } catch (e: unknown) {
      console.error(e);
      setTestStatus("error");
      const message = e instanceof Error ? e.message : String(e);
      setTestMessage(message || "Erreur de connexion. Vérifiez l'URL de votre application Web.");
    }
  };

  const copyScriptToClipboard = () => {
    const scriptText = `const FILE_NAME = "ptshelf_data.json";

function doGet(e) {
  try {
    const file = getOrCreateFile();
    const content = file.getBlob().getDataAsString();
    return ContentService.createTextOutput(content)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const file = getOrCreateFile();
    file.setContent(JSON.stringify(postData, null, 2));
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFile() {
  const files = DriveApp.getFilesByName(FILE_NAME);
  if (files.hasNext()) {
    return files.next();
  } else {
    const initialData = {
      projects: [],
      folders: [],
      templates: [],
      presets: []
    };
    return DriveApp.createFile(FILE_NAME, JSON.stringify(initialData, null, 2));
  }
}`;

    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <label className="text-sm font-medium text-muted-foreground" htmlFor="scriptUrl">
                  {"URL de l'application Web Google Apps Script"}
                </label>
                <div className="flex gap-2">
                  <input
                    id="scriptUrl"
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    id="autoSync"
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    disabled={!syncUrl}
                    className="size-4 rounded border-border/50 bg-background/50 text-violet-600 focus:ring-violet-500/50 cursor-pointer disabled:opacity-50"
                  />
                  <label
                    htmlFor="autoSync"
                    className={`text-sm font-medium cursor-pointer ${!syncUrl ? "text-muted-foreground/50" : "text-muted-foreground"}`}
                  >
                    Sauvegarde automatique sur modification (Auto-sync)
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/30">
                <button
                  onClick={handleTestConnection}
                  disabled={testStatus === "testing"}
                  className="flex-1 rounded-lg border border-border/60 bg-background/60 hover:bg-muted px-3 py-2 text-xs font-medium transition-colors text-foreground cursor-pointer disabled:opacity-50"
                >
                  {testStatus === "testing" ? "Vérification..." : "Tester la connexion"}
                </button>

                <button
                  onClick={syncPull}
                  disabled={!syncUrl || syncStatus === "syncing"}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-background/60 hover:bg-muted px-3 py-2 text-xs font-medium transition-colors text-foreground cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`size-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                  Importer (Pull)
                </button>

                <button
                  onClick={() => syncPush()}
                  disabled={!syncUrl || syncStatus === "syncing"}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-background/60 hover:bg-muted px-3 py-2 text-xs font-medium transition-colors text-foreground cursor-pointer disabled:opacity-50"
                >
                  Exporter (Push)
                </button>
              </div>

              {/* Status and Messages */}
              {testStatus !== "idle" && testMessage && (
                <div
                  className={`mt-4 flex items-start gap-2.5 rounded-lg p-3 text-xs border ${
                    testStatus === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : testStatus === "error"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {testStatus === "success" ? (
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  )}
                  <span>{testMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sync Status Info Box */}
          <div className="flex flex-col gap-6 rounded-xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm shadow-md transition-all hover:border-fuchsia-500/20 hover:shadow-fuchsia-500/5">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              {syncUrl ? (
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
                  {!syncUrl ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border/50">
                      Non configuré
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

              {!syncUrl && (
                <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                  La configuration de Google Apps Script vous permet de décentraliser le stockage de vos prompts et presets. Vos données locales seront conservées et poussées vers votre Drive.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions & Script Copy */}
        <div className="rounded-xl border border-border/40 bg-card/25 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Guide pas-à-pas pour Google Apps Script</h3>
          
          <div className="grid gap-6 md:grid-cols-5">
            <div className="md:col-span-3 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/20 font-bold text-xs text-violet-400 mt-0.5">1</span>
                  <p>{"Ouvrez "}<a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Google Apps Script</a>{" et créez un "}<strong>Nouveau projet</strong>.</p>
                </div>
                <div className="flex gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/20 font-bold text-xs text-violet-400 mt-0.5">2</span>
                  <p>{"Copiez le script ci-contre et collez-le dans l'éditeur de code de votre projet Apps Script (en remplaçant le code existant)."}</p>
                </div>
                <div className="flex gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/20 font-bold text-xs text-violet-400 mt-0.5">3</span>
                  <p>{"Cliquez sur Déployer (en haut à droite) > Nouveau déploiement."}</p>
                </div>
                <div className="flex gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/20 font-bold text-xs text-violet-400 mt-0.5">4</span>
                  <p>{"Choisissez le type de déploiement Application Web et configurez :" }
                     <br /><span className="text-xs text-muted-foreground">{"- Exécuter en tant que : "}<strong>Moi</strong></span>
                     <br /><span className="text-xs text-muted-foreground">{"- Qui a accès : "}<strong>Tout le monde</strong>{" (indispensable pour l'accès local)"}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/20 font-bold text-xs text-violet-400 mt-0.5">5</span>
                  <p>{"Déployez, autorisez l'accès à Google Drive (via les paramètres avancés de validation Google), puis copiez l'URL de l'application Web générée pour la coller ci-dessus."}</p>
                </div>
              </div>
            </div>

            {/* Code Copy Box */}
            <div className="md:col-span-2 flex flex-col rounded-lg border border-border/50 bg-background/50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>Code Google Apps Script</span>
                <button
                  onClick={copyScriptToClipboard}
                  className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex-1 p-3 font-mono text-[10px] text-muted-foreground overflow-y-auto max-h-[220px]">
                <pre>{`const FILE_NAME = "ptshelf_data.json";

function doGet(e) {
  try {
    const file = getOrCreateFile();
    const content = file.getContentText();
    return ContentService.createTextOutput(content)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) { ... }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const file = getOrCreateFile();
    file.setContent(JSON.stringify(postData));
    ...
  } catch (err) { ... }
}

function getOrCreateFile() { ... }`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
