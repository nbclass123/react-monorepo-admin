import { createContext, useContext } from "react";
import type { AppThemeMode, PresetColor } from "./types";

export interface ThemeContextType {
  mode: AppThemeMode;
  primaryColor: string;
  preset: PresetColor | null;
  toggleMode: () => void;
  setPreset: (preset: PresetColor | null) => void;
  setPrimaryColor: (color: string) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
