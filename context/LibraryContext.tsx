"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Folder, Template, Preset, EntityId, AutocompleteSuggestion } from "@/types";

export type SyncStatus = "idle" | "syncing" | "success" | "error";

interface LibraryState {
  folders: Folder[];
  templates: Template[];
  presets: Preset[];
  autocompleteSuggestions: Record<string, AutocompleteSuggestion[]>;
  googleClientId: string;
  googleAccessToken: string | null;
  googleUser: { name: string; email: string; picture: string } | null;
  autoSync: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncError: string | null;
}

interface LibraryContextType extends LibraryState {
  setAutoSync: (val: boolean) => void;
  loginGoogle: () => void;
  logoutGoogle: () => void;
  syncPull: () => Promise<boolean>;
  syncPush: () => Promise<boolean>;
  
  // Folders
  addFolder: (name: string, parentId?: string) => void;
  updateFolder: (id: EntityId, updates: Partial<Omit<Folder, "id" | "createdAt" | "updatedAt">>) => void;
  deleteFolder: (id: EntityId) => void;
  
  // Templates
  addTemplate: (name: string, content: string, description?: string, folderId?: string) => string;
  updateTemplate: (id: EntityId, updates: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">>) => void;
  deleteTemplate: (id: EntityId) => void;
  
  // Presets
  addPreset: (name: string, templateId: EntityId, values: Record<string, string | number | boolean>) => void;
  updatePreset: (id: EntityId, updates: Partial<Omit<Preset, "id" | "createdAt" | "updatedAt">>) => void;
  deletePreset: (id: EntityId) => void;

  // Autocomplete suggestions
  addAutocompleteSuggestion: (varKey: string, value: string) => void;
  toggleAutocompleteSuggestion: (varKey: string, id: string) => void;
  deleteAutocompleteSuggestion: (varKey: string, id: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
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
  
  const DEFAULT_CLIENT_ID = "319680135736-oajt7pt4bp4cjrsimje33qtia2hf510e.apps.googleusercontent.com";

  const [googleClientId] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;
  });

