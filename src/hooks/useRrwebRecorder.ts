import { useCallback, useRef, useState } from "react";

import { sendEvents } from "@/api/module/recording";

interface UseRrwebRecorderOptions {
  /** 缓冲区事件数阈值，超过后自动上传最早的一批，默认 5000 */
  maxEventsLength?: number;
  /** 定时兜底 flush 间隔 (ms)，默认 120000 (2 分钟) */
  flushInterval?: number;
  /** 单次上传最大事件数，避免 JSON 序列化阻塞，默认 500 */
  maxBatchSize?: number;
  onError?: (error: Error) => void;
}

interface UseRrwebRecorderReturn {
  start: (taskId: string) => Promise<void>;
  stop: () => Promise<void>;
  recording: boolean;
  eventCount: number;
  batchCount: number;
  elapsed: number;
}

export function useRrwebRecorder(options: UseRrwebRecorderOptions = {}): UseRrwebRecorderReturn {
  const { maxEventsLength = 5000, flushInterval = 120000, maxBatchSize = 500, onError } = options;

  const [recording, setRecording] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [batchCount, setBatchCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const eventsRef = useRef<Record<string, unknown>[]>([]);
  const eventCountRef = useRef(0);
  const batchCountRef = useRef(0);
  const batchIndexRef = useRef(0);
  const taskIdRef = useRef<string | null>(null);
  const stopFnRef = useRef<(() => void) | null | undefined>(null);
  const sendingRef = useRef(false);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const clearTimers = useCallback(() => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  /** 发送单批事件 */
  const uploadBatch = useCallback(
    async (events: Record<string, unknown>[], taskId: string, idx: number): Promise<boolean> => {
      try {
        await sendEvents({ taskId, batchIndex: idx, events });
        batchCountRef.current++;
        return true;
      } catch (err: any) {
        onError?.(err);
        return false;
      }
    },
    [onError]
  );

  /** 分批次发送事件，每批最多 maxBatchSize 条 */
  const uploadEvents = useCallback(
    async (events: Record<string, unknown>[], taskId: string): Promise<void> => {
      let offset = 0;
      while (offset < events.length) {
        const batch = events.slice(offset, offset + maxBatchSize);
        const idx = batchIndexRef.current++;
        const ok = await uploadBatch(batch, taskId, idx);
        if (!ok) break; // 失败丢弃后续，防止无限重试
        offset += maxBatchSize;
      }
    },
    [maxBatchSize, uploadBatch]
  );

  /** 缓冲区超阈值时，上传最早的 maxEventsLength 条 */
  const trimEventsIfNeeded = useCallback(
    async (taskId: string) => {
      if (sendingRef.current || eventsRef.current.length <= maxEventsLength) return;
      sendingRef.current = true;
      try {
        const eventsToUpload = eventsRef.current.splice(0, maxEventsLength);
        await uploadEvents(eventsToUpload, taskId);
      } finally {
        sendingRef.current = false;
      }
    },
    [maxEventsLength, uploadEvents]
  );

  /** 定时兜底：flush 所有剩余事件 */
  const flushRemaining = useCallback(
    async (taskId: string) => {
      if (sendingRef.current || eventsRef.current.length === 0) return;
      sendingRef.current = true;
      try {
        const remaining = eventsRef.current.splice(0);
        await uploadEvents(remaining, taskId);
      } finally {
        sendingRef.current = false;
      }
    },
    [uploadEvents]
  );

  const start = useCallback(
    async (taskId: string) => {
      // 防止重复启动
      if (stopFnRef.current) return;
      taskIdRef.current = taskId;
      eventsRef.current = [];
      eventCountRef.current = 0;
      batchCountRef.current = 0;
      batchIndexRef.current = 0;
      startTimeRef.current = Date.now();

      setEventCount(0);
      setBatchCount(0);
      setElapsed(0);
      setRecording(true);

      // 动态加载 rrweb
      const rrweb = await import("rrweb");
      stopFnRef.current = rrweb.record({
        emit(event) {
          eventsRef.current.push(event as unknown as Record<string, unknown>);
          eventCountRef.current++;
          // 每次事件后检查阈值
          trimEventsIfNeeded(taskId);
        },
        sampling: {
          mousemove: true,
          mousemoveCallback: 500,
          scroll: 150
        }
      });

      // 定时兜底 flush（默认 120s）
      flushTimerRef.current = setInterval(() => {
        if (taskIdRef.current) flushRemaining(taskIdRef.current);
      }, flushInterval);

      // UI 刷新定时器（仅显示，不触发上传）
      elapsedTimerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        setEventCount(eventCountRef.current);
        setBatchCount(batchCountRef.current);
      }, 1000);
    },
    [flushInterval, trimEventsIfNeeded, flushRemaining]
  );

  const stop = useCallback(async () => {
    const taskId = taskIdRef.current;
    if (!taskId) return;

    // 1. 停止 rrweb
    stopFnRef.current?.();
    stopFnRef.current = null;

    // 2. 同步最终计数
    setEventCount(eventCountRef.current);
    setRecording(false);

    // 3. 清除定时器
    clearTimers();

    // 4. 发送剩余事件
    await flushRemaining(taskId);

    taskIdRef.current = null;
  }, [clearTimers, flushRemaining]);

  return { start, stop, recording, eventCount, batchCount, elapsed };
}
