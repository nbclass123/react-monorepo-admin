import { useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  message,
  Form,
  Select,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useList } from "@/hooks/useList";
import {
  getPostList,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  offlinePost,
  type BlogPostVo,
  type BlogPostReq,
} from "@/api/module/blog";
import "./index.css";

const statusMap: Record<number, { color: string; label: string }> = {
  0: { color: "default", label: "草稿" },
  1: { color: "green", label: "已发布" },
  2: { color: "orange", label: "已下线" },
};

const BlogPostPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [modalData, setModalData] = useState<BlogPostVo | null>(null);
  const [form] = Form.useForm();

  const {
    list,
    loading,
    page,
    size,
    total,
    refresh,
    search,
    reset,
    handlePageChange,
  } = useList<BlogPostVo>({ fetchFn: getPostList as any });

  const handleSearch = () => search(form.getFieldsValue());
  const handleReset = () => {
    form.resetFields();
    reset();
  };

  const openModal = (mode: "create" | "edit" | "view", record?: BlogPostVo) => {
    setModalMode(mode);
    setModalData(record || null);
    setModalVisible(true);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
  };

  const handleDelete = (record: BlogPostVo) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除文章"${record.title}"吗？`,
      okType: "danger",
      onOk: async () => {
        await deletePost(record.id);
        message.success("删除成功");
        refresh();
      },
    });
  };

  const handlePublish = async (id: number) => {
    await publishPost(id);
    message.success("发布成功");
    refresh();
  };
  const handleOffline = async (id: number) => {
    await offlinePost(id);
    message.success("已下线");
    refresh();
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (modalMode === "create") await createPost(values as BlogPostReq);
    else await updatePost({ ...values, id: modalData!.id });
    message.success(modalMode === "create" ? "创建成功" : "更新成功");
    setModalVisible(false);
    refresh();
  };

  const statTag = (s: number) => {
    const m = statusMap[s] || statusMap[0];
    return <Tag color={m.color}>{m.label}</Tag>;
  };

  return (
    <div className="page-enter">
      <div className="search-bar">
        <Form form={form} layout="inline" className="search-form">
          <Form.Item name="title">
            <Input placeholder="文章标题" allowClear />
          </Form.Item>
          <Form.Item name="status">
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 100 }}
              options={[
                { label: "草稿", value: 0 },
                { label: "已发布", value: 1 },
                { label: "已下线", value: 2 },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space className="search-buttons">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openModal("create")}>
                新增
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <div className="table-card">
        <Table
          dataSource={list}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          columns={[
            { title: "ID", dataIndex: "id", width: 60 },
            { title: "标题", dataIndex: "title", width: 200, ellipsis: true },
            { title: "分类ID", dataIndex: "categoryId", width: 80 },
            { title: "状态", dataIndex: "status", width: 80, render: statTag },
            {
              title: "置顶",
              dataIndex: "isTop",
              width: 70,
              render: (v: number) => (
                <Tag color={v ? "blue" : "default"}>{v ? "是" : "否"}</Tag>
              ),
            },
            {
              title: "发布时间",
              dataIndex: "publishedAt",
              width: 170,
              render: (v: string) =>
                v ? new Date(v).toLocaleString("zh-CN") : "-",
            },
            { title: "浏览", dataIndex: "viewCount", width: 80 },
            {
              title: "操作",
              key: "action",
              fixed: "right",
              width: 300,
              render: (_: unknown, r: BlogPostVo) => (
                <Space>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => openModal("view", r)}>
                    查看
                  </Button>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => openModal("edit", r)}>
                    编辑
                  </Button>
                  {r.status !== 1 && (
                    <Button
                      type="link"
                      icon={<SendOutlined />}
                      onClick={() => handlePublish(r.id)}>
                      发布
                    </Button>
                  )}
                  {r.status === 1 && (
                    <Button
                      type="link"
                      icon={<StopOutlined />}
                      onClick={() => handleOffline(r.id)}>
                      下线
                    </Button>
                  )}
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(r)}>
                    删除
                  </Button>
                </Space>
              ),
            },
          ]}
          pagination={{
            current: page,
            pageSize: size,
            total,
            showSizeChanger: true,
            showTotal: (t: number) => `共 ${t} 条`,
            onChange: handlePageChange,
          }}
        />
      </div>
      <Modal
        width={640}
        title={
          modalMode === "create"
            ? "新增文章"
            : modalMode === "edit"
              ? "编辑文章"
              : "查看文章"
        }
        open={modalVisible}
        onOk={modalMode !== "view" ? handleModalOk : undefined}
        onCancel={() => setModalVisible(false)}
        destroyOnClose>
        <Form form={form} layout="vertical" disabled={modalMode === "view"}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item name="coverUrl" label="封面URL">
            <Input />
          </Form.Item>
          <Form.Item
            name="authorId"
            label="作者ID"
            rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="categoryId" label="分类ID">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              options={[
                { label: "草稿", value: 0 },
                { label: "已发布", value: 1 },
                { label: "已下线", value: 2 },
              ]}
            />
          </Form.Item>
          <Form.Item name="isTop" label="是否置顶">
            <Select
              options={[
                { label: "否", value: 0 },
                { label: "是", value: 1 },
              ]}
            />
          </Form.Item>
          <Form.Item name="isCommentEnabled" label="允许评论">
            <Select
              options={[
                { label: "关闭", value: 0 },
                { label: "开启", value: 1 },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogPostPage;
