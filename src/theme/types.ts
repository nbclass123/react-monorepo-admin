export type AppThemeMode = "light" | "dark";

export type PresetColor = "vercel" | "blue" | "green" | "purple";

export interface ThemeState {
  mode: AppThemeMode;
  primaryColor: string;
  preset: PresetColor | null;
}

export const presetColorMap: Record<PresetColor, string> = {
  vercel: "#0070F3",
  blue: "#1677FF",
  green: "#52C41A",
  purple: "#722ED1"
};

export type ThemeAction =
  | { type: "TOGGLE_MODE" }
  | { type: "SET_MODE"; payload: AppThemeMode }
  | { type: "SET_PRESET"; payload: PresetColor | null }
  | { type: "SET_PRIMARY_COLOR"; payload: string };

export const defaultThemeState: ThemeState = {
  mode: "light",
  primaryColor: presetColorMap.blue,
  preset: "blue"
};

export function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case "TOGGLE_MODE":
      return { ...state, mode: state.mode === "light" ? "dark" : "light" };
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_PRESET":
      return {
        ...state,
        preset: action.payload,
        primaryColor: action.payload ? presetColorMap[action.payload] : state.primaryColor
      };
    case "SET_PRIMARY_COLOR":
      return { ...state, primaryColor: action.payload, preset: null };
    default:
      return state;
  }
}
