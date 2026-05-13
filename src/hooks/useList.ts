import { useState, useEffect, useCallback, useRef } from "react";
import type { ResultVo, PageVo } from "@/api/module/user";

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
 */
export function useList<T>(options: UseListOptions<T>) {
  const {
    fetchFn,
    initialPage = 1,
    initialSize = 10,
    initialSearchParams = {},
  } = options;

  const [list, setList] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] =
    useState<Record<string, unknown>>(initialSearchParams);
  const initialSearchParamsRef = useRef(initialSearchParams);
  const isMountedRef = useRef(false);

  /** 内部数据请求方法 */
  const fetchData = useCallback(
    async (
      currentPage: number,
      currentSize: number,
      currentSearchParams: Record<string, unknown>,
    ) => {
      setLoading(true);
      try {
        const result = await fetchFn({
          page: currentPage,
          size: currentSize,
          ...currentSearchParams,
        });
        setList(result.data.list);
        setTotal(result.data.total);
        setPage(result.data.page);
        setSize(result.data.size);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn],
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
    [fetchData, size],
  );

  /** 重置搜索参数和分页 */
  const reset = useCallback(async () => {
    const initialParams = initialSearchParamsRef.current;
    setSearchParams(initialParams);
    await fetchData(initialPage, initialSize, initialParams);
  }, [fetchData, initialPage, initialSize]);

  /** 处理分页变更 */
  const handlePageChange = useCallback(
    async (newPage: number, newSize: number) => {
      await fetchData(newPage, newSize, searchParams);
    },
    [fetchData, searchParams],
  );

  /** 组件挂载时请求初始数据 */
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      const params = initialSearchParamsRef.current;
      fetchData(initialPage, initialSize, params);
    }
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
    handlePageChange,
  };
}
