import { useCallback, useEffect, useRef, useState } from "react";

import type { PageVo, ResultVo } from "@/api/module/user";

/** useList Hook 配置选项 */
export interface UseListOptions<T> {
  /** 列表数据请求函数 */
  fetchFn: (params: {
    page: number;
    size: number;
    [key: string]: unknown;
  }) => Promise<ResultVo<PageVo<T>>>;
  /** 初始页码，默认 1 */
  initialPage?: number;
  /** 初始每页条数，默认 10 */
  initialSize?: number;
  /** 初始搜索参数 */
  initialSearchParams?: Record<string, unknown>;
}

/**
 * 通用列表数据管理 Hook
 * 封装分页、搜索、加载状态等常见逻辑
 *
 * 使用 requestId 序列号机制防止竞态条件：
 * 每次请求分配递增 ID，仅当响应回来时 ID 仍为最新才更新状态，
 * 解决 StrictMode 双重挂载和快速翻页导致的重复请求问题
 */
export function useList<T>(options: UseListOptions<T>) {
  const { fetchFn, initialPage = 1, initialSize = 10, initialSearchParams = {} } = options;

  const [list, setList] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>(initialSearchParams);

  // 请求序列号：每次发起新请求时递增，响应回来后比对，仅最新请求的结果生效
  const requestIdRef = useRef(0);
  // 初始挂载标记：使用 ref 而非 state 避免 StrictMode 下双重触发
  const initializedRef = useRef(false);
  // 初始参数的快照（避免 initialSearchParams 对象引用变化导致 effect 重复执行）
  const initialParamsRef = useRef(initialSearchParams);

  /** 内部数据请求方法 */
  const fetchData = useCallback(
    async (
      currentPage: number,
      currentSize: number,
      currentSearchParams: Record<string, unknown>
    ) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const result = await fetchFn({
          page: currentPage,
          size: currentSize,
          ...currentSearchParams
        });
        // 仅当本次请求仍是最新时更新状态（防止 StrictMode 双调用 / 快速翻页覆盖）
        if (requestId !== requestIdRef.current) return;
        setList(result.data.list);
        setTotal(result.data.total);
        setPage(result.data.page);
        setSize(result.data.size);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchFn]
  );

  /** 刷新当前列表数据 */
  const refresh = useCallback(async () => {
    await fetchData(page, size, searchParams);
  }, [fetchData, page, size, searchParams]);

  /** 搜索，重置页码为 1 */
  const search = useCallback(
    async (params: Record<string, unknown>) => {
      setSearchParams(params);
      await fetchData(1, size, params);
    },
    [fetchData, size]
  );

  /** 重置搜索参数和分页 */
  const reset = useCallback(async () => {
    const initialParams = initialParamsRef.current;
    setSearchParams(initialParams);
    await fetchData(initialPage, initialSize, initialParams);
  }, [fetchData, initialPage, initialSize]);

  /** 处理分页变更 */
  const handlePageChange = useCallback(
    async (newPage: number, newSize: number) => {
      await fetchData(newPage, newSize, searchParams);
    },
    [fetchData, searchParams]
  );

  /** 组件挂载时请求初始数据（ref guard 确保只执行一次） */
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchData(initialPage, initialSize, initialParamsRef.current);
  }, [fetchData, initialPage, initialSize]);

  return {
    list,
    loading,
    page,
    size,
    total,
    searchParams,
    refresh,
    search,
    reset,
    handlePageChange
  };
}
