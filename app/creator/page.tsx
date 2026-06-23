"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLibrary } from "@/context/LibraryContext";
import {
  Wand2,
  Sparkles,
  Bookmark,
  Trash2,
  Undo,
  ArrowRight,
  Folder,
  Info,
  Check,
  Plus,
} from "lucide-react";

interface VariableInfo {
  key: string;
  originalText: string;
  isConditional: boolean;
}

export default function TemplateCreatorPage() {
  const { folders, addTemplate } = useLibrary();
  const router = useRouter();

  // Prompt state
  const [content, setContent] = useState("");
  const [variables, setVariables] = useState<VariableInfo[]>([]);

  // Metadata state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState("");

  // UI States
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Monitor selection changes in the textarea
  const handleTextareaSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selected = textarea.value.substring(start, end);
      setSelectedText(selected);
      setSelectionRange({ start, end });
    } else {
      setSelectedText("");
      setSelectionRange(null);
    }
  };

  // Convert selected text into a variable
  const makeVariable = (isConditional: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea || !selectionRange || !selectedText) {
      alert("Veuillez d'abord sélectionner du texte dans le prompt.");
      return;
    }

    const varName = prompt(
      isConditional
        ? `Entrez le nom de la condition pour "${selectedText}" :`
        : `Entrez le nom de la variable pour "${selectedText}" :`
    );

    if (!varName) return;

    // Clean name to be valid identifier (letters, numbers, underscore)
    const cleanVarName = varName.trim().replace(/[^a-zA-Z0-9_]/g, "_");
    if (!cleanVarName) {
      alert("Nom de variable invalide. Utilisez uniquement des lettres, chiffres et underscores.");
      return;
    }

    // Check if key already exists with different type
    const existing = variables.find((v) => v.key === cleanVarName);
    if (existing && existing.isConditional !== isConditional) {
      alert(`La variable "${cleanVarName}" existe déjà avec un type différent.`);
      return;
    }

    const { start, end } = selectionRange;
    const before = content.substring(0, start);
    const after = content.substring(end);

    let replacement = "";
    if (isConditional) {
      replacement = `[?${cleanVarName}]${selectedText}[/?${cleanVarName}]`;
    } else {
      replacement = `[${cleanVarName}]`;
    }

    const newContent = before + replacement + after;
    setContent(newContent);

    // Save variable details
    if (!variables.some((v) => v.key === cleanVarName)) {
      setVariables((prev) => [
        ...prev,
        { key: cleanVarName, originalText: selectedText, isConditional },
      ]);
    }

    // Reset selection state
    setSelectedText("");
    setSelectionRange(null);

    // Refocus with selection cleared
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Delete variable and replace key in prompt back with original text
  const removeVariable = (keyToDelete: string) => {
    const item = variables.find((v) => v.key === keyToDelete);
    if (!item) return;

    // Revert template content from variable format back to original text
    let newContent = content;
    if (item.isConditional) {
      // Find and remove conditional tags: [?key]content[/?key] -> content
      const condRegex = new RegExp(`\\[\\?\\s*${keyToDelete}\\s*\\]([\\s\\S]*?)\\[\\/\\?\\s*${keyToDelete}\\s*\\]`, "g");
      newContent = newContent.replace(condRegex, "$1");
    } else {
      // Replace regular variable tags [key] with originalText
      const bracketRegex = new RegExp(`\\[\\s*${keyToDelete}\\s*\\]`, "g");
      const curlyRegex = new RegExp(`\\{\\{\\s*${keyToDelete}\\s*\\}\\}`, "g");
      newContent = newContent.replace(bracketRegex, item.originalText).replace(curlyRegex, item.originalText);
    }

    setContent(newContent);
    setVariables((prev) => prev.filter((v) => v.key !== keyToDelete));
  };

  // Create Template and save
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!content.trim()) return;

    const templateId = addTemplate(
      name.trim(),
      content,
      description.trim() || undefined,
      folderId || undefined
    );

    setSuccessMessage(true);
    setTimeout(() => {
      router.push(`/templates?id=${templateId}`);
    }, 1000);
  };

  // Helper to parse content chunks for preview styling
  const renderPreviewContent = () => {
    if (!content) {
      return <span className="text-muted-foreground/40 italic">L'aperçu en temps réel s'affichera ici...</span>;
    }

    // Match [var], {{var}}, [?cond]block[/?cond], etc.
    const variableRegex = /(\[[\s\S]*?\]|\{\{[\s\S]*?\}\})/g;
    const parts = content.split(variableRegex);

    return parts.map((part, i) => {
      const isVar =
        (part.startsWith("[") && part.endsWith("]")) ||
        (part.startsWith("{{") && part.endsWith("}}"));

      if (!isVar) return <React.Fragment key={i}>{part}</React.Fragment>;

      // Check if it is conditional tag or inside conditional block
      const isCond = part.startsWith("[?") || part.startsWith("{{?");
      const isClosing = part.startsWith("[/?") || part.startsWith("{{/?");

      if (isCond) {
        return (
          <span
            key={i}
            className="inline-block bg-pink-500/10 border border-pink-500/30 text-pink-400 font-bold px-1.5 py-0.5 rounded text-[10px] mx-0.5 font-mono shadow-sm"
          >
            {part}
          </span>
        );
      }
      if (isClosing) {
        return (
          <span
            key={i}
            className="inline-block bg-pink-500/5 border border-pink-500/20 text-pink-400/70 font-semibold px-1 py-0.5 rounded text-[9px] mx-0.5 font-mono"
          >
            {part}
          </span>
        );
      }

      return (
        <span
          key={i}
          className="inline-block bg-violet-500/15 border border-violet-500/30 text-violet-300 font-bold px-1.5 py-0.5 rounded text-[10px] mx-0.5 font-mono shadow-sm"
        >
          {part}
        </span>
      );
    });
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border/40 px-6 py-6 sm:px-8 bg-card/10 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outils de création</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent flex items-center gap-2">
            <Wand2 className="size-5 text-violet-400" />
            Créateur de Template
          </h1>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto grid gap-6 lg:grid-cols-5">
        {/* Main Work Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border border-border/40 bg-card/25 p-5 sm:p-6 backdrop-blur-sm shadow-md flex flex-col gap-4 relative">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <h2 className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                <Sparkles className="size-4 text-violet-400" />
                1. Saisir & Sélectionner
              </h2>
              {selectedText && (
                <div className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-semibold">
                  Sélection : "{selectedText.length > 15 ? selectedText.substring(0, 15) + "..." : selectedText}"
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Collez ou écrivez votre prompt brut ci-dessous. Surlignez un mot ou une phrase avec votre souris pour la transformer en paramètre dynamique.
            </p>

            <div className="relative group">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={handleTextareaSelect}
                onMouseUp={handleTextareaSelect}
                onKeyUp={handleTextareaSelect}
                placeholder="Exemple : Bonjour Jean, nous confirmons votre rendez-vous le 24 Juin à 14h00 pour la révision de votre Renault Clio."
                rows={10}
                className="w-full rounded-lg border border-border/50 bg-background/50 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 font-mono focus:border-violet-500 focus:outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Selection Actions Panel */}
            <div className={`p-4 rounded-lg border transition-all duration-200 ${
              selectedText 
                ? "border-violet-500/30 bg-violet-600/5" 
                : "border-border/40 bg-background/20 opacity-60"
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Info className={`size-4 shrink-0 mt-0.5 ${selectedText ? "text-violet-400" : "text-muted-foreground/60"}`} />
                  <div>
                    <h3 className={`text-xs font-bold ${selectedText ? "text-foreground" : "text-muted-foreground"}`}>
                      {selectedText ? "Transformer la sélection" : "Aucun texte sélectionné"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground/80 leading-relaxed mt-0.5">
                      {selectedText 
                        ? `Choisissez le type de variable pour "${selectedText}"`
                        : "Surlignez du texte ci-dessus pour activer les boutons de variable."
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center">
                  <button
                    type="button"
                    disabled={!selectedText}
                    onClick={() => makeVariable(false)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/20 disabled:text-violet-400/40 text-white font-semibold text-xs transition-colors cursor-pointer disabled:cursor-not-allowed shadow-md shadow-violet-500/10"
                  >
                    <Sparkles className="size-3.5" />
                    Rendre Variable
                  </button>
                  <button
                    type="button"
                    disabled={!selectedText}
                    onClick={() => makeVariable(true)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:bg-pink-600/20 disabled:text-pink-400/40 text-white font-semibold text-xs transition-colors cursor-pointer disabled:cursor-not-allowed shadow-md shadow-pink-500/10"
                  >
                    <Bookmark className="size-3.5" />
                    Conditionnel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Preview Block */}
          <div className="rounded-xl border border-border/40 bg-card/25 p-5 sm:p-6 backdrop-blur-sm shadow-md flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground tracking-wide uppercase border-b border-border/30 pb-2">
              Aperçu du Template
            </h2>
            <div className="rounded-lg border border-border/30 bg-background/30 p-4 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed min-h-[6rem] max-h-60 overflow-y-auto">
              {renderPreviewContent()}
            </div>
          </div>
        </div>

        {/* Right Configuration Bar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="rounded-xl border border-border/40 bg-card/25 p-5 sm:p-6 backdrop-blur-sm shadow-md flex flex-col gap-4">
            <h2 className="text-sm font-bold text-foreground tracking-wide uppercase border-b border-border/30 pb-2 flex items-center gap-1.5">
              <Folder className="size-4 text-fuchsia-400" />
              2. Configurer & Enregistrer
            </h2>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="creator-name">
                  Nom du template *
                </label>
                <input
                  id="creator-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Email d'invitation réunion"
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs text-foreground focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="creator-desc">
                  Description
                </label>
                <textarea
                  id="creator-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ex: Modèle pour inviter des collaborateurs externes..."
                  rows={2}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs text-foreground focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="creator-folder">
                  Associer à un dossier
                </label>
                <select
                  id="creator-folder"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs text-foreground focus:border-violet-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Aucun dossier --</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {successMessage ? (
                <div className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 py-2.5 text-xs text-emerald-400 font-bold">
                  <Check className="size-4 animate-bounce" />
                  Template créé avec succès !
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!name.trim() || !content.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/30 text-white font-bold text-xs py-2.5 transition-all cursor-pointer shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 disabled:cursor-not-allowed"
                >
                  Créer le Template
                  <ArrowRight className="size-4" />
                </button>
              )}
            </form>
          </div>

          {/* Variables Manager */}
          <div className="rounded-xl border border-border/40 bg-card/25 p-5 sm:p-6 backdrop-blur-sm shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <h2 className="text-sm font-bold text-foreground tracking-wide uppercase">
                Variables Détectées ({variables.length})
              </h2>
            </div>

            {variables.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 leading-relaxed italic py-2">
                Aucune variable créée pour le moment. Sélectionnez du texte dans l'éditeur pour commencer.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {variables.map((v) => (
                  <div
                    key={v.key}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background/40 hover:bg-background/70 transition-all gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground truncate">{v.key}</span>
                        <span className={`text-[8px] font-bold font-mono px-1 rounded uppercase tracking-wide border ${
                          v.isConditional 
                            ? "bg-pink-500/10 border-pink-500/20 text-pink-400" 
                            : "bg-violet-500/10 border-violet-500/20 text-violet-400"
                        }`}>
                          {v.isConditional ? "cond" : "var"}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        Valeur d'origine : "{v.originalText}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeVariable(v.key)}
                      className="p-1.5 rounded-md hover:bg-rose-500/10 text-muted-foreground/50 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                      title="Supprimer la variable et restaurer le texte d'origine"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
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
