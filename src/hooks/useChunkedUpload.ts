/**
 * 大文件分片上传 Hook — 支持断点续传、暂停/恢复、并发控制
 *
 * 核心流程:
 * 1. spark-md5 增量计算文件 MD5（分块读取，避免 UI 冻结）
 * 2. POST /upload/chunk/init — 检查秒传或获取续传任务
 * 3. 跳过已上传分片，并发上传剩余分片（默认并发 3）
 * 4. POST /upload/chunk/merge — 合并所有分片为最终文件
 *
 * 暂停/恢复:
 * - pause() 设置 Ref 标志 → 上传循环在下一轮检查时停止
 * - resume() 查询服务端进度 → 继续上传未完成分片
 */
import SparkMD5 from "spark-md5";
import { useCallback, useRef, useState } from "react";

import {
  type UploadResult,
  getChunkProgress,
  initChunkUpload,
  mergeChunks,
  uploadChunk
} from "@/api/module/upload";

type ChunkStatus = "pending" | "uploading" | "done" | "skipped";
type UploadStage = "idle" | "md5" | "uploading" | "merging" | "done" | "paused";

interface UseChunkedUploadOptions {
  /** 分片大小，默认 5MB（需与后端 CHUNK_SIZE 一致） */
  chunkSize?: number;
  /** 并发上传数，默认 3 */
  concurrent?: number;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  onProgress?: (pct: number) => void;
  onMd5Progress?: (pct: number) => void;
}

interface UseChunkedUploadReturn {
  upload: (file: File) => Promise<UploadResult | undefined>;
  pause: () => void;
  resume: () => void;
  uploading: boolean;
  paused: boolean;
  progress: number; // 0-100
  chunkStatusMap: Map<number, ChunkStatus>;
  stage: UploadStage;
  error: string | null;
}