  const [googleAccessToken, setGoogleAccessTokenState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("ptshelf_google_token") || null;
    }
    return null;
  });

  const [googleUser, setGoogleUser] = useState<{ name: string; email: string; picture: string } | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ptshelf_google_user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
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

  // Load Google Client library
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("google-gsi-client")) return;
    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleTokenExpiration = useCallback(() => {
    setGoogleAccessTokenState(null);
    setGoogleUser(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ptshelf_google_token");
      localStorage.removeItem("ptshelf_google_user");
    }
  }, []);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userInfo = await response.json();
        const user = {
          name: userInfo.name || "",
          email: userInfo.email || "",
          picture: userInfo.picture || "",
        };
        setGoogleUser(user);
        if (typeof window !== "undefined") {
          localStorage.setItem("ptshelf_google_user", JSON.stringify(user));
        }
      }
    } catch (err) {
      console.error("Failed to fetch user info", err);
    }
  };

  const loginGoogle = () => {
    if (typeof window === "undefined" || !googleClientId) {
      setSyncStatus("error");
      setSyncError("Veuillez renseigner un Client ID Google valide.");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (!google) {
      setSyncStatus("error");
      setSyncError("Le service d'authentification Google n'est pas chargé. Réessayez.");
      return;
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            const token = tokenResponse.access_token;
            setGoogleAccessTokenState(token);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("ptshelf_google_token", token);
            }
            await fetchUserInfo(token);
            setSyncStatus("success");
            setSyncError(null);
          } else {
            setSyncStatus("error");
            setSyncError("Échec de récupération du jeton d'accès Google.");
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error_callback: (err: any) => {
          console.error("GSI Error:", err);
          setSyncStatus("error");
          setSyncError(err.message || "Erreur de connexion Google.");
        }
      });
      client.requestAccessToken();
    } catch (e: unknown) {
      console.error(e);
      setSyncStatus("error");
      const errMsg = e instanceof Error ? e.message : String(e);
      setSyncError(errMsg || "Erreur d'initialisation de l'authentification.");
    }
  };

  const logoutGoogle = () => {
    handleTokenExpiration();
    setSyncStatus("idle");
    setSyncError(null);
  };

  const triggerSyncPull = useCallback(async (): Promise<boolean> => {
    if (!googleUser || !googleUser.email) {
      setSyncStatus("error");
      setSyncError("Connectez-vous d'abord à votre compte Google.");
      return false;
    }
    if (!googleAccessToken) {
      setSyncStatus("error");
      setSyncError("Jeton d'accès Google manquant. Veuillez vous reconnecter.");
      return false;
    }
    setSyncStatus("syncing");
    setSyncError(null);

    try {
      const response = await fetch(`/api/sync?email=${encodeURIComponent(googleUser.email)}`, {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      });

      if (!response.ok) {
        let serverError = "";
        try {
          const errBody = await response.json();
          serverError = errBody.error || "";
        } catch {
          // Ignore parsing error
        }

        if (response.status === 401) {
          throw new Error(serverError || "Votre session Google a expiré ou l'accès est refusé. Veuillez vous reconnecter.");
        }

        throw new Error(serverError || `Erreur lors du chargement (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      skipNextSync.current = true;
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
      console.error("Failed to pull data from central Drive", e);
      setSyncStatus("error");
      setSyncError(e instanceof Error ? e.message : "Erreur de téléchargement");
      return false;
    }
  }, [googleUser, googleAccessToken]);

  const triggerSyncPush = useCallback(async (overrideState?: {
    folders?: Folder[];
    templates?: Template[];
    presets?: Preset[];
    autocompleteSuggestions?: Record<string, AutocompleteSuggestion[]>;
  }): Promise<boolean> => {
    if (!googleUser || !googleUser.email) {
      setSyncStatus("error");
      setSyncError("Connectez-vous d'abord à votre compte Google.");
      return false;
    }
    if (!googleAccessToken) {
      setSyncStatus("error");
      setSyncError("Jeton d'accès Google manquant. Veuillez vous reconnecter.");
      return false;
    }
    setSyncStatus("syncing");
    setSyncError(null);

    const payload = {
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
          Authorization: `Bearer ${googleAccessToken}`,
        },
        body: JSON.stringify({
          email: googleUser.email,
          data: payload,
        }),
      });

      if (!response.ok) {
        let serverError = "";
        try {
          const errBody = await response.json();
          serverError = errBody.error || "";
        } catch {
          // Ignore parsing error
        }

        if (response.status === 401) {
          throw new Error(serverError || "Votre session Google a expiré ou l'accès est refusé. Veuillez vous reconnecter.");
        }

        throw new Error(serverError || `Erreur lors de la sauvegarde (HTTP ${response.status})`);
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
      console.error("Failed to push data to central Drive", e);
      setSyncStatus("error");
      setSyncError(e instanceof Error ? e.message : "Erreur de sauvegarde");
      return false;
    }
  }, [googleUser, googleAccessToken, folders, templates, presets, autocompleteSuggestions]);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem("ptshelf_folders", JSON.stringify(folders));
      localStorage.setItem("ptshelf_templates", JSON.stringify(templates));
      localStorage.setItem("ptshelf_presets", JSON.stringify(presets));
      localStorage.setItem("ptshelf_autocomplete", JSON.stringify(autocompleteSuggestions));
    } catch (e) {
      console.error("Failed to save state to local storage", e);
    }
  }, [folders, templates, presets, autocompleteSuggestions]);

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

    if (autoSync && googleAccessToken) {
      const timer = setTimeout(() => {
        triggerSyncPush();
      }, 1000); // Debounce sync by 1s
      return () => clearTimeout(timer);
    }
  }, [folders, templates, presets, autocompleteSuggestions, autoSync, googleAccessToken, triggerSyncPush]);

  // Initial Pull on mount if sync is configured
  useEffect(() => {
    if (autoSync && googleAccessToken) {
      const timer = setTimeout(() => {
        triggerSyncPull();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [googleAccessToken, autoSync, triggerSyncPull]);



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
    setFolders((prev) => prev.filter((fold) => fold.id !== id));
    setTemplates((prev) =>
      prev.map((temp) => (temp.folderId === id ? { ...temp, folderId: undefined } : temp))
    );
  };

  // Helper to extract variables in template
  const extractVariableKeys = (content: string): string[] => {
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
      variableIds: variableKeys,
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
  };

  // Presets CRUD
  const addPreset = (name: string, templateId: EntityId, values: Record<string, string | number | boolean>) => {
    const newPreset: Preset = {
      id: generateId(),
      name,
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
        folders,
        templates,
        presets,
        autocompleteSuggestions,
        googleClientId,
        googleAccessToken,
        googleUser,
        autoSync,
        syncStatus,
        lastSyncedAt,
        syncError,
        setAutoSync,
        loginGoogle,
        logoutGoogle,
        syncPull: triggerSyncPull,
        syncPush: triggerSyncPush,
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
