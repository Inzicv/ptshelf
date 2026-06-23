"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar, navigation } from "@/components/layout/sidebar";
import { useLibrary } from "@/context/LibraryContext";
import { Layers3, Cloud, AlertCircle, Loader2, X, Settings2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { googleAccessToken, loginGoogle, syncStatus, syncError } = useLibrary();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
              Organisez vos prompts, variables et presets en toute sécurité.
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
            <span>Vos données restent stockées de manière isolée.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col w-full relative">
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex-1 flex min-h-[calc(100dvh-3.5rem)] w-full min-w-0">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile Sidebar (Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative flex w-full max-w-xs flex-col bg-card border-r border-border/40 p-4 shadow-xl z-50 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
              <span className="font-bold tracking-tight bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">Menu</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            
            {/* Same navigation items */}
            <nav className="flex-1 space-y-1" aria-label="Navigation mobile">
              {navigation.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                      isActive
                        ? "bg-violet-600/15 text-violet-400 border border-violet-500/25 shadow-[0_0_10px_rgba(139,92,246,0.05)]"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground border border-transparent",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            
            <div className="border-t border-border/30 pt-4 mt-auto">
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                  pathname === "/settings"
                    ? "bg-violet-600/15 text-violet-400 border border-violet-500/25 shadow-[0_0_10px_rgba(139,92,246,0.05)]"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground border border-transparent",
                )}
              >
                <Settings2 className="size-4" aria-hidden="true" />
                Paramètres
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
