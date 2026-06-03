/**
 * 图片上传 Hook
 *
 * 支持格式: jpg / png / gif / webp
 * 最大大小: 20MB
 * 自动跟踪上传进度
 */
import { useState } from "react";

import { type UploadResult, uploadImage } from "@/api/module/upload";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

interface UseImageUploadOptions {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

interface UseImageUploadReturn {
  upload: (file: File) => Promise<UploadResult | undefined>;
  uploading: boolean;
  progress: number; // 0-100
  error: string | null;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { onSuccess, onError } = options;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<UploadResult | undefined> => {
    // 校验文件类型
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const err = new Error(`不支持的图片格式: ${file.type}，仅支持 jpg/png/gif/webp`);
      setError(err.message);
      onError?.(err);
      return;
    }

    // 校验文件大小
    if (file.size > MAX_IMAGE_SIZE) {
      const err = new Error(`图片大小超过 20MB 限制`);
      setError(err.message);
      onError?.(err);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadImage(file);
      setProgress(100);
      onSuccess?.(result.data);
      return result.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("图片上传失败");
      setError(error.message);
      onError?.(error);
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress, error };
}
