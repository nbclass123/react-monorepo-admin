import { useCallback } from "react";

import { useLocalStorage } from "./useLocalStorage";

export type LayoutMode = "side" | "top";

const STORAGE_KEY = "layout-mode";
const DEFAULT_LAYOUT: LayoutMode = "side";

export function useLayout() {
  const [layout, setLayout] = useLocalStorage<LayoutMode>(STORAGE_KEY, DEFAULT_LAYOUT);

  const toggleLayout = useCallback(() => {
    setLayout((prev) => (prev === "side" ? "top" : "side"));
  }, [setLayout]);

  const setLayoutMode = useCallback(
    (mode: LayoutMode) => {
      setLayout(mode);
    },
    [setLayout]
  );

  return {
    layout,
    toggleLayout,
    setLayoutMode
  };
}
