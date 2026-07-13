import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PredictionResult, User } from "../types";

interface ScanDraftState {
  imageDataUrl: string | null;
  imageName: string | null;
  rotation: number;
  zoom: number;
  cropHint: string;
}

interface AppState {
  theme: "light" | "dark";
  language: "en" | "hi" | "hinglish";
  user: User | null;
  lastPrediction: PredictionResult | null;
  assistantContext: PredictionResult | null;
  scanDraft: ScanDraftState;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setLanguage: (language: "en" | "hi" | "hinglish") => void;
  setUser: (user: User | null) => void;
  setLastPrediction: (prediction: PredictionResult | null) => void;
  setAssistantContext: (prediction: PredictionResult | null) => void;
  setScanDraft: (draft: Partial<ScanDraftState>) => void;
  clearScanDraft: () => void;
}

const persistedTheme = (localStorage.getItem("leafsense-theme") as "light" | "dark" | null) ?? "dark";
const persistedLanguage = (localStorage.getItem("leafsense-language") as "en" | "hi" | "hinglish" | null) ?? "en";

const defaultScanDraft: ScanDraftState = {
  imageDataUrl: null,
  imageName: null,
  rotation: 0,
  zoom: 1,
  cropHint: "auto",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: persistedTheme,
      language: persistedLanguage,
      user: null,
      lastPrediction: null,
      assistantContext: null,
      scanDraft: defaultScanDraft,
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
          scanDraft: {
            ...state.scanDraft,
            ...draft,
          },
        })),
      clearScanDraft: () => set({ scanDraft: defaultScanDraft }),
    }),
    {
      name: "leafsense-scan-draft",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ scanDraft: state.scanDraft }),
    },
  ),
);

document.documentElement.classList.toggle("dark", persistedTheme === "dark");
