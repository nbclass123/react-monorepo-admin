/**
 * 上传 API 模块
 *
 * 后端服务: hy-upload (NestJS + multer)
 * 端点前缀: /upload
 *
 * 支持的接口:
 * - POST /upload/image     — 图片上传 (jpg/png/gif/webp, 最大20MB)
 * - POST /upload/file      — 普通文件上传 (pdf/doc/xls/zip/txt/mp4, 最大200MB)
 * - POST /upload/chunk/init    — 初始化分片上传 (MD5 秒传 / 断点续传)
 * - POST /upload/chunk         — 上传单个分片
 * - POST /upload/chunk/merge   — 合并分片
 * - GET  /upload/chunk/progress — 查询分片上传进度
 */
import { get, post } from "../index";

// ==================== 响应类型 ====================

/** 通用响应包裹 */
export interface ResultVo<T> {
  code: number;
  msg: string;
  data: T;
}

/** 上传成功结果 */
export interface UploadResult {
  url: string;
  filename: string;
}

/** 分片初始化结果 */
export interface ChunkInitResult {
  uploadId: string;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
}

/** 分片上传进度 */
export interface ChunkProgressResult {
  uploadId: string;
  totalChunks: number;
  completedChunks: number;
  progress: number; // 0-100
}

// ==================== API 方法 ====================

/** 图片上传 (multipart/form-data) */
export async function uploadImage(file: File): Promise<ResultVo<UploadResult>> {
  const formData = new FormData();
  formData.append("file", file);
  return post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
}

/** 普通文件上传 (multipart/form-data) */
export async function uploadFile(file: File): Promise<ResultVo<UploadResult>> {
  const formData = new FormData();
  formData.append("file", file);
  return post("/upload/file", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
}

/** 初始化分片上传：检查秒传/续传，或创建新任务 */
export async function initChunkUpload(params: {
  filename: string;
  fileSize: number;
  md5: string;
}): Promise<ResultVo<ChunkInitResult>> {
  return post("/upload/chunk/init", params as unknown as Record<string, unknown>);
}

/** 上传单个分片 (multipart/form-data) */
export async function uploadChunk(params: {
  uploadId: string;
  chunkIndex: number;
  file: Blob;
  chunkMd5?: string;
}): Promise<ResultVo<{ uploadId: string; chunkIndex: number }>> {
  const formData = new FormData();
  formData.append("file", params.file);
  return post(
    `/upload/chunk?uploadId=${params.uploadId}&chunkIndex=${params.chunkIndex}${params.chunkMd5 ? `&chunkMd5=${params.chunkMd5}` : ""}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
}

/** 合并所有分片为最终文件 */
export async function mergeChunks(uploadId: string): Promise<ResultVo<UploadResult>> {
  return post("/upload/chunk/merge", { uploadId });
}

/** 查询分片上传进度 */
export async function getChunkProgress(uploadId: string): Promise<ResultVo<ChunkProgressResult>> {
  return get("/upload/chunk/progress", { uploadId });
}
