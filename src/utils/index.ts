/**
 * 安全的 localStorage 封装
 * 处理 localStorage 不可用的情况（如隐私模式），降级为内存存储
 * @returns 包含 getItem、setItem、removeItem 方法的存储对象
 */
export function safeLocalStorage(): {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
} {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return {
      getItem(key: string) {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem(key: string, value: string) {
        try {
          localStorage.setItem(key, value);
        } catch {
          // 静默失败
        }
      },
      removeItem(key: string) {
        try {
          localStorage.removeItem(key);
        } catch {
          // 静默失败
        }
      }
    };
  } catch {
    const store = new Map<string, string>();
    return {
      getItem(key: string) {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        store.set(key, value);
      },
      removeItem(key: string) {
        store.delete(key);
      }
    };
  }
}

/**
 * 格式化日期为字符串
 * @param date - 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期字符串 "YYYY-MM-DD HH:mm:ss"，无效日期返回空字符串
 */
export function formatDate(date: string | number | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
}

/**
 * 空值占位符处理
 * @param value - 需要检查的值
 * @param fallback - 当值为空时返回的默认值，默认为 "--"
 * @returns 原值或默认占位符
 */
export function placeholder(value: string | number | null | undefined, fallback = "--"): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

/**
 * 标准化错误对象为字符串
 * @param error - 错误对象或任意值
 * @returns 错误消息字符串
 */
export function normalizeError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "未知错误";
}

/**
 * CSS 类名条件拼接工具
 * @param classes - 类名字符串或 falsy 值（会被过滤）
 * @returns 拼接后的类名字符串
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
