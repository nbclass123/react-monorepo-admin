import { useCallback, useState } from "react";

import { safeLocalStorage } from "@/utils";

const storage = safeLocalStorage();

/**
 * 持久化本地存储 Hook
 * 将状态同步保存到 localStorage
 * @param key - localStorage 的键名
 * @param initialValue - 初始值
 * @returns [存储的值, 设置值的函数]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
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

  /**
   * 设置存储值
   * @param value - 新值或更新函数
   */
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
    [key]
  );

  return [storedValue, setValue];
}
