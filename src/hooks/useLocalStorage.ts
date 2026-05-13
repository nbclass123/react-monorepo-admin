import { useState, useCallback } from "react";
import { safeLocalStorage } from "@/utils";

const storage = safeLocalStorage();

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = storage.getItem(key);
    if (item === null) return initialValue;
    try {
      return JSON.parse(item) as T;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        try {
          storage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // 静默失败
        }
        return nextValue;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
