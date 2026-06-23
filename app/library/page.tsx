"use client";

import React, { useState } from "react";
import { useLibrary } from "@/context/LibraryContext";
import { Library, Trash2, Edit3, X, Folder, ChevronRight, FolderPlus } from "lucide-react";
import Link from "next/link";

export default function LibraryPage() {
  const {
    folders,
    templates,
    addFolder,
    updateFolder,
    deleteFolder,
  } = useLibrary();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");

  const openCreateModal = () => {
    setName("");
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (folder: import("@/types").Folder) => {
    setCurrentFolderId(folder.id);
    setName(folder.name);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (modalMode === "create") {
      addFolder(name);
    } else if (modalMode === "edit" && currentFolderId) {
      updateFolder(currentFolderId, { name });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/40 px-6 py-6 sm:px-8 bg-card/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bibliothèque</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Dossiers
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-4 py-2 transition-colors cursor-pointer shrink-0 shadow-md shadow-violet-500/10"
        >
          <FolderPlus className="size-4" />
          Nouveau Dossier
        </button>
      </div>

      <div className="flex-1 p-4 md:p-6 lg:p-8 w-full space-y-8">
        {folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border bg-card/10">
            <Library className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-xs text-muted-foreground font-medium">Aucun dossier créé</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Créez des dossiers pour regrouper et organiser vos templates.</p>
            <button
              onClick={openCreateModal}
              className="mt-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-4 py-2 transition-colors cursor-pointer shadow-md shadow-violet-500/10"
            >
              Créer votre premier dossier
            </button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {folders.map((folder) => {
              // Find templates belonging to this folder
              const folderTemplates = templates.filter((t) => t.folderId === folder.id);

              return (
                <div
                  key={folder.id}
                  className="group rounded-xl border border-border/40 bg-card/25 p-5 shadow-sm hover:border-violet-500/20 hover:bg-card/40 transition-all duration-200 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-border/30 pb-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <Folder className="size-5 text-pink-400 shrink-0" />
                      <h3 className="font-bold text-foreground text-sm truncate">{folder.name}</h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => openEditModal(folder)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Renommer"
                      >
                        <Edit3 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Supprimer ce dossier ? Les templates associés seront retirés du dossier mais pas supprimés.")) {
                            deleteFolder(folder.id);
                          }
                        }}
                        className="p-1.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Templates ({folderTemplates.length})
                    </span>

                    {folderTemplates.length === 0 ? (
                      <p className="text-xs text-muted-foreground/60 italic py-1">
                        Aucun template dans ce dossier.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {folderTemplates.map((temp) => (
                          <div
                            key={temp.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/35 text-xs"
                          >
                            <span className="font-medium text-foreground truncate max-w-[200px]">
                              {temp.name}
                            </span>
                            <Link
                              href={`/templates?id=${temp.id}`}
                              className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-0.5 hover:underline"
                            >
                              Éditer
                              <ChevronRight className="size-3" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal - Overlay Simple */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-xl border border-border/50 bg-card p-6 shadow-xl space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <h2 className="text-lg font-bold text-foreground">
              {modalMode === "create" ? "Nouveau dossier" : "Modifier le dossier"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="fold-name">
                  Nom du dossier
                </label>
                <input
                  id="fold-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Prompts IA Rédaction"
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-border bg-background hover:bg-muted px-4 py-2 text-sm font-medium transition-colors text-foreground cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 text-sm font-medium transition-colors cursor-pointer shadow-md shadow-violet-500/10"
                >
                  {modalMode === "create" ? "Créer" : "Sauvegarder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
