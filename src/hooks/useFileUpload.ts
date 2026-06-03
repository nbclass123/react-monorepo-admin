/**
 * 普通文件上传 Hook
 *
 * 支持格式: pdf / doc / docx / xls / xlsx / zip / txt / mp4
 * 最大大小: 200MB
 * 自动跟踪上传进度
 */
import { useState } from "react";

import { type UploadResult, uploadFile } from "@/api/module/upload";

const ALLOWED_FILE_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip", ".txt", ".mp4"];
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

interface UseFileUploadOptions {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

interface UseFileUploadReturn {
  upload: (file: File) => Promise<UploadResult | undefined>;
  uploading: boolean;
  progress: number; // 0-100
  error: string | null;
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { onSuccess, onError } = options;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<UploadResult | undefined> => {
    // 校验文件扩展名
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
      const err = new Error(`不支持的文件格式: ${ext}，仅支持 pdf/doc/xls/zip/txt/mp4`);
      setError(err.message);
      onError?.(err);
      return;
    }

    // 校验文件大小
    if (file.size > MAX_FILE_SIZE) {
      const err = new Error(`文件大小超过 200MB 限制`);
      setError(err.message);
      onError?.(err);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadFile(file);
      setProgress(100);
      onSuccess?.(result.data);
      return result.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("文件上传失败");
      setError(error.message);
      onError?.(error);
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress, error };
}
