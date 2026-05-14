import { useCallback, useState } from "react";

/**
 * 布尔状态管理 Hook
 * 提供便捷的布尔值操作方法
 * @param initialValue - 初始值，默认为 false
 * @returns 包含 value、setTrue、setFalse、toggle、setValue 的对象
 */
export function useBoolean(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  /** 设置为 true */
  const setTrue = useCallback(() => setValue(true), []);
  /** 设置为 false */
  const setFalse = useCallback(() => setValue(false), []);
  /** 切换布尔值 */
  const toggle = useCallback(() => setValue((v) => !v), []);

  return { value, setTrue, setFalse, toggle, setValue };
}
