"use client";

import React from "react";
import Link from "next/link";
import { useLibrary } from "@/context/LibraryContext";
import {
  FolderKanban,
  Shapes,
  Library,
  Settings,
  PlusCircle,
  Cloud,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { projects, folders, templates, presets, syncUrl, syncStatus, lastSyncedAt } = useLibrary();

  const stats = [
    {
      label: "Projets",
      value: projects.length,
      icon: FolderKanban,
      color: "text-violet-400 border-violet-500/20 bg-violet-500/5",
      href: "/projects",
    },
    {
      label: "Templates",
      value: templates.length,
      icon: Shapes,
      color: "text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5",
      href: "/templates",
    },
    {
      label: "Dossiers",
      value: folders.length,
      icon: Library,
      color: "text-pink-400 border-pink-500/20 bg-pink-500/5",
      href: "/library",
    },
    {
      label: "Presets",
      value: presets.length,
      icon: TrendingUp,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      href: "/templates",
    },
  ];

  return (
    <div className="flex min-h-full flex-col">
      {/* Dashboard Header */}
      <div className="border-b border-border/40 px-6 py-6 sm:px-8 bg-card/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{"Vue d'ensemble"}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
      </div>

      <div className="flex-1 space-y-8 p-6 sm:p-8 max-w-6xl">
        {/* Sync Banner */}
        {!syncUrl && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                <Cloud className="size-4 shrink-0" />
                Sauvegardez vos données sur Google Drive
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-xl leading-relaxed">
                Vos projets et templates sont actuellement stockés uniquement dans le navigateur. Liez votre compte Google Drive en quelques minutes pour ne jamais perdre vos données.
              </p>
            </div>
            <Link
              href="/settings"
              className="rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-4 py-2 transition-colors shrink-0 cursor-pointer shadow-md shadow-amber-500/10"
            >
              Configurer maintenant
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className={`flex flex-col justify-between rounded-xl border p-5 backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-violet-500/30 ${stat.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                <stat.icon className="size-5 shrink-0 opacity-80" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-foreground">{stat.value}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Action and Recent Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Quick Actions */}
          <div className="md:col-span-1 rounded-xl border border-border/40 bg-card/20 p-6 backdrop-blur-sm flex flex-col gap-5">
            <h2 className="text-sm font-bold text-foreground tracking-wide uppercase border-b border-border/30 pb-2">
              Actions Rapides
            </h2>
            <div className="flex flex-col gap-3">
              <Link
                href="/projects"
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted p-3 text-xs font-semibold text-foreground transition-all hover:border-violet-500/20"
              >
                <PlusCircle className="size-4 text-violet-400" />
                Nouveau Projet
              </Link>
              <Link
                href="/templates"
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted p-3 text-xs font-semibold text-foreground transition-all hover:border-fuchsia-400/20"
              >
                <PlusCircle className="size-4 text-fuchsia-400" />
                Nouveau Template
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted p-3 text-xs font-semibold text-foreground transition-all"
              >
                <Settings className="size-4 text-muted-foreground" />
                Paramètres Synchro
              </Link>
            </div>

            {syncUrl && (
              <div className="rounded-lg bg-background/30 border border-border/30 p-4 text-[11px] text-muted-foreground mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Statut :</span>
                  <span
                    className={`font-semibold ${
                      syncStatus === "success"
                        ? "text-emerald-400"
                        : syncStatus === "syncing"
                        ? "text-violet-400"
                        : "text-rose-400"
                    }`}
                  >
                    {syncStatus === "success"
                      ? "Synchronisé"
                      : syncStatus === "syncing"
                      ? "En cours..."
                      : "Erreur"}
                  </span>
                </div>
                {lastSyncedAt && (
                  <div className="flex justify-between items-center">
                    <span>Mis à jour :</span>
                    <span className="font-mono text-[10px]">
                      {new Date(lastSyncedAt).toLocaleTimeString("fr-FR")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Templates */}
          <div className="md:col-span-2 rounded-xl border border-border/40 bg-card/20 p-6 backdrop-blur-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <h2 className="text-sm font-bold text-foreground tracking-wide uppercase">
                Templates Récents
              </h2>
              <Link href="/templates" className="text-xs font-medium text-violet-400 hover:underline flex items-center">
                Tout voir
                <ChevronRight className="size-3" />
              </Link>
            </div>

            {templates.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background/30 rounded-lg border border-dashed border-border/60">
                <p className="text-xs text-muted-foreground">Aucun template enregistré pour le moment.</p>
                <Link
                  href="/templates"
                  className="mt-3 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Créer votre premier template &rarr;
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {templates.slice(-3).reverse().map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-background/40 border border-border/40 hover:border-violet-500/20 hover:bg-background/60 transition-all"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-md">
                        {template.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {template.variableIds.length > 0 && (
                        <span className="text-[10px] bg-violet-500/10 text-violet-400 font-semibold px-2 py-0.5 rounded border border-violet-500/10">
                          {template.variableIds.length} var{template.variableIds.length > 1 ? "s" : ""}
                        </span>
                      )}
                      <Link
                        href={`/templates?id=${template.id}`}
                        className="p-1 rounded bg-muted hover:bg-violet-600/10 hover:text-violet-400 transition-all cursor-pointer text-muted-foreground"
                        title="Éditer"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
