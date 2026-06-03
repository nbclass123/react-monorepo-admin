import {
  LoadingOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  VideoCameraOutlined
} from "@ant-design/icons";
import { App, Button, Card, Descriptions, Form, Input, InputNumber, Select, Slider, Steps, Tabs, Tag } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  type RecordingTaskDetailVo,
  getTaskStatus,
  startRecording,
  stopRecording
} from "@/api/module/recording";
import { useRrwebRecorder } from "@/hooks/useRrwebRecorder";

import "./index.scss";

// ======================= 状态映射 =======================

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  RECORDING: { label: "录制中", color: "processing" },
  QUEUED: { label: "排队中", color: "warning" },
  PROCESSING: { label: "处理中", color: "blue" },
  COMPLETED: { label: "已完成", color: "success" },
  FAILED: { label: "失败", color: "error" }
};

const STATUS_STEPS = [
  { title: "录制中", status: "process" as const },
  { title: "排队中", status: "wait" as const },
  { title: "处理中", status: "wait" as const },
  { title: "完成", status: "wait" as const }
];

function getStepIndex(status: string): number {
  const map: Record<string, number> = { RECORDING: 0, QUEUED: 1, PROCESSING: 2, COMPLETED: 3 };
  return map[status] ?? -1;
}

function getCurrentStep(status: string) {
  const idx = getStepIndex(status);
  if (idx < 0) return STATUS_STEPS;
  return STATUS_STEPS.map((step, i) => ({
    ...step,
    status: i < idx ? ("finish" as const) : i === idx ? ("process" as const) : ("wait" as const)
  }));
}

// ======================= Tab 1: 后端录制 =======================

function BackendRecordingTab() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<RecordingTaskDetailVo | null>(null);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    (id: string) => {
      clearPolling();
      pollingRef.current = setInterval(async () => {
        try {
          const result = await getTaskStatus(id);
          setTaskStatus(result.data);
          const status = result.data.status;
          if (status === "COMPLETED" || status === "FAILED") {
            clearPolling();
            if (status === "COMPLETED") {
              message.success("视频生成完成");
            } else {
              message.error(`录制失败: ${result.data.errorMessage || "未知错误"}`);
            }
          }
        } catch {
          clearPolling();
        }
      }, 2000);
    },
    [clearPolling, message]
  );

  useEffect(() => {
    return clearPolling;
  }, [clearPolling]);

  const handleStart = async () => {
    try {
      const values = await form.validateFields();
      setStarting(true);
      const result = await startRecording(values);
      const id = result.data.taskId;
      setTaskId(id);
      setTaskStatus(null);
      message.success(`录制任务已创建: ${id}`);
      pollStatus(id);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    } finally {
      setStarting(false);
    }
  };

  const handleStop = async () => {
    if (!taskId) return;
    try {
      setStopping(true);
      await stopRecording({ taskId });
      message.info("已停止录制，任务进入队列");
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    } finally {
      setStopping(false);
    }
  };

  const isActive = taskStatus
    ? taskStatus.status !== "COMPLETED" && taskStatus.status !== "FAILED"
    : taskId !== null;

  return (
    <div className="recording-tab">
      <Card title="录制参数配置" className="recording-card">
        <Form form={form} layout="vertical" initialValues={{ duration: 30, quality: "high", fps: 10 }}>
          <Form.Item
            name="targetUrl"
            label="目标 URL"
            rules={[
              { required: true, message: "请输入目标 URL" },
              { type: "url", message: "请输入有效的 URL" }
            ]}
          >
            <Input placeholder="https://example.com" disabled={isActive} />
          </Form.Item>
          <Form.Item name="duration" label={`录制时长 (秒)`}>
            <InputNumber min={5} max={300} style={{ width: "100%" }} disabled={isActive} />
          </Form.Item>
          <Form.Item name="quality" label="画质">
            <Select
              disabled={isActive}
              options={[
                { label: "高画质", value: "high" },
                { label: "中等", value: "medium" },
                { label: "低画质", value: "low" }
              ]}
            />
          </Form.Item>
          <Form.Item name="fps" label={`帧率 (FPS)`}>
            <Slider min={1} max={30} disabled={isActive} />
          </Form.Item>
          <Form.Item>
            {isActive ? (
              <Button
                type="primary"
                danger
                icon={<StopOutlined />}
                onClick={handleStop}
                loading={stopping}
              >
                停止录制
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<VideoCameraOutlined />}
                onClick={handleStart}
                loading={starting}
              >
                开始录制
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>

      {taskId ? <StatusDisplay taskId={taskId} taskStatus={taskStatus} /> : null}
    </div>
  );
}

