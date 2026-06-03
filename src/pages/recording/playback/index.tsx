import { EyeOutlined, PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { App, Button, Descriptions, Drawer, Modal, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { type RecordingTaskVo, getTaskList, getVideoStreamUrl } from "@/api/module/recording";

import "./index.scss";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  RECORDING: { label: "录制中", color: "processing" },
  QUEUED: { label: "排队中", color: "warning" },
  PROCESSING: { label: "处理中", color: "blue" },
  COMPLETED: { label: "已完成", color: "success" },
  FAILED: { label: "失败", color: "error" }
};

// ======================= 视频播放 Modal (memo) =======================

const VideoPlayerModal = memo(function VideoPlayerModal({
  task,
  visible,
  onClose
}: {
  task: RecordingTaskVo | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!task) return null;

  return (
    <Modal
      title={`视频回放 - ${task.taskId.slice(0, 12)}...`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
    >
      {task.videoUrl ? (
        <video
          controls
          autoPlay
          style={{ width: "100%", borderRadius: 6 }}
          src={getVideoStreamUrl(task.taskId)}
        >
          您的浏览器不支持视频播放
        </video>
      ) : null}
      <Descriptions size="small" column={2} style={{ marginTop: 16 }}>
        <Descriptions.Item label="目标 URL">
          <span className="ellipsis-text">{task.targetUrl}</span>
        </Descriptions.Item>
        <Descriptions.Item label="事件数">{task.eventCount}</Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {new Date(task.createdAt).toLocaleString("zh-CN")}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
});

// ======================= 详情 Drawer (memo) =======================

const DetailDrawer = memo(function DetailDrawer({
  task,
  visible,
  onClose
}: {
  task: RecordingTaskVo | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!task) return null;
  const config = STATUS_MAP[task.status] || { label: task.status, color: "default" };

  return (
    <Drawer title="任务详情" open={visible} onClose={onClose} width={480} destroyOnHidden>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Task ID">
          <span className="task-id-text">{task.taskId}</span>
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={config.color}>{config.label}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="目标 URL">{task.targetUrl}</Descriptions.Item>
        <Descriptions.Item label="事件数">{task.eventCount}</Descriptions.Item>
        <Descriptions.Item label="视频 URL">
          {task.videoUrl ? (
            <a href={task.videoUrl} target="_blank" rel="noopener noreferrer">
              {task.videoUrl}
            </a>
          ) : (
            "-"
          )}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {new Date(task.createdAt).toLocaleString("zh-CN")}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
          {new Date(task.updatedAt).toLocaleString("zh-CN")}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
});

// ======================= 主页面 =======================

const RecordingPlaybackPage: React.FC = () => {
  const { message } = App.useApp();
  const [list, setList] = useState<RecordingTaskVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RecordingTaskVo | null>(null);
  const [videoVisible, setVideoVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const initializedRef = useRef(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTaskList();
      setList(result.data);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [message]);

  // 首次加载（ref guard 防止 StrictMode 双重挂载）
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    loadTasks();
  }, [loadTasks]);

  const handlePlay = (task: RecordingTaskVo) => {
    setSelectedTask(task);
    setVideoVisible(true);
  };

  const handleDetail = (task: RecordingTaskVo) => {
    setSelectedTask(task);
    setDetailVisible(true);
  };

  const columns: ColumnsType<RecordingTaskVo> = [
    {
      title: "Task ID",
      dataIndex: "taskId",
      key: "taskId",
      width: 200,
      ellipsis: true,
      render: (id: string) => (
        <span className="task-id-text" title={id}>
          {id.slice(0, 12)}...
        </span>
      )
    },
    {
      title: "目标 URL",
      dataIndex: "targetUrl",
      key: "targetUrl",
      width: 220,
      ellipsis: true
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const config = STATUS_MAP[status] || { label: status, color: "default" };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: "事件数",
      dataIndex: "eventCount",
      key: "eventCount",
      width: 90
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (v: string) => (v ? new Date(v).toLocaleString("zh-CN") : "-")
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_: unknown, record: RecordingTaskVo) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            disabled={record.status !== "COMPLETED"}
            onClick={() => handlePlay(record)}
          >
            播放
          </Button>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="content-area">
      <div className="search-bar">
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadTasks}>
            刷新列表
          </Button>
        </Space>
      </div>
      <div className="table-card">
        <Table
          dataSource={list}
          columns={columns}
          rowKey="taskId"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={false}
          locale={{ emptyText: "暂无录制任务" }}
        />
      </div>

      <VideoPlayerModal
        task={selectedTask}
        visible={videoVisible}
        onClose={() => setVideoVisible(false)}
      />
      <DetailDrawer
        task={selectedTask}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </div>
  );
};

export default RecordingPlaybackPage;
