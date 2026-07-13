import { create } from "zustand";
import type { PredictionResult, User } from "../types";

interface AppState {
  theme: "light" | "dark";
  language: "en" | "hi" | "hinglish";
  user: User | null;
  lastPrediction: PredictionResult | null;
  assistantContext: PredictionResult | null;
  scanDraftFile: File | null;
  scanDraftPreviewUrl: string | null;
  scanDraftRotation: number;
  scanDraftZoom: number;
  scanDraftCropHint: string;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setLanguage: (language: "en" | "hi" | "hinglish") => void;
  setUser: (user: User | null) => void;
  setLastPrediction: (prediction: PredictionResult | null) => void;
  setAssistantContext: (prediction: PredictionResult | null) => void;
  setScanDraft: (draft: {
    file?: File | null;
    previewUrl?: string | null;
    rotation?: number;
    zoom?: number;
    cropHint?: string;
  }) => void;
  clearScanDraft: () => void;
}

const persistedTheme = (localStorage.getItem("leafsense-theme") as "light" | "dark" | null) ?? "dark";
const persistedLanguage = (localStorage.getItem("leafsense-language") as "en" | "hi" | "hinglish" | null) ?? "en";

export const useAppStore = create<AppState>((set, get) => ({
  theme: persistedTheme,
  language: persistedLanguage,
  user: null,
  lastPrediction: null,
  assistantContext: null,
  scanDraftFile: null,
  scanDraftPreviewUrl: null,
  scanDraftRotation: 0,
  scanDraftZoom: 1,
  scanDraftCropHint: "auto",
  setTheme: (theme) => {
    localStorage.setItem("leafsense-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("leafsense-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    set({ theme: next });
  },
  setLanguage: (language) => {
    localStorage.setItem("leafsense-language", language);
    set({ language });
  },
  setUser: (user) => set({ user }),
  setLastPrediction: (prediction) => set({ lastPrediction: prediction }),
  setAssistantContext: (prediction) => set({ assistantContext: prediction }),
  setScanDraft: (draft) =>
    set((state) => ({
      scanDraftFile: draft.file ?? state.scanDraftFile,
      scanDraftPreviewUrl: draft.previewUrl ?? state.scanDraftPreviewUrl,
      scanDraftRotation: draft.rotation ?? state.scanDraftRotation,
      scanDraftZoom: draft.zoom ?? state.scanDraftZoom,
      scanDraftCropHint: draft.cropHint ?? state.scanDraftCropHint,
    })),
  clearScanDraft: () =>
    set({
      scanDraftFile: null,
      scanDraftPreviewUrl: null,
      scanDraftRotation: 0,
      scanDraftZoom: 1,
      scanDraftCropHint: "auto",
    }),
}));

document.documentElement.classList.toggle("dark", persistedTheme === "dark");
