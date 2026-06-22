"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Project, Folder, Template, Preset, EntityId, AutocompleteSuggestion } from "@/types";

export type SyncStatus = "idle" | "syncing" | "success" | "error";

interface LibraryState {
  projects: Project[];
  folders: Folder[];
  templates: Template[];
  presets: Preset[];
  autocompleteSuggestions: Record<string, AutocompleteSuggestion[]>;
  syncUrl: string;
  autoSync: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncError: string | null;
}

interface LibraryContextType extends LibraryState {
  setSyncUrl: (url: string) => void;
  setAutoSync: (val: boolean) => void;
  syncPull: () => Promise<boolean>;
  syncPush: () => Promise<boolean>;
  
  // Projects
  addProject: (name: string, description?: string, folderId?: string) => void;
  updateProject: (id: EntityId, updates: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>) => void;
  deleteProject: (id: EntityId) => void;
  
  // Folders
  addFolder: (name: string, parentId?: string) => void;
  updateFolder: (id: EntityId, updates: Partial<Omit<Folder, "id" | "createdAt" | "updatedAt">>) => void;
  deleteFolder: (id: EntityId) => void;
  
  // Templates
  addTemplate: (name: string, content: string, description?: string, folderId?: string) => string;
  updateTemplate: (id: EntityId, updates: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">>) => void;
  deleteTemplate: (id: EntityId) => void;
  
  // Presets
  addPreset: (name: string, templateId: EntityId, projectId: EntityId, values: Record<string, string | number | boolean>) => void;
  updatePreset: (id: EntityId, updates: Partial<Omit<Preset, "id" | "createdAt" | "updatedAt">>) => void;
  deletePreset: (id: EntityId) => void;

  // Autocomplete suggestions
  addAutocompleteSuggestion: (varKey: string, value: string) => void;
  toggleAutocompleteSuggestion: (varKey: string, id: string) => void;
  deleteAutocompleteSuggestion: (varKey: string, id: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ptshelf_projects");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ptshelf_folders");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [templates, setTemplates] = useState<Template[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ptshelf_templates");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [presets, setPresets] = useState<Preset[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ptshelf_presets");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<Record<string, AutocompleteSuggestion[]>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ptshelf_autocomplete");
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  
  const [syncUrl, setSyncUrlState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ptshelf_sync_url") || "";
    }
    return "";
  });

  const [autoSync, setAutoSyncState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ptshelf_auto_sync") === "true";
    }
    return false;
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ptshelf_last_synced");
    }
    return null;
  });

  const [syncError, setSyncError] = useState<string | null>(null);

  const skipNextSync = useRef(false);
  const isFirstRender = useRef(true);

  const triggerSyncPull = useCallback(async (): Promise<boolean> => {
    if (!syncUrl) return false;
    setSyncStatus("syncing");
    setSyncError(null);

    try {
      const response = await fetch(`/api/sync?url=${encodeURIComponent(syncUrl)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Check if data matches standard structure, if so merge or overwrite
      skipNextSync.current = true;
      if (Array.isArray(data.projects)) setProjects(data.projects);
      if (Array.isArray(data.folders)) setFolders(data.folders);
      if (Array.isArray(data.templates)) setTemplates(data.templates);
      if (Array.isArray(data.presets)) setPresets(data.presets);
      if (data.autocompleteSuggestions) setAutocompleteSuggestions(data.autocompleteSuggestions);

      const now = new Date().toISOString();
      setLastSyncedAt(now);
      setSyncStatus("success");
      if (typeof window !== "undefined") {
        localStorage.setItem("ptshelf_last_synced", now);
      }
      return true;
    } catch (e: unknown) {
      console.error("Failed to pull data from Google Drive", e);
      setSyncStatus("error");
      setSyncError(e instanceof Error ? e.message : "Failed to fetch from script");
      return false;
    }
  }, [syncUrl]);

  const triggerSyncPush = useCallback(async (overrideState?: {
    projects?: Project[];
    folders?: Folder[];
    templates?: Template[];
    presets?: Preset[];
    autocompleteSuggestions?: Record<string, AutocompleteSuggestion[]>;
  }): Promise<boolean> => {
    if (!syncUrl) return false;
    setSyncStatus("syncing");
    setSyncError(null);

    const payload = {
      projects: overrideState?.projects ?? projects,
      folders: overrideState?.folders ?? folders,
      templates: overrideState?.templates ?? templates,
      presets: overrideState?.presets ?? presets,
      autocompleteSuggestions: overrideState?.autocompleteSuggestions ?? autocompleteSuggestions,
    };

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: syncUrl,
          data: payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const resData = await response.json();

      if (resData.error) {
        throw new Error(resData.error);
      }

      const now = new Date().toISOString();
      setLastSyncedAt(now);
      setSyncStatus("success");
      if (typeof window !== "undefined") {
        localStorage.setItem("ptshelf_last_synced", now);
      }
      return true;
    } catch (e: unknown) {
      console.error("Failed to push data to Google Drive", e);
      setSyncStatus("error");
      setSyncError(e instanceof Error ? e.message : "Failed to post to script");
      return false;
    }
  }, [syncUrl, projects, folders, templates, presets, autocompleteSuggestions]);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem("ptshelf_projects", JSON.stringify(projects));
      localStorage.setItem("ptshelf_folders", JSON.stringify(folders));
      localStorage.setItem("ptshelf_templates", JSON.stringify(templates));
      localStorage.setItem("ptshelf_presets", JSON.stringify(presets));
      localStorage.setItem("ptshelf_autocomplete", JSON.stringify(autocompleteSuggestions));
    } catch (e) {
      console.error("Failed to save state to local storage", e);
    }
  }, [projects, folders, templates, presets, autocompleteSuggestions]);

  // Handle AutoSync when data changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    if (autoSync && syncUrl) {
      const timer = setTimeout(() => {
        triggerSyncPush();
      }, 1000); // Debounce sync by 1s
      return () => clearTimeout(timer);
    }
  }, [projects, folders, templates, presets, autocompleteSuggestions, autoSync, syncUrl, triggerSyncPush]);

  // Initial Pull on mount if sync is configured
  useEffect(() => {
    if (autoSync && syncUrl) {
      const timer = setTimeout(() => {
        triggerSyncPull();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [syncUrl, autoSync, triggerSyncPull]);

  const setSyncUrl = (url: string) => {
    setSyncUrlState(url);
    if (typeof window !== "undefined") {
      localStorage.setItem("ptshelf_sync_url", url);
    }
  };

  const setAutoSync = (val: boolean) => {
    setAutoSyncState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("ptshelf_auto_sync", String(val));
    }
  };

  // Helper for generating UUIDs (simple custom implementation)
  const generateId = () => {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  };

  // Projects CRUD
  const addProject = (name: string, description?: string, folderId?: string) => {
    const newProject: Project = {
      id: generateId(),
      name,
      description,
      folderId,
      templateIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = (id: EntityId, updates: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === id
          ? { ...proj, ...updates, updatedAt: new Date().toISOString() }
          : proj
      )
    );
  };

  const deleteProject = (id: EntityId) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
    setPresets((prev) => prev.filter((pres) => pres.projectId !== id));
  };

  // Folders CRUD
  const addFolder = (name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const updateFolder = (id: EntityId, updates: Partial<Omit<Folder, "id" | "createdAt" | "updatedAt">>) => {
    setFolders((prev) =>
      prev.map((fold) =>
        fold.id === id
          ? { ...fold, ...updates, updatedAt: new Date().toISOString() }
          : fold
      )
    );
  };

  const deleteFolder = (id: EntityId) => {
    // Delete folder and set all projects / subfolders parent to undefined or delete them
    setFolders((prev) => prev.filter((fold) => fold.id !== id));
    setProjects((prev) =>
      prev.map((proj) => (proj.folderId === id ? { ...proj, folderId: undefined } : proj))
    );
  };

  // Helper to extract variables in template
  const extractVariableKeys = (content: string): string[] => {
    // Matches both {{variable}} and [variable]
    const curlyRegex = /\{\{([^}]+)\}\}/g;
    const bracketRegex = /\[([^\]]+)\]/g;
    const keys = new Set<string>();
    
    let match;
    while ((match = curlyRegex.exec(content)) !== null) {
      keys.add(match[1].trim());
    }
    while ((match = bracketRegex.exec(content)) !== null) {
      keys.add(match[1].trim());
    }
    return Array.from(keys);
  };

  // Templates CRUD
  const addTemplate = (name: string, content: string, description?: string, folderId?: string) => {
    const variableKeys = extractVariableKeys(content);
    const newId = generateId();
    const newTemplate: Template = {
      id: newId,
      name,
      description,
      content,
      variableIds: variableKeys, // Store names/keys of variables
      folderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
    return newId;
  };

  const updateTemplate = (id: EntityId, updates: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">>) => {
    setTemplates((prev) =>
      prev.map((temp) => {
        if (temp.id === id) {
          const updatedContent = updates.content !== undefined ? updates.content : temp.content;
          const variableIds = updates.content !== undefined ? extractVariableKeys(updatedContent) : temp.variableIds;
          return {
            ...temp,
            ...updates,
            variableIds,
            updatedAt: new Date().toISOString(),
          };
        }
        return temp;
      })
    );
  };

  const deleteTemplate = (id: EntityId) => {
    setTemplates((prev) => prev.filter((temp) => temp.id !== id));
    setPresets((prev) => prev.filter((pres) => pres.templateId !== id));
    // Also remove from project templateIds
    setProjects((prev) =>
      prev.map((proj) =>
        proj.templateIds.includes(id)
          ? { ...proj, templateIds: proj.templateIds.filter((tid) => tid !== id) }
          : proj
      )
    );
  };

  // Presets CRUD
  const addPreset = (name: string, templateId: EntityId, projectId: EntityId, values: Record<string, string | number | boolean>) => {
    const newPreset: Preset = {
      id: generateId(),
      name,
      projectId,
      templateId,
      values,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPresets((prev) => [...prev, newPreset]);
  };

  const updatePreset = (id: EntityId, updates: Partial<Omit<Preset, "id" | "createdAt" | "updatedAt">>) => {
    setPresets((prev) =>
      prev.map((pres) =>
        pres.id === id
          ? { ...pres, ...updates, updatedAt: new Date().toISOString() }
          : pres
      )
    );
  };

  const deletePreset = (id: EntityId) => {
    setPresets((prev) => prev.filter((pres) => pres.id !== id));
  };

  // Autocomplete Suggestions CRUD
  const addAutocompleteSuggestion = (varKey: string, value: string) => {
    if (!value || !value.trim()) return;
    const cleanValue = value.trim();
    
    setAutocompleteSuggestions((prev) => {
      const currentList = prev[varKey] || [];
      // If value already exists, don't duplicate
      if (currentList.some((item) => item.value === cleanValue)) {
        return prev;
      }
      
      const newSuggestion: AutocompleteSuggestion = {
        id: generateId(),
        value: cleanValue,
        enabled: true,
      };
      
      return {
        ...prev,
        [varKey]: [...currentList, newSuggestion],
      };
    });
  };

  const toggleAutocompleteSuggestion = (varKey: string, id: string) => {
    setAutocompleteSuggestions((prev) => {
      const currentList = prev[varKey] || [];
      const updatedList = currentList.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      );
      return {
        ...prev,
        [varKey]: updatedList,
      };
    });
  };

  const deleteAutocompleteSuggestion = (varKey: string, id: string) => {
    setAutocompleteSuggestions((prev) => {
      const currentList = prev[varKey] || [];
      const updatedList = currentList.filter((item) => item.id !== id);
      return {
        ...prev,
        [varKey]: updatedList,
      };
    });
  };

  return (
    <LibraryContext.Provider
      value={{
        projects,
        folders,
        templates,
        presets,
        autocompleteSuggestions,
        syncUrl,
        autoSync,
        syncStatus,
        lastSyncedAt,
        syncError,
        setSyncUrl,
        setAutoSync,
        syncPull: triggerSyncPull,
        syncPush: triggerSyncPush,
        addProject,
        updateProject,
        deleteProject,
        addFolder,
        updateFolder,
        deleteFolder,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        addPreset,
        updatePreset,
        deletePreset,
        addAutocompleteSuggestion,
        toggleAutocompleteSuggestion,
        deleteAutocompleteSuggestion,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
}
