"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useLibrary } from "@/context/LibraryContext";
import { Layers3, Cloud, AlertCircle, Loader2 } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { googleAccessToken, loginGoogle, syncStatus, syncError } = useLibrary();

  if (!googleAccessToken) {
    return (
      <div className="min-h-dvh w-full bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/20 via-background to-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glow decorative spots */}
        <div className="absolute top-[-10%] left-[-10%] w-[45rem] h-[45rem] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-fuchsia-600/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md rounded-2xl border border-border/40 bg-card/25 p-8 backdrop-blur-xl shadow-2xl relative z-10 flex flex-col items-center text-center space-y-6 transition-all hover:border-violet-500/20">
          {/* Logo */}
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-50 blur group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            <span className="relative grid size-12 place-items-center rounded-xl bg-violet-600 text-white">
              <Layers3 className="size-6" aria-hidden="true" />
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              PTShelf
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Organisez vos prompts, variables et presets en toute sécurité sur votre propre Google Drive.
            </p>
          </div>

          <div className="w-full pt-4 space-y-4">
            <button
              onClick={loginGoogle}
              disabled={syncStatus === "syncing"}
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/30 text-white font-semibold text-sm px-4 py-3 transition-all cursor-pointer shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-[0.98] disabled:cursor-not-allowed"
            >
              {syncStatus === "syncing" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <svg className="size-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.324 0-6.023-2.7-6.023-6.023 0-3.324 2.7-6.023 6.023-6.023 1.482 0 2.837.542 3.89 1.436l3.123-3.123C18.966 2.052 15.827 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.82 0 10.8-4.148 10.8-11.24 0-.693-.075-1.39-.2-1.955H12.24z"/>
                </svg>
              )}
              {syncStatus === "syncing" ? "Connexion..." : "Se connecter avec Google"}
            </button>

            {syncError && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-left text-[11px] text-rose-400 font-mono">
                <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                <span>{syncError}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/25 w-full flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <Cloud className="size-3.5 text-emerald-400" />
            <span>Vos données restent chez vous (Drive privé).</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[1600px]">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
