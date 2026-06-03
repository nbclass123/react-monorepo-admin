/**
 * 上传测试页面
 *
 * 提供三种上传模式的测试 Demo:
 * 1. 图片上传 — jpg/png/gif/webp, 最大 20MB
 * 2. 文件上传 — pdf/doc/xls/zip/txt/mp4, 最大 200MB
 * 3. 大文件分片上传 — 支持断点续传/暂停恢复, 默认 5MB/片
 *
 * 后端: hy-upload NestJS 服务
 */
import {
  CheckCircleOutlined,
  CloudUploadOutlined,
  FileImageOutlined,
  FileOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import { App, Button, Card, Divider, Image, Progress, Space, Table, Tabs, Tag, Upload } from "antd";
import type { UploadFile } from "antd/es/upload";
import { useState } from "react";

import { useChunkedUpload } from "@/hooks/useChunkedUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useImageUpload } from "@/hooks/useImageUpload";

import "./index.scss";

// ======================= 图片上传 Demo =======================

function ImageUploadDemo() {
  const { message } = App.useApp();
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { upload, uploading, error } = useImageUpload({
    onSuccess: (res) => {
      setResult(res);
      message.success(`图片上传成功: ${res.filename}`);
    },
    onError: (err) => message.error(err.message)
  });

  const handleUpload = async (file: File) => {
    setResult(null);
    setFileList([{ uid: "-1", name: file.name, status: "uploading" }]);
    await upload(file);
    setFileList([{ uid: "-1", name: file.name, status: "done" }]);
    return false; // 阻止 antd Upload 默认上传行为
  };

  return (
    <Card
      title={
        <>
          <FileImageOutlined /> 图片上传测试
        </>
      }
      className="upload-demo-card"
    >
      <div className="demo-description">
        <Tag color="blue">jpg</Tag>
        <Tag color="blue">png</Tag>
        <Tag color="blue">gif</Tag>
        <Tag color="blue">webp</Tag>
        <span className="demo-limit">单文件最大 20MB</span>
      </div>

      <Upload.Dragger
        accept=".jpg,.jpeg,.png,.gif,.webp"
        maxCount={1}
        fileList={fileList}
        beforeUpload={handleUpload}
        showUploadList={{ showPreviewIcon: false }}
        disabled={uploading}
      >
        <p className="upload-icon">
          <CloudUploadOutlined />
        </p>
        <p className="upload-text">点击或拖拽图片文件到此区域</p>
        <p className="upload-hint">支持 jpg / png / gif / webp</p>
      </Upload.Dragger>

      {uploading && <Progress percent={50} status="active" style={{ marginTop: 16 }} />}
      {error && <div className="upload-error">{error}</div>}

      {result && (
        <div className="upload-result">
          <Divider />
          <p>
            <CheckCircleOutlined style={{ color: "#10B981" }} /> 上传成功
          </p>
          <p>文件名: {result.filename}</p>
          <p>
            URL:{" "}
            <a href={result.url} target="_blank" rel="noopener noreferrer">
              {result.url}
            </a>
          </p>
          <Image
            src={result.url}
            alt={result.filename}
            style={{ maxWidth: 300, marginTop: 8 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
          />
        </div>
      )}
    </Card>
  );
}

// ======================= 文件上传 Demo =======================

function FileUploadDemo() {
  const { message } = App.useApp();
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { upload, uploading, error } = useFileUpload({
    onSuccess: (res) => {
      setResult(res);
      message.success(`文件上传成功: ${res.filename}`);
    },
    onError: (err) => message.error(err.message)
  });

  const handleUpload = async (file: File) => {
    setResult(null);
    setFileList([{ uid: "-1", name: file.name, status: "uploading" }]);
    await upload(file);
    setFileList([{ uid: "-1", name: file.name, status: "done" }]);
    return false;
  };

  return (
    <Card
      title={
        <>
          <FileOutlined /> 文件上传测试
        </>
      }
      className="upload-demo-card"
    >
      <div className="demo-description">
        <Tag color="purple">pdf</Tag>
        <Tag color="purple">doc/docx</Tag>
        <Tag color="purple">xls/xlsx</Tag>
        <Tag color="purple">zip</Tag>
        <Tag color="purple">txt</Tag>
        <Tag color="purple">mp4</Tag>
        <span className="demo-limit">单文件最大 200MB</span>
      </div>

      <Upload.Dragger
        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,.mp4"
        maxCount={1}
        fileList={fileList}
        beforeUpload={handleUpload}
        showUploadList={{ showPreviewIcon: false }}
        disabled={uploading}
      >
        <p className="upload-icon">
          <CloudUploadOutlined />
        </p>
        <p className="upload-text">点击或拖拽文件到此区域</p>
        <p className="upload-hint">支持 pdf / doc / xls / zip / txt / mp4</p>
      </Upload.Dragger>

      {uploading && <Progress percent={60} status="active" style={{ marginTop: 16 }} />}
      {error && <div className="upload-error">{error}</div>}

      {result && (
        <div className="upload-result">
          <Divider />
          <p>
            <CheckCircleOutlined style={{ color: "#10B981" }} /> 上传成功
          </p>
          <p>文件名: {result.filename}</p>
          <p>
            URL:{" "}
            <a href={result.url} target="_blank" rel="noopener noreferrer">
              {result.url}
            </a>
          </p>
        </div>
      )}
    </Card>
  );
}

// ======================= 大文件分片上传 Demo =======================

/** 分片状态颜色映射 */
const CHUNK_COLORS: Record<string, string> = {
  pending: "var(--md-border-color)",
  uploading: "#6366F1",
  done: "#10B981",
  skipped: "#10B981"
};

function ChunkedUploadDemo() {
  const { message } = App.useApp();
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { upload, pause, resume, uploading, paused, progress, chunkStatusMap, stage, error } =
    useChunkedUpload({
      onSuccess: (res) => {
        setResult(res);
        message.success(`大文件上传成功: ${res.filename}`);
      },
      onError: (err) => message.error(err.message)
    });

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    setResult(null);
    await upload(selectedFile);
  };

  const chunkEntries = Array.from(chunkStatusMap.entries()).sort((a, b) => a[0] - b[0]);

  // 进度表格列
  const chunkColumns = [
    { title: "分片序号", dataIndex: "chunkIndex", key: "chunkIndex", width: 100 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const statusLabels: Record<string, { label: string; color: string }> = {
          pending: { label: "待上传", color: "default" },
          uploading: { label: "上传中", color: "processing" },
          done: { label: "已完成", color: "success" },
          skipped: { label: "已跳过", color: "success" }
        };
        const s = statusLabels[status] || { label: status, color: "default" };
        return <Tag color={s.color}>{s.label}</Tag>;
      }
    }
  ];

  return (
    <Card
      title={
        <>
          <ThunderboltOutlined /> 大文件分片上传测试
        </>
      }
      className="upload-demo-card"
    >
      <div className="demo-description">
        <Tag color="orange">任意类型</Tag>
        <Tag color="orange">分片 5MB</Tag>
        <Tag color="orange">并发 3</Tag>
        <span className="demo-limit">支持断点续传 + 秒传</span>
      </div>

      {/* 文件选择 */}
      <div className="chunk-file-select">
        <Button
          icon={<FileOutlined />}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                setSelectedFile(file);
                setResult(null);
              }
            };
            input.click();
          }}
          disabled={uploading}
        >
          选择文件
        </Button>
        {selectedFile && (
          <span className="chunk-file-info">
            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </span>
        )}
      </div>

      {/* 操作按钮 */}
      {selectedFile && (
        <Space style={{ marginTop: 16, marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={handleStartUpload}
            loading={stage === "md5"}
            disabled={uploading && !paused}
          >
            {stage === "md5" ? "计算MD5..." : uploading ? "上传中..." : "开始上传"}
          </Button>
          {uploading && !paused && (
            <Button icon={<PauseCircleOutlined />} onClick={pause} danger>
              暂停
            </Button>
          )}
          {paused && (
            <Button icon={<PlayCircleOutlined />} onClick={resume} type="primary">
              继续上传
            </Button>
          )}
        </Space>
      )}

      {/* 进度信息 */}
      {stage !== "idle" && (
        <div className="chunk-progress-info">
          <div className="chunk-progress-stage">
            当前阶段:{" "}
            <Tag>
              {stage === "md5"
                ? "MD5 计算"
                : stage === "uploading"
                  ? "分片上传"
                  : stage === "merging"
                    ? "合并分片"
                    : stage === "done"
                      ? "完成"
                      : stage === "paused"
                        ? "已暂停"
                        : stage}
            </Tag>
          </div>
          <Progress
            percent={progress}
            status={paused ? "exception" : progress === 100 ? "success" : "active"}
          />
          {error && <div className="upload-error">{error}</div>}
        </div>
      )}

      {/* 分片状态网格 */}
      {chunkEntries.length > 0 && (
        <>
          <Divider>分片状态 ({chunkEntries.length} 片)</Divider>
          <Table
            dataSource={chunkEntries.map(([idx, status]) => ({
              key: idx,
              chunkIndex: idx,
              status
            }))}
            columns={chunkColumns}
            size="small"
            pagination={false}
            scroll={{ y: 200 }}
          />
          {/* 分片颜色网格（紧凑视图） */}
          <div className="chunk-grid" style={{ marginTop: 12 }}>
            {chunkEntries.map(([idx, status]) => (
              <div
                key={idx}
                className={`chunk-grid-item chunk-${status}`}
                title={`分片 ${idx}: ${status}`}
                style={{ backgroundColor: CHUNK_COLORS[status] }}
              />
            ))}
          </div>
        </>
      )}

      {/* 结果 */}
      {result && (
        <div className="upload-result">
          <Divider />
          <p>
            <CheckCircleOutlined style={{ color: "#10B981" }} /> 上传成功
          </p>
          <p>文件名: {result.filename}</p>
          <p>
            URL:{" "}
            <a href={result.url} target="_blank" rel="noopener noreferrer">
              {result.url}
            </a>
          </p>
        </div>
      )}
    </Card>
  );
}

// ======================= 上传测试主页面 =======================

const UploadTestPage: React.FC = () => {
  const tabItems = [
    {
      key: "image",
      label: (
        <span>
          <FileImageOutlined /> 图片上传
        </span>
      ),
      children: <ImageUploadDemo />
    },
    {
      key: "file",
      label: (
        <span>
          <FileOutlined /> 文件上传
        </span>
      ),
      children: <FileUploadDemo />
    },
    {
      key: "chunk",
      label: (
        <span>
          <ThunderboltOutlined /> 大文件分片上传
        </span>
      ),
      children: <ChunkedUploadDemo />
    }
  ];

  return (
    <div className="upload-test-page">
      <div className="page-header">
        <h2>
          <CloudUploadOutlined /> 上传服务测试
        </h2>
        <p>测试 hy-upload 后端服务的图片上传、文件上传、大文件分片上传功能</p>
      </div>
      <Tabs defaultActiveKey="image" items={tabItems} size="large" />
    </div>
  );
};

export default UploadTestPage;