export function useChunkedUpload(options: UseChunkedUploadOptions = {}): UseChunkedUploadReturn {
  const {
    chunkSize = 5 * 1024 * 1024,
    concurrent = 3,
    onSuccess,
    onError,
    onProgress,
    onMd5Progress
  } = options;

  const [uploading, setUploading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chunkStatusMap, setChunkStatusMap] = useState<Map<number, ChunkStatus>>(new Map());
  const [stage, setStage] = useState<UploadStage>("idle");
  const [error, setError] = useState<string | null>(null);

  // Ref 避免闭包陈旧问题，确保暂停/恢复标志在异步回调中读取最新值
  const pausedRef = useRef(false);
  const fileRef = useRef<File | null>(null);
  const uploadIdRef = useRef("");
  const totalChunksRef = useRef(0);
  const completedRef = useRef(0);

  /** 增量计算文件 MD5，分块读取避免 UI 冻结 */
  const computeMD5 = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const spark = new SparkMD5.ArrayBuffer();
        const reader = new FileReader();
        const totalChunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;

        reader.onload = (e) => {
          spark.append(e.target!.result as ArrayBuffer);
          currentChunk++;
          onMd5Progress?.(Math.round((currentChunk / totalChunks) * 100));

          if (currentChunk < totalChunks) {
            loadNext();
          } else {
            resolve(spark.end());
          }
        };

        const loadNext = () => {
          const start = currentChunk * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          reader.readAsArrayBuffer(file.slice(start, end));
        };

        loadNext();
      });
    },
    [chunkSize, onMd5Progress]
  );

  /** 获取指定分片的 Blob */
  const getChunkBlob = (chunkIndex: number): Blob => {
    const file = fileRef.current!;
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    return file.slice(start, end);
  };

  /** 标记单个分片状态 */
  const markChunk = (chunkIndex: number, status: ChunkStatus) => {
    setChunkStatusMap((prev) => {
      const next = new Map(prev);
      next.set(chunkIndex, status);
      return next;
    });
  };

  /** 更新进度百分比 */
  const updateProgress = (completed: number, total: number) => {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    setProgress(pct);
    onProgress?.(pct);
  };

  /** 并发上传待处理的分片列表 */
  const uploadPendingChunks = useCallback(
    async (pendingIndices: number[]): Promise<boolean> => {
      const total = totalChunksRef.current;
      let idx = 0;

      while (idx < pendingIndices.length) {
        if (pausedRef.current) return false;

        const batch = pendingIndices.slice(idx, idx + concurrent);

        const results = await Promise.all(
          batch.map(async (chunkIdx) => {
            if (pausedRef.current) return false;
            markChunk(chunkIdx, "uploading");
            try {
              await uploadChunk({
                uploadId: uploadIdRef.current,
                chunkIndex: chunkIdx,
                file: getChunkBlob(chunkIdx)
              });
              completedRef.current++;
              markChunk(chunkIdx, "done");
              updateProgress(completedRef.current, total);
              return true;
            } catch {
              markChunk(chunkIdx, "pending");
              return false;
            }
          })
        );

        // 重试失败的分片（仅非暂停状态）
        const failed = batch.filter((_, i) => !results[i]);
        for (const chunkIdx of failed) {
          if (pausedRef.current) return false;
          markChunk(chunkIdx, "uploading");
          try {
            await uploadChunk({
              uploadId: uploadIdRef.current,
              chunkIndex: chunkIdx,
              file: getChunkBlob(chunkIdx)
            });
            completedRef.current++;
            markChunk(chunkIdx, "done");
            updateProgress(completedRef.current, total);
          } catch {
            return false; // 重试仍失败则中止
          }
        }

        idx += concurrent;
      }

      return true;
    },
    [chunkSize, concurrent, onProgress]
  );

  /** 暂停上传 */
  const pause = useCallback(() => {
    pausedRef.current = true;
    setPaused(true);
    setStage("paused");
  }, []);

  /** 恢复上传：查询服务端进度后继续上传未完成分片 */
  const resume = useCallback(async () => {
    if (!uploadIdRef.current || !fileRef.current) return;

    pausedRef.current = false;
    setPaused(false);
    setStage("uploading");

    try {
      // 查询已上传分片进度
      const progressRes = await getChunkProgress(uploadIdRef.current);
      const completed = progressRes.data.completedChunks;
      completedRef.current = completed;

      // 标记已上传分片为 skipped
      for (let i = 0; i < completed; i++) {
        markChunk(i, "skipped");
      }

      const pending: number[] = [];
      for (let i = completed; i < totalChunksRef.current; i++) {
        pending.push(i);
      }

      if (pending.length === 0) {
        await doMerge();
        return;
      }

      const ok = await uploadPendingChunks(pending);
      if (ok && !pausedRef.current) {
        await doMerge();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("恢复上传失败");
      setError(error.message);
      onError?.(error);
    }
  }, [uploadPendingChunks, onError]);

  /** 合并所有分片 */
  const doMerge = useCallback(async (): Promise<UploadResult | undefined> => {
    setStage("merging");
    try {
      const result = await mergeChunks(uploadIdRef.current);
      setStage("done");
      updateProgress(totalChunksRef.current, totalChunksRef.current);
      onSuccess?.(result.data);
      return result.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("分片合并失败");
      setError(error.message);
      onError?.(error);
    } finally {
      setUploading(false);
    }
  }, [onSuccess, onError, onProgress]);

  /** 主入口：上传文件 */
  const upload = useCallback(
    async (file: File): Promise<UploadResult | undefined> => {
      // 重置状态
      setUploading(true);
      pausedRef.current = false;
      setPaused(false);
      setProgress(0);
      setError(null);
      fileRef.current = file;
      completedRef.current = 0;

      try {
        // Step 1: 计算 MD5
        setStage("md5");
        const md5 = await computeMD5(file);

        // Step 2: 初始化上传（秒传检测 + 断点续传）
        setStage("uploading");
        const initResult = await initChunkUpload({
          filename: file.name,
          fileSize: file.size,
          md5
        });

        const { uploadId, totalChunks, uploadedChunks } = initResult.data;
        uploadIdRef.current = uploadId;
        totalChunksRef.current = totalChunks;
        completedRef.current = uploadedChunks.length;

        // 初始化分片状态
        setChunkStatusMap(() => {
          const map = new Map<number, ChunkStatus>();
          for (let i = 0; i < totalChunks; i++) {
            map.set(i, uploadedChunks.includes(i) ? "skipped" : "pending");
          }
          return map;
        });

        updateProgress(uploadedChunks.length, totalChunks);

        // Step 3: 收集待上传分片
        const pending: number[] = [];
        for (let i = 0; i < totalChunks; i++) {
          if (!uploadedChunks.includes(i)) {
            pending.push(i);
          }
        }

        // Step 4: 上传分片（如有）或直接合并
        if (pending.length > 0) {
          const ok = await uploadPendingChunks(pending);
          if (!ok || pausedRef.current) return;
        }

        return await doMerge();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("上传失败");
        setError(error.message);
        onError?.(error);
        setUploading(false);
      }
    },
    [chunkSize, computeMD5, uploadPendingChunks, doMerge, onError]
  );

  return {
    upload,
    pause,
    resume,
    uploading,
    paused,
    progress,
    chunkStatusMap,
    stage,
    error
  };
}
