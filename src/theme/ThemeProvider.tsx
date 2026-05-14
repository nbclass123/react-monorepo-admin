import { ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { type ReactNode, useCallback, useEffect, useReducer } from "react";

import { useLocalStorage } from "@/hooks/useLocalStorage";

import { type PresetColor, type ThemeState, defaultThemeState, themeReducer } from "./types";
import { ThemeContext, type ThemeContextType } from "./useTheme";

const { darkAlgorithm, defaultAlgorithm } = theme;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [persistedTheme, setPersistedTheme] = useLocalStorage<ThemeState>(
    "app-theme",
    defaultThemeState
  );
  const [state, dispatch] = useReducer(themeReducer, persistedTheme);

  useEffect(() => {
    setPersistedTheme(state);
  }, [state, setPersistedTheme]);

  useEffect(() => {
    document.body.setAttribute("data-theme-mode", state.mode);
  }, [state.mode]);

  const toggleMode = useCallback(() => {
    dispatch({ type: "TOGGLE_MODE" });
  }, []);

  const setPreset = useCallback((preset: PresetColor | null) => {
    dispatch({ type: "SET_PRESET", payload: preset });
  }, []);

  const setPrimaryColor = useCallback((color: string) => {
    dispatch({ type: "SET_PRIMARY_COLOR", payload: color });
  }, []);

  const contextValue: ThemeContextType = {
    mode: state.mode,
    primaryColor: state.primaryColor,
    preset: state.preset,
    toggleMode,
    setPreset,
    setPrimaryColor
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: state.mode === "dark" ? darkAlgorithm : defaultAlgorithm,
          token: {
            colorPrimary: state.primaryColor
          }
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
