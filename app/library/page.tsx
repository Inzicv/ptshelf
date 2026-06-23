"use client";

import React, { useState } from "react";
import { useLibrary } from "@/context/LibraryContext";
import { Folder } from "@/types";
import {
  Library,
  Trash2,
  Edit3,
  X,
  Folder as FolderIcon,
  ChevronRight,
  FolderPlus,
  FileText,
  Home,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";

export default function LibraryPage() {
  const {
    folders,
    templates,
    addFolder,
    updateFolder,
    deleteFolder,
    updateTemplate,
  } = useLibrary();

  // Navigation states
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"explorer" | "all">("explorer");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentFolderIdToEdit, setCurrentFolderIdToEdit] = useState<string | null>(null);

  // Drag and drop states
  const [draggedOverFolderId, setDraggedOverFolderId] = useState<string | null>(null);
  const [draggedOverBreadcrumbIndex, setDraggedOverBreadcrumbIndex] = useState<number | null>(null);
  const [draggedOverRootBreadcrumb, setDraggedOverRootBreadcrumb] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");

  const openCreateModal = () => {
    setName("");
    setParentId(currentFolderId || "");
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (folder: Folder) => {
    setCurrentFolderIdToEdit(folder.id);
    setName(folder.name);
    setParentId(folder.parentId || "");
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parentVal = parentId || undefined;

    if (modalMode === "create") {
      addFolder(name, parentVal);
    } else if (modalMode === "edit" && currentFolderIdToEdit) {
      updateFolder(currentFolderIdToEdit, { name, parentId: parentVal });
    }
    setIsModalOpen(false);
  };

  // Helper to build breadcrumbs
  const buildBreadcrumbs = (): Folder[] => {
    const path: Folder[] = [];
    let current = folders.find((f) => f.id === currentFolderId);
    while (current) {
      path.unshift(current);
      const pid = current.parentId;
      current = pid ? folders.find((f) => f.id === pid) : undefined;
    }
    return path;
  };

  const breadcrumbs = buildBreadcrumbs();

  // Filter folders and templates for current directory
  const currentFolders = folders.filter((f) => {
    if (!currentFolderId) {
      return !f.parentId;
    }
    return f.parentId === currentFolderId;
  });

  const currentTemplates = templates.filter((t) => {
    if (!currentFolderId) {
      return !t.folderId;
    }
    return t.folderId === currentFolderId;
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, templateId: string) => {
    e.dataTransfer.setData("templateId", templateId);
  };

  const handleTemplateDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    const templateId = e.dataTransfer.getData("templateId");
    if (templateId) {
      updateTemplate(templateId, { folderId: targetFolderId || undefined });
    }
    setDraggedOverFolderId(null);
    setDraggedOverBreadcrumbIndex(null);
    setDraggedOverRootBreadcrumb(false);
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/40 px-6 py-6 sm:px-8 bg-card/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bibliothèque</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Espace Templates
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle Tabs */}
          <div className="flex rounded-lg border border-border/50 bg-background/50 p-1">
            <button
              onClick={() => setActiveTab("explorer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === "explorer"
                  ? "bg-violet-600/15 text-violet-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              Explorateur
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "bg-violet-600/15 text-violet-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="size-3.5" />
              Tous les templates
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-4 py-2 transition-colors cursor-pointer shrink-0 shadow-md shadow-violet-500/10"
          >
            <FolderPlus className="size-4" />
            Nouveau Dossier
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 lg:p-8 w-full space-y-6">
        {activeTab === "explorer" ? (
          <>
            {/* Breadcrumbs Navigation */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium py-1 px-2 rounded-lg bg-card/10 border border-border/20 w-fit">
              <button
                onClick={() => setCurrentFolderId(null)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDraggedOverRootBreadcrumb(true);
                }}
                onDragLeave={() => setDraggedOverRootBreadcrumb(false)}
                onDrop={(e) => handleTemplateDrop(e, null)}
                className={`flex items-center gap-1 px-1.5 py-1 rounded transition-colors cursor-pointer ${
                  draggedOverRootBreadcrumb
                    ? "bg-emerald-500/20 text-emerald-400 border border-dashed border-emerald-500/40"
                    : currentFolderId === null
                    ? "text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Home className="size-3.5" />
                <span>Racine</span>
              </button>

              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                const isOver = draggedOverBreadcrumbIndex === idx;
                return (
                  <React.Fragment key={crumb.id}>
                    <ChevronRight className="size-3 text-muted-foreground/45" />
                    <button
                      onClick={() => setCurrentFolderId(crumb.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDraggedOverBreadcrumbIndex(idx);
                      }}
                      onDragLeave={() => setDraggedOverBreadcrumbIndex(null)}
                      onDrop={(e) => handleTemplateDrop(e, crumb.id)}
                      className={`px-1.5 py-1 rounded transition-colors cursor-pointer ${
                        isOver
                          ? "bg-emerald-500/20 text-emerald-400 border border-dashed border-emerald-500/40"
                          : isLast
                          ? "text-violet-400 font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      disabled={isLast && !isOver}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Folder Explorer view */}
            {currentFolders.length === 0 && currentTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border bg-card/10">
                <Library className="size-10 text-muted-foreground/50 mb-3" />
                <p className="text-xs text-muted-foreground font-medium">Ce dossier est vide</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Créez des sous-dossiers ou glissez des templates ici.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Subfolders Grid */}
                {currentFolders.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Dossiers</h2>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                      {currentFolders.map((folder) => {
                        const folderTemplates = templates.filter((t) => t.folderId === folder.id);
                        const folderSubfolders = folders.filter((f) => f.parentId === folder.id);
                        const isOver = draggedOverFolderId === folder.id;

                        return (
                          <div
                            key={folder.id}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDraggedOverFolderId(folder.id);
                            }}
                            onDragLeave={() => setDraggedOverFolderId(null)}
                            onDrop={(e) => handleTemplateDrop(e, folder.id)}
                            onClick={() => setCurrentFolderId(folder.id)}
                            className={`group rounded-xl border p-5 shadow-sm transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer ${
                              isOver
                                ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20 scale-[1.01]"
                                : "border-border/40 bg-card/25 hover:border-violet-500/20 hover:bg-card/40"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 border-b border-border/30 pb-3">
                              <div className="flex items-center gap-2.5 truncate">
                                <FolderIcon className="size-5 text-pink-400 shrink-0" />
                                <h3 className="font-bold text-foreground text-sm truncate">{folder.name}</h3>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(folder);
                                  }}
                                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  title="Renommer / Modifier"
                                >
                                  <Edit3 className="size-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("Supprimer ce dossier ? Les sous-dossiers et templates associés seront remontés d'un niveau.")) {
                                      // Move children up
                                      folders
                                        .filter((f) => f.parentId === folder.id)
                                        .forEach((f) => updateFolder(f.id, { parentId: folder.parentId }));
                                      templates
                                        .filter((t) => t.folderId === folder.id)
                                        .forEach((t) => updateTemplate(t.id, { folderId: folder.parentId }));
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

                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                              <span>Templates ({folderTemplates.length})</span>
                              <span>•</span>
                              <span>Sous-dossiers ({folderSubfolders.length})</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Templates Grid */}
                {currentTemplates.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Templates</h2>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                      {currentTemplates.map((template) => (
                        <div
                          key={template.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, template.id)}
                          className="group rounded-xl border border-border/40 bg-card/20 p-5 shadow-sm hover:border-violet-500/20 hover:bg-card/30 transition-all duration-200 flex flex-col justify-between gap-4 cursor-grab active:cursor-grabbing"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-bold text-foreground text-sm line-clamp-1">{template.name}</h3>
                              <Link
                                href={`/templates?id=${template.id}`}
                                className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-0.5 hover:underline shrink-0"
                              >
                                Éditer
                                <ChevronRight className="size-3" />
                              </Link>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {template.description || "Aucune description fournie."}
                            </p>
                          </div>
                          <div className="text-[9px] font-mono text-muted-foreground/60 line-clamp-1 bg-background/30 p-1.5 rounded border border-border/20">
                            {template.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* All Templates view */
          <div className="space-y-4">
            <div className="flex justify-between items-center pl-1">
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Liste complète ({templates.length} templates)
              </h2>
              <span className="text-[10px] text-muted-foreground/60">
                {"💡 Glissez-déposez n'importe quel template dans l'onglet Explorateur pour l'organiser"}
              </span>
            </div>

            {templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border bg-card/10">
                <FileText className="size-10 text-muted-foreground/50 mb-3" />
                <p className="text-xs text-muted-foreground font-medium">Aucun template enregistré</p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {templates.map((template) => {
                  const folder = folders.find((f) => f.id === template.folderId);
                  return (
                    <div
                      key={template.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, template.id)}
                      className="group rounded-xl border border-border/40 bg-card/20 p-5 shadow-sm hover:border-violet-500/20 hover:bg-card/30 transition-all duration-200 flex flex-col justify-between gap-4 cursor-grab active:cursor-grabbing"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-foreground text-sm line-clamp-1">{template.name}</h3>
                          <div className="flex items-center gap-2">
                            {folder ? (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-semibold max-w-[80px] truncate">
                                {folder.name}
                              </span>
                            ) : (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted border border-border/50 text-muted-foreground font-semibold">
                                Sans dossier
                              </span>
                            )}
                            <Link
                              href={`/templates?id=${template.id}`}
                              className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-0.5 hover:underline shrink-0"
                            >
                              Éditer
                              <ChevronRight className="size-3" />
                            </Link>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {template.description || "Aucune description fournie."}
                        </p>
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground/60 line-clamp-1 bg-background/30 p-1.5 rounded border border-border/20">
                        {template.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Folder Create / Edit */}
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="fold-parent">
                  Dossier parent
                </label>
                <select
                  id="fold-parent"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 cursor-pointer"
                >
                  <option value="">-- Racine (Aucun) --</option>
                  {folders
                    .filter((f) => f.id !== currentFolderIdToEdit) // Prevent recursive self parent selection
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                </select>
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
