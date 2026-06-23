"use client";

import Link from "next/link";
import { Layers3, CloudOff, RefreshCw, CheckCircle2, AlertCircle, Menu } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { googleAccessToken, syncStatus, lastSyncedAt } = useLibrary();

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 w-full">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMenuToggle}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </button>
          
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <span className="grid size-8 place-items-center rounded-lg bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Layers3 className="size-4" aria-hidden="true" />
            </span>
            <span className="font-bold tracking-tight bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">PTShelf</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Sync Status Badge */}
          {googleAccessToken ? (
            <Link
              href="/settings"
              className="flex items-center gap-1.5 rounded-full bg-card/40 border border-border/40 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-violet-500/20 transition-all"
              title={lastSyncedAt ? `Dernière synchro : ${new Date(lastSyncedAt).toLocaleString()}` : "Non synchronisé"}
            >
              {syncStatus === "syncing" ? (
                <>
                  <RefreshCw className="size-3.5 text-violet-400 animate-spin" />
                  <span className="text-[10px] font-medium hidden sm:inline text-violet-400">Synchro...</span>
                </>
              ) : syncStatus === "success" ? (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span className="text-[10px] font-medium hidden sm:inline text-emerald-400">Drive lié</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-3.5 text-rose-400" />
                  <span className="text-[10px] font-medium hidden sm:inline text-rose-400">Erreur synchro</span>
                </>
              )}
            </Link>
          ) : (
            <Link
              href="/settings"
              className="flex items-center gap-1.5 rounded-full bg-card/20 border border-border/30 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all"
              title="Synchronisation Google Drive non configurée"
            >
              <CloudOff className="size-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-medium hidden sm:inline">Hors ligne</span>
            </Link>
          )}

          <div className="rounded-md border border-border/40 bg-card/40 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            v0.2
          </div>
        </div>
      </div>
    </header>
  );
}

