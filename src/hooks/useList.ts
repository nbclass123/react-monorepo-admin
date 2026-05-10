import { useState, useEffect, useCallback, useRef } from "react";
import type { ResultVo, PageVo } from "@/api/module/user";

export interface UseListOptions<T> {
  fetchFn: (params: {
    page: number;
    size: number;
    [key: string]: any;
  }) => Promise<ResultVo<PageVo<T>>>;
  initialPage?: number;
  initialSize?: number;
  initialSearchParams?: Record<string, any>;
}

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
    useState<Record<string, any>>(initialSearchParams);
  const initialSearchParamsRef = useRef(initialSearchParams);
  const isMountedRef = useRef(false);

  const fetchData = useCallback(
    async (
      currentPage: number,
      currentSize: number,
      currentSearchParams: Record<string, any>,
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

  const refresh = useCallback(async () => {
    await fetchData(page, size, searchParams);
  }, [fetchData, page, size, searchParams]);

  const search = useCallback(
    async (params: Record<string, any>) => {
      setSearchParams(params);
      await fetchData(1, size, params);
    },
    [fetchData, size],
  );

  const reset = useCallback(async () => {
    const initialParams = initialSearchParamsRef.current;
    setSearchParams(initialParams);
    await fetchData(initialPage, initialSize, initialParams);
  }, [fetchData, initialPage, initialSize]);

  const handlePageChange = useCallback(
    async (newPage: number, newSize: number) => {
      await fetchData(newPage, newSize, searchParams);
    },
    [fetchData, searchParams],
  );

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
