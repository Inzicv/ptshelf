"use client";

import React, { useState } from "react";
import { useLibrary } from "@/context/LibraryContext";
import { FolderKanban, Plus, Search, Trash2, Edit3, X, Folder, Calendar, FileText } from "lucide-react";

export default function ProjectsPage() {
  const {
    projects,
    folders,
    templates,
    addProject,
    updateProject,
    deleteProject,
  } = useLibrary();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  const openCreateModal = () => {
    setName("");
    setDescription("");
    setFolderId("");
    setSelectedTemplateIds([]);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (project: import("@/types").Project) => {
    setCurrentProjectId(project.id);
    setName(project.name);
    setDescription(project.description || "");
    setFolderId(project.folderId || "");
    setSelectedTemplateIds(project.templateIds || []);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (modalMode === "create") {
      addProject(name, description || undefined, folderId || undefined);
    } else if (modalMode === "edit" && currentProjectId) {
      updateProject(currentProjectId, {
        name,
        description: description || undefined,
        folderId: folderId || undefined,
        templateIds: selectedTemplateIds,
      });
    }
    setIsModalOpen(false);
  };

  const toggleTemplateSelection = (tid: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(tid) ? prev.filter((id) => id !== tid) : [...prev, tid]
    );
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/40 px-6 py-6 sm:px-8 bg-card/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organisation</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Projets
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-4 py-2 transition-colors cursor-pointer shrink-0 shadow-md shadow-violet-500/10"
        >
          <Plus className="size-4" />
          Nouveau Projet
        </button>
      </div>

      <div className="flex-1 p-6 sm:p-8 max-w-6xl space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un projet..."
            className="w-full rounded-lg border border-border/50 bg-card/20 px-9 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          />
        </div>

        {/* Project Grid */}
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border bg-card/10">
            <FolderKanban className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-xs text-muted-foreground font-medium">Aucun projet trouvé</p>
            {search ? (
              <p className="text-[11px] text-muted-foreground/60 mt-1">Essayez un autre mot-clé.</p>
            ) : (
              <button
                onClick={openCreateModal}
                className="mt-3 text-xs font-semibold text-violet-400 hover:underline cursor-pointer"
              >
                Créer votre premier projet maintenant
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const folder = folders.find((f) => f.id === project.folderId);
              return (
                <div
                  key={project.id}
                  className="group rounded-xl border border-border/40 bg-card/25 p-5 shadow-sm hover:border-violet-500/20 hover:bg-card/45 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-foreground group-hover:text-violet-400 transition-colors text-base line-clamp-1">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="p-1 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[2rem]">
                      {project.description || "Aucune description fournie."}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                    <div className="flex items-center gap-1">
                      {folder ? (
                        <>
                          <Folder className="size-3 text-pink-400/80" />
                          <span className="text-pink-400/80 truncate max-w-[100px]">{folder.name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground/50">Sans dossier</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5" title="Templates associés">
                        <FileText className="size-3 text-violet-400/80" />
                        {project.templateIds?.length || 0} template{project.templateIds?.length > 1 ? "s" : ""}
                      </span>

                      <span className="flex items-center gap-1" title="Créé le">
                        <Calendar className="size-3 text-muted-foreground/60" />
                        {new Date(project.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
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
          <div className="relative w-full max-w-lg rounded-xl border border-border/50 bg-card p-6 shadow-xl space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <h2 className="text-lg font-bold text-foreground">
              {modalMode === "create" ? "Créer un nouveau projet" : "Modifier le projet"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="proj-name">
                  Nom du projet
                </label>
                <input
                  id="proj-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Campagne Marketing Été"
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="proj-desc">
                  Description
                </label>
                <textarea
                  id="proj-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez les objectifs ou le cadre de ce projet..."
                  rows={3}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="proj-folder">
                  Associer à un dossier
                </label>
                <select
                  id="proj-folder"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 cursor-pointer"
                >
                  <option value="">-- Aucun dossier --</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template selection (for edit mode) */}
              {modalMode === "edit" && templates.length > 0 && (
                <div className="space-y-1.5 border-t border-border/30 pt-3">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Associer des templates
                  </label>
                  <div className="max-h-36 overflow-y-auto border border-border/40 rounded-lg p-2.5 space-y-1.5 bg-background/50">
                    {templates.map((temp) => {
                      const isChecked = selectedTemplateIds.includes(temp.id);
                      return (
                        <div key={temp.id} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            id={`temp-select-${temp.id}`}
                            checked={isChecked}
                            onChange={() => toggleTemplateSelection(temp.id)}
                            className="size-3.5 rounded border-border/50 text-violet-600 focus:ring-violet-500/50 cursor-pointer"
                          />
                          <label
                            htmlFor={`temp-select-${temp.id}`}
                            className="text-muted-foreground hover:text-foreground cursor-pointer truncate"
                          >
                            {temp.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2 border-t border-border/30">
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
