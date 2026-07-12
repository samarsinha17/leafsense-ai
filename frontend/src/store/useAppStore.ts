import { create } from "zustand";
import type { PredictionResult, User } from "../types";

interface AppState {
  theme: "light" | "dark";
  language: "en" | "hi" | "hinglish";
  user: User | null;
  lastPrediction: PredictionResult | null;
  assistantContext: PredictionResult | null;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setLanguage: (language: "en" | "hi" | "hinglish") => void;
  setUser: (user: User | null) => void;
  setLastPrediction: (prediction: PredictionResult | null) => void;
  setAssistantContext: (prediction: PredictionResult | null) => void;
}

const persistedTheme = (localStorage.getItem("leafsense-theme") as "light" | "dark" | null) ?? "dark";
const persistedLanguage = (localStorage.getItem("leafsense-language") as "en" | "hi" | "hinglish" | null) ?? "en";

export const useAppStore = create<AppState>((set, get) => ({
  theme: persistedTheme,
  language: persistedLanguage,
  user: null,
  lastPrediction: null,
  assistantContext: null,
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
}));

document.documentElement.classList.toggle("dark", persistedTheme === "dark");
