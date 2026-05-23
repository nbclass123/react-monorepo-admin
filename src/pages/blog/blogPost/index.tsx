import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  StopOutlined
} from "@ant-design/icons";
import { App, Button, Form, Input, Select, Space, Table, Tag } from "antd";
import { useState } from "react";

import {
  type BlogPostVo,
  deletePost,
  getPostList,
  offlinePost,
  publishPost
} from "@/api/module/blog";
import { useList } from "@/hooks/useList";

import PostModal from "./components/PostModal";
import "./index.scss";

const statusMap: Record<number, { color: string; label: string }> = {
  0: { color: "default", label: "草稿" },
  1: { color: "green", label: "已发布" },
  2: { color: "orange", label: "已下线" }
};

const BlogPostPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [modalData, setModalData] = useState<BlogPostVo | null>(null);
  const [searchForm] = Form.useForm();

  const { message, modal } = App.useApp();

  const { list, loading, page, size, total, refresh, search, reset, handlePageChange } =
    useList<BlogPostVo>({ fetchFn: getPostList as any });

  const handleSearch = () => search(searchForm.getFieldsValue());
  const handleReset = () => {
    searchForm.resetFields();
    reset();
  };

  const openModal = (mode: "create" | "edit" | "view", record?: BlogPostVo) => {
    setModalMode(mode);
    setModalData(record || null);
    setModalVisible(true);
  };

  const handleDelete = (record: BlogPostVo) => {
    modal.confirm({
      title: "确认删除",
      content: `确定要删除文章"${record.title}"吗？`,
      okType: "danger",
      onOk: async () => {
        await deletePost(record.id);
        message.success("删除成功");
        refresh();
      }
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

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleModalSuccess = () => {
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
        <Form form={searchForm} layout="inline" className="search-form">
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
                { label: "已下线", value: 2 }
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space className="search-buttons">
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal("create")}>
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
          scroll={{ x: "max-content" }}
          columns={[
            { title: "ID", dataIndex: "id", width: 60 },
            { title: "标题", dataIndex: "title", width: 200, ellipsis: true },
            { title: "分类ID", dataIndex: "categoryId", width: 80 },
            { title: "状态", dataIndex: "status", width: 80, render: statTag },
            {
              title: "置顶",
              dataIndex: "isTop",
              width: 70,
              render: (v: number) => <Tag color={v ? "blue" : "default"}>{v ? "是" : "否"}</Tag>
            },
            {
              title: "发布时间",
              dataIndex: "publishedAt",
              width: 170,
              render: (v: string) => (v ? new Date(v).toLocaleString("zh-CN") : "-")
            },
            { title: "浏览", dataIndex: "viewCount", width: 80 },
            {
              title: "操作",
              key: "action",
              fixed: "right",
              width: 300,
              render: (_: unknown, r: BlogPostVo) => (
                <Space>
                  <Button type="link" icon={<EyeOutlined />} onClick={() => openModal("view", r)}>
                    查看
                  </Button>
                  <Button type="link" icon={<EditOutlined />} onClick={() => openModal("edit", r)}>
                    编辑
                  </Button>
                  {r.status !== 1 && (
                    <Button type="link" icon={<SendOutlined />} onClick={() => handlePublish(r.id)}>
                      发布
                    </Button>
                  )}
                  {r.status === 1 && (
                    <Button type="link" icon={<StopOutlined />} onClick={() => handleOffline(r.id)}>
                      下线
                    </Button>
                  )}
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(r)}
                  >
                    删除
                  </Button>
                </Space>
              )
            }
          ]}
          pagination={{
            current: page,
            pageSize: size,
            total,
            showSizeChanger: true,
            showTotal: (t: number) => `共 ${t} 条`,
            onChange: handlePageChange
          }}
        />
      </div>

      <PostModal
        visible={modalVisible}
        mode={modalMode}
        data={modalData}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default BlogPostPage;
