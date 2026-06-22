"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLibrary } from "@/context/LibraryContext";
import { Template, Preset } from "@/types";
import {
  Shapes,
  Plus,
  Search,
  Trash2,
  Edit3,
  Copy,
  Check,
  Save,
  Play,
  Bookmark,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface PlaygroundProps {
  template: Template;
  presets: Preset[];
  updateTemplate: (id: string, updates: any) => void;
  deleteTemplate: (id: string) => void;
  addPreset: (name: string, templateId: string, values: Record<string, any>) => void;
  deletePreset: (id: string) => void;
}

function TemplatePlayground({
  template,
  presets,
  updateTemplate,
  deleteTemplate,
  addPreset,
  deletePreset,
}: PlaygroundProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || "");
  const [content, setContent] = useState(template.content);

  // Variable values
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  
  // Preset state
  const [newPresetName, setNewPresetName] = useState("");
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Reset local state if template prop changes (backup mechanism, though key reset usually handles it)
  useEffect(() => {
    setName(template.name);
    setDescription(template.description || "");
    setContent(template.content);
    setIsEditing(false);

    const initialValues: Record<string, string> = {};
    template.variableIds.forEach((key) => {
      initialValues[key] = "";
    });
    setVariableValues(initialValues);
  }, [template]);

  const handleSaveTemplate = () => {
    if (!name.trim()) return;
    updateTemplate(template.id, {
      name,
      description: description || undefined,
      content,
    });
    setIsEditing(false);
  };

  // Generate prompt
  const generatePrompt = () => {
    let finalPrompt = content;
    template.variableIds.forEach((key) => {
      const val = variableValues[key];
      const replacement = val !== undefined && val !== "" ? val : `[${key}]`;
      const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const curlyRegex = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, "g");
      const bracketRegex = new RegExp(`\\[\\s*${escapedKey}\\s*\\]`, "g");
      finalPrompt = finalPrompt.replace(curlyRegex, replacement).replace(bracketRegex, replacement);
    });
    return finalPrompt;
  };

  const finalPrompt = generatePrompt();

  const handleCopyPrompt = () => {
    if (!finalPrompt) return;
    navigator.clipboard.writeText(finalPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const currentPresets = presets.filter((p) => p.templateId === template.id);

  const handleApplyPreset = (preset: Preset) => {
    const updatedValues: Record<string, string> = {};
    template.variableIds.forEach((key) => {
      updatedValues[key] = String(preset.values[key] || "");
    });
    setVariableValues(updatedValues);
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    addPreset(newPresetName, template.id, { ...variableValues });
    setNewPresetName("");
    setIsSavingPreset(false);
  };

  return (
    <div className="flex-1 p-6 sm:p-8 max-w-5xl space-y-6">
      {/* Template Card */}
      <div className="rounded-xl border border-border/40 bg-card/20 p-6 backdrop-blur-sm shadow-md transition-all hover:border-violet-500/10">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 flex-1">
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg font-bold text-foreground bg-background border border-border/60 rounded-lg px-2.5 py-1 w-full max-w-md focus:border-violet-500 focus:outline-none"
              />
            ) : (
              <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <Shapes className="size-5 text-violet-400" />
                {template.name}
              </h2>
            )}

            {isEditing ? (
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ajouter une description..."
                className="text-xs text-muted-foreground bg-background border border-border/60 rounded-lg px-2.5 py-1 w-full focus:border-violet-500 focus:outline-none"
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                {template.description || "Aucune description."}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-3.5 py-2 transition-colors cursor-pointer shadow-md shadow-violet-500/10"
                >
                  <Save className="size-3.5" />
                  Sauvegarder
                </button>
                <button
                  onClick={() => {
                    setName(template.name);
                    setDescription(template.description || "");
                    setContent(template.content);
                    setIsEditing(false);
                  }}
                  className="rounded-lg border border-border bg-background hover:bg-muted text-foreground font-medium text-xs px-3.5 py-2 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 hover:bg-muted text-foreground font-medium text-xs px-3 py-2 transition-colors cursor-pointer"
                >
                  <Edit3 className="size-3.5" />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    if (confirm("Supprimer ce template ? Tous les presets associés seront perdus.")) {
                      deleteTemplate(template.id);
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-medium text-xs px-3 py-2 transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="size-3.5" />
                  Supprimer
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-6 space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Modèle de prompt (Template)
          </label>
          {isEditing ? (
            <div className="space-y-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-xs text-foreground font-mono focus:border-violet-500 focus:outline-none"
              />
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                {"Utilisez `[variable]` ou `{{variable}}` pour insérer des champs dynamiques. Ils seront automatiquement convertis en champs de saisie ci-dessous."}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border/40 bg-background/30 p-4 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
              {template.content.split(/(\{\{[^}]+\}\}|\[[^\]]+\])/g).map((chunk, i) => {
                const isVariable =
                  (chunk.startsWith("{{") && chunk.endsWith("}}")) ||
                  (chunk.startsWith("[") && chunk.endsWith("]"));
                return isVariable ? (
                  <span
                    key={i}
                    className="bg-violet-500/10 border border-violet-500/20 text-violet-400 px-1 py-0.5 rounded font-bold"
                  >
                    {chunk}
                  </span>
                ) : (
                  chunk
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Playground Grid */}
      <div className="grid gap-6 md:grid-cols-5">
        {/* Form and Presets */}
        <div className="md:col-span-3 space-y-6">
          {/* Dynamique Form */}
          <div className="rounded-xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-foreground tracking-wide uppercase border-b border-border/30 pb-2 flex items-center gap-1.5">
              <Sparkles className="size-4 text-violet-400" />
              Formulaire Dynamique
            </h3>

            {template.variableIds.length === 0 ? (
              <p className="text-xs text-muted-foreground/75 leading-relaxed py-2">
                {"Aucune variable détectée dans ce prompt. Modifiez le template pour ajouter des variables comme [nom] ou {{clé}}."}
              </p>
            ) : (
              <div className="space-y-4 pt-1">
                {template.variableIds.map((key) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-semibold text-muted-foreground/80 capitalize"
                      htmlFor={`var-${key}`}
                    >
                      {key}
                    </label>
                    <input
                      id={`var-${key}`}
                      type="text"
                      value={variableValues[key] || ""}
                      onChange={(e) =>
                        setVariableValues((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder={`Saisir la valeur pour ${key}...`}
                      className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Presets Box */}
          <div className="rounded-xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <h3 className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                <Bookmark className="size-4 text-pink-400" />
                Presets
              </h3>
              {template.variableIds.length > 0 && (
                <button
                  onClick={() => setIsSavingPreset(true)}
                  className="text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  Sauvegarder actuel
                </button>
              )}
            </div>

            {isSavingPreset && (
              <form
                onSubmit={handleSavePreset}
                className="flex items-end gap-2 p-3.5 rounded-lg border border-pink-500/20 bg-pink-500/5 animate-in slide-in-from-top duration-200"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                    Nom du preset
                  </label>
                  <input
                    type="text"
                    required
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="ex: Rhysand Forestier"
                    className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    type="submit"
                    className="rounded-md bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs px-3 py-1.5 transition-colors cursor-pointer"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPresetName("");
                      setIsSavingPreset(false);
                    }}
                    className="rounded-md border border-border bg-background hover:bg-muted text-foreground font-medium text-xs px-3 py-1.5 transition-colors cursor-pointer"
                  >
                    X
                  </button>
                </div>
              </form>
            )}

            {currentPresets.length === 0 ? (
              <p className="text-xs text-muted-foreground/75 leading-relaxed py-1">
                {"Aucun preset enregistré pour ce template. Saisissez des valeurs dans le formulaire et enregistrez-les en preset pour les réutiliser rapidement."}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {currentPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="inline-flex items-center gap-1 rounded-full bg-background border border-border hover:border-pink-500/20 p-1 pl-2.5 text-xs text-muted-foreground transition-all duration-200"
                  >
                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="font-medium text-foreground hover:text-pink-400 truncate max-w-[120px] transition-colors cursor-pointer"
                      title="Appliquer les valeurs"
                    >
                      {preset.name}
                    </button>
                    <button
                      onClick={() => deletePreset(preset.id)}
                      className="p-1 rounded-full hover:bg-rose-500/10 text-muted-foreground/60 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Supprimer preset"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Generated output */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm flex flex-col h-full gap-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <h3 className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                <Play className="size-4 text-emerald-400" />
                Rendu Final
              </h3>
              <button
                onClick={handleCopyPrompt}
                disabled={!finalPrompt}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-all flex items-center gap-1 cursor-pointer"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="size-3.5" />
                    Copie OK
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copier
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 flex flex-col min-h-[12rem] rounded-lg border border-border/40 bg-background/50 p-4 font-mono text-[11px] leading-relaxed text-foreground whitespace-pre-wrap select-all relative overflow-y-auto">
              {finalPrompt || (
                <span className="text-muted-foreground/50 italic">
                  {"Le prompt généré s'affichera ici à mesure que vous remplissez les variables."}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatesContent() {
  const {
    templates,
    presets,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addPreset,
    deletePreset,
  } = useLibrary();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState("");

  const templateIdParam = searchParams.get("id");
  const selectedTemplate = templates.find((t) => t.id === templateIdParam);

  // Auto select template on mount or list update
  useEffect(() => {
    if (templates.length > 0 && !templateIdParam) {
      router.replace(`/templates?id=${templates[templates.length - 1].id}`);
    }
  }, [templates, templateIdParam, router]);

  const handleCreateTemplate = () => {
    const newName = `Nouveau Template ${templates.length + 1}`;
    const newContent = "Bonjour [nom], bienvenue dans {{projet}} !";
    addTemplate(newName, newContent, "Description facultative");
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Sidebar List */}
      <div className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-border/45 bg-card/5 flex flex-col h-1/2 md:h-full">
        <div className="p-4 border-b border-border/40 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full rounded-md border border-border/50 bg-background/50 px-8 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-violet-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleCreateTemplate}
            className="p-2 rounded-md bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer"
            title="Ajouter un template"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredTemplates.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center p-4">Aucun template</p>
          ) : (
            filteredTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  router.push(`/templates?id=${t.id}`);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                  templateIdParam === t.id
                    ? "bg-violet-600/10 border-violet-500/30 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-card/40 hover:text-foreground"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold truncate">{t.name}</span>
                  {t.variableIds.length > 0 && (
                    <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold font-mono">
                      {t.variableIds.length} vars
                    </span>
                  )}
                </div>
                <span className="line-clamp-1 opacity-70 text-[10px] font-mono leading-relaxed">
                  {t.content}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-1/2 md:h-full overflow-y-auto bg-background">
        {selectedTemplate ? (
          <TemplatePlayground
            key={selectedTemplate.id}
            template={selectedTemplate}
            presets={presets}
            updateTemplate={updateTemplate}
            deleteTemplate={deleteTemplate}
            addPreset={addPreset}
            deletePreset={deletePreset}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <Shapes className="size-12 text-muted-foreground/30 mb-4 animate-pulse" />
            <h2 className="text-base font-semibold text-foreground">Sélectionnez ou créez un template</h2>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
              {"Choisissez un template dans la colonne de gauche ou cliquez sur le bouton \"+\" pour concevoir un nouveau modèle de prompt."}
            </p>
            <button
              onClick={handleCreateTemplate}
              className="mt-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-4 py-2 transition-colors cursor-pointer shadow-md shadow-violet-500/10"
            >
              Créer votre premier template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="size-8 text-violet-400 animate-spin" />
        </div>
      }
    >
      <TemplatesContent />
    </Suspense>
  );
}
