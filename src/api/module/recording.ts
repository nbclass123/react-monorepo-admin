import instance, { get, post } from "@/api/index";
import type { ResultVo } from "./user";

// ======================= 请求类型 =======================

export interface StartRecordingReq {
  targetUrl: string;
  duration: number;
  quality: "low" | "medium" | "high";
  fps: number;
}

export interface RecordingEventsReq {
  taskId: string;
  batchIndex: number;
  events: Record<string, unknown>[];
}

export interface StopRecordingReq {
  taskId: string;
}

// ======================= 响应类型 =======================

/** 列表返回的任务信息（精简） */
export interface RecordingTaskVo {
  taskId: string;
  status: "RECORDING" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  targetUrl: string;
  eventCount: number;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** getTaskStatus 返回的任务详情（含 errorMessage） */
export interface RecordingTaskDetailVo extends RecordingTaskVo {
  errorMessage: string | null;
}

export interface StartRecordingVo {
  taskId: string;
}

export interface ReceiveEventsVo {
  received: number;
}

export interface StopRecordingVo {
  taskId: string;
  status: string;
}

// ======================= API 函数 =======================

/** 开始录制任务 */
export function startRecording(data: StartRecordingReq) {
  return post<ResultVo<StartRecordingVo>>(
    "/recording/start",
    data as unknown as Record<string, unknown>
  );
}

/** 发送录制事件批次 */
export function sendEvents(data: RecordingEventsReq) {
  return post<ResultVo<ReceiveEventsVo>>(
    "/recording/events",
    data as unknown as Record<string, unknown>
  );
}

/** 停止录制任务 */
export function stopRecording(data: StopRecordingReq) {
  return post<ResultVo<StopRecordingVo>>(
    "/recording/stop",
    data as unknown as Record<string, unknown>
  );
}

/** 查询任务状态（返回详情含 errorMessage） */
export function getTaskStatus(taskId: string) {
  return get<ResultVo<RecordingTaskDetailVo>>(`/recording/status/${taskId}`);
}

/** 获取视频流 URL（用于 <video> src） */
export function getVideoStreamUrl(taskId: string): string {
  return `${import.meta.env.VITE_APP_BASE_URL}/recording/video/${taskId}`;
}

/** 获取录制任务列表（最近 50 条） */
export function getTaskList() {
  return get<ResultVo<RecordingTaskVo[]>>("/recording/list");
}

/** 发送压缩事件批次（gzip binary） */
export function sendCompressedEvents(
  taskId: string,
  batchIndex: number,
  compressedData: Uint8Array
) {
  return instance.post<ResultVo<ReceiveEventsVo>>(
    "/recording/events/compressed",
    compressedData,
    {
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Task-Id": taskId,
        "X-Batch-Index": String(batchIndex),
        "Content-Encoding": "gzip"
      }
    }
  );
}