/** 状态展示卡片 */
function StatusDisplay({
  taskId,
  taskStatus
}: {
  taskId: string;
  taskStatus: RecordingTaskDetailVo | null;
}) {
  const status = taskStatus?.status || "RECORDING";
  const config = STATUS_CONFIG[status] || { label: status, color: "default" };

  return (
    <Card title="录制状态" className="recording-card">
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Task ID">
          <span className="task-id-text">{taskId}</span>
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={config.color}>{config.label}</Tag>
        </Descriptions.Item>
        {taskStatus?.targetUrl ? (
          <Descriptions.Item label="目标 URL" span={2}>
            {taskStatus.targetUrl}
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label="事件数">
          {taskStatus?.eventCount ?? 0}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {taskStatus?.createdAt
            ? new Date(taskStatus.createdAt).toLocaleString("zh-CN")
            : "-"}
        </Descriptions.Item>
      </Descriptions>

      <div className="status-steps">
        <Steps
          current={getStepIndex(status)}
          items={getCurrentStep(status)}
          size="small"
        />
      </div>

      {status === "FAILED" && taskStatus?.errorMessage ? (
        <div className="status-error">
          错误信息: {taskStatus.errorMessage}
        </div>
      ) : null}
    </Card>
  );
}

// ======================= Tab 2: 前端录制 =======================

function FrontendRecordingTab() {
  const { message } = App.useApp();
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<RecordingTaskDetailVo | null>(null);
  const [stopping, setStopping] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recorder = useRrwebRecorder({
    onError: (err) => message.error(err.message)
  });

  const startPolling = useCallback(
    (id: string) => {
      pollingRef.current = setInterval(async () => {
        try {
          const result = await getTaskStatus(id);
          setTaskStatus(result.data);
          if (result.data.status === "COMPLETED" || result.data.status === "FAILED") {
            if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
            if (result.data.status === "COMPLETED") {
              message.success("视频生成完成");
            } else {
              message.error(`录制失败: ${result.data.errorMessage || "未知错误"}`);
            }
          }
        } catch {
          if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
        }
      }, 2000);
    },
    [message]
  );

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    };
  }, []);

  const handleStart = async () => {
    try {
      const result = await startRecording({
        targetUrl: window.location.href,
        duration: 60,
        quality: "high",
        fps: 10
      });
      const id = result.data.taskId;
      setTaskId(id);
      setTaskStatus(null);
      setStopping(false);
      await recorder.start(id);
      message.success("前端录制已开始");
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleStop = async () => {
    if (!taskId) return;
    setStopping(true);
    try {
      await recorder.stop();
      await stopRecording({ taskId });
      setTaskStatus(null);
      message.info("已停止录制，任务进入队列");
      startPolling(taskId);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    } finally {
      setStopping(false);
    }
  };

  const isComplete = taskStatus?.status === "COMPLETED";
  const isFailed = taskStatus?.status === "FAILED";
  const showStatus = taskStatus && !recorder.recording && !stopping;

  return (
    <div className="recording-tab frontend-recording">
      <Card className="recording-card">
        <div className="frontend-recording-area">
          {recorder.recording || stopping ? (
            <>
              <div className="recording-indicator">
                {stopping ? (
                  <LoadingOutlined style={{ fontSize: 16, color: "#faad14" }} />
                ) : (
                  <span className="pulse-dot" />
                )}
                <span className="recording-text">
                  {stopping ? "正在停止..." : "录制中"}
                </span>
              </div>
              <div className="recording-stats">
                <div className="stat-item">
                  <span className="stat-label">已录制</span>
                  <span className="stat-value">{recorder.elapsed}s</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">事件数</span>
                  <span className="stat-value">{recorder.eventCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">已发送批次</span>
                  <span className="stat-value">{recorder.batchCount}</span>
                </div>
              </div>
              <Button
                type="primary"
                danger
                size="large"
                icon={stopping ? <LoadingOutlined /> : <PauseCircleOutlined />}
                onClick={handleStop}
                loading={stopping}
                disabled={stopping}
              >
                {stopping ? "正在停止..." : "停止录制"}
              </Button>
            </>
          ) : showStatus ? (
            <StatusDisplay taskId={taskId!} taskStatus={taskStatus} />
          ) : (
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={handleStart}
            >
              开始录制
            </Button>
          )}

          {isComplete && taskStatus?.videoUrl ? (
            <div className="video-link">
              <a href={taskStatus.videoUrl} target="_blank" rel="noopener noreferrer">
                查看视频
              </a>
            </div>
          ) : null}
          {isFailed && taskStatus?.errorMessage ? (
            <div className="status-error">
              错误信息: {taskStatus.errorMessage}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

// ======================= 主页面 =======================

const RecordingManagePage: React.FC = () => {
  const tabItems = [
    {
      key: "backend",
      label: (
        <span>
          <VideoCameraOutlined /> 后端录制
        </span>
      ),
      children: <BackendRecordingTab />
    },
    {
      key: "frontend",
      label: (
        <span>
          <PlayCircleOutlined /> 前端录制
        </span>
      ),
      children: <FrontendRecordingTab />
    }
  ];

  return (
    <div className="recording-manage-page">
      <div className="page-header">
        <h2>
          <VideoCameraOutlined /> 录制管理
        </h2>
        <p>管理浏览器会话录制任务，支持后端自动录制和前端手动录制</p>
      </div>
      <Tabs defaultActiveKey="backend" items={tabItems} size="large" />
    </div>
  );
};

export default RecordingManagePage;
