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
import { Button, Drawer, Form, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import useApp from "antd/es/app/useApp";
import { useEffect, useState } from "react";

import {
  type BlogCategoryVo,
  type BlogPostReq,
  type BlogPostVo,
  type BlogTagVo,
  createPost,
  deletePost,
  getCategoryList,
  getPostList,
  getTagList,
  offlinePost,
  publishPost,
  updatePost
} from "@/api/module/blog";
import { useList } from "@/hooks/useList";

import "./index.css";

const statusMap: Record<number, { color: string; label: string }> = {
  0: { color: "default", label: "草稿" },
  1: { color: "green", label: "已发布" },
  2: { color: "orange", label: "已下线" }
};

const BlogPostPage = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [drawerData, setDrawerData] = useState<BlogPostVo | null>(null);
  const [form] = Form.useForm();

  const [categories, setCategories] = useState<BlogCategoryVo[]>([]);
  const [tags, setTags] = useState<BlogTagVo[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const { modal } = useApp();

  const { list, loading, page, size, total, refresh, search, reset, handlePageChange } =
    useList<BlogPostVo>({ fetchFn: getPostList as any });

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await getCategoryList({ page: 1, size: 100 });
      if (res?.data?.list) {
        setCategories(res.data.list);
      }
    } catch {
      message.error("获取分类列表失败");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const res = await getTagList({ page: 1, size: 100 });
      if (res?.data?.list) {
        setTags(res.data.list);
      }
    } catch {
      message.error("获取标签列表失败");
    } finally {
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const handleSearch = () => search(form.getFieldsValue());
  const handleReset = () => {
    form.resetFields();
    reset();
  };

  const openDrawer = (mode: "create" | "edit" | "view", record?: BlogPostVo) => {
    setDrawerMode(mode);
    setDrawerData(record || null);
    setDrawerVisible(true);

    if (record) {
      const formData = {
        ...record,
        tagIds: record.tagIds || []
      };
      form.setFieldsValue(formData);
    } else {
      form.resetFields();
    }
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

  const handleDrawerOk = async () => {
    const values = await form.validateFields();
    const submitData: BlogPostReq = {
      ...values
    };

    if (drawerMode === "create") {
      await createPost(submitData);
      message.success("创建成功");
    } else {
      await updatePost({ ...submitData, id: drawerData!.id });
      message.success("更新成功");
    }
    setDrawerVisible(false);
    refresh();
  };

  const statTag = (s: number) => {
    const m = statusMap[s] || statusMap[0];
    return <Tag color={m.color}>{m.label}</Tag>;
  };

  const isComplexMode = drawerMode !== "view";

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
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer("create")}>
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
                  <Button type="link" icon={<EyeOutlined />} onClick={() => openDrawer("view", r)}>
                    查看
                  </Button>
                  <Button type="link" icon={<EditOutlined />} onClick={() => openDrawer("edit", r)}>
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

      {isComplexMode ? (
        <Drawer
          title={drawerMode === "create" ? "新增文章" : "编辑文章"}
          placement="right"
          width={600}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          destroyOnHidden
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button onClick={() => setDrawerVisible(false)}>取消</Button>
              <Button type="primary" onClick={handleDrawerOk}>
                确定
              </Button>
            </div>
          }
        >
          <Form form={form} layout="vertical" preserve={false}>
            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: "请输入标题" }]}
            >
              <Input placeholder="请输入文章标题" />
            </Form.Item>

            <Form.Item
              name="summary"
              label="摘要"
              rules={[{ required: true, message: "请输入摘要" }]}
            >
              <Input.TextArea rows={3} placeholder="请输入文章摘要" />
            </Form.Item>

            <Form.Item
              name="categoryId"
              label="分类"
              rules={[{ required: true, message: "请选择分类" }]}
            >
              <Select
                placeholder="请选择分类"
                loading={loadingCategories}
                options={categories.map((c) => ({
                  key: c.id,
                  label: c.categoryName,
                  value: c.id
                }))}
              />
            </Form.Item>

            <Form.Item
              name="tagIds"
              label="标签"
              rules={[{ required: true, message: "请选择标签" }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择标签（可多选）"
                loading={loadingTags}
                options={tags.map((t) => ({
                  key: t.id,
                  label: t.tagName,
                  value: t.id
                }))}
              />
            </Form.Item>

            <Form.Item
              name="content"
              label="内容"
              rules={[{ required: true, message: "请输入内容" }]}
            >
              <Input.TextArea rows={8} placeholder="请输入文章内容" />
            </Form.Item>

            <Form.Item name="coverUrl" label="封面URL">
              <Input placeholder="请输入封面图片URL" />
            </Form.Item>

            <Form.Item name="isTop" label="是否置顶" initialValue={0}>
              <Select
                options={[
                  { label: "否", value: 0 },
                  { label: "是", value: 1 }
                ]}
              />
            </Form.Item>

            <Form.Item name="isCommentEnabled" label="允许评论" initialValue={1}>
              <Select
                options={[
                  { label: "关闭", value: 0 },
                  { label: "开启", value: 1 }
                ]}
              />
            </Form.Item>

            <Form.Item name="status" label="状态" initialValue={0}>
              <Select
                options={[
                  { label: "草稿", value: 0 },
                  { label: "已发布", value: 1 },
                  { label: "已下线", value: 2 }
                ]}
              />
            </Form.Item>
          </Form>
        </Drawer>
      ) : (
        <Modal
          title="查看文章"
          open={drawerVisible}
          onCancel={() => setDrawerVisible(false)}
          footer={
            <Button type="primary" onClick={() => setDrawerVisible(false)}>
              关闭
            </Button>
          }
          destroyOnHidden
          width={640}
        >
          <Form form={form} layout="vertical" disabled>
            <Form.Item name="title" label="标题">
              <Input />
            </Form.Item>

            <Form.Item name="summary" label="摘要">
              <Input.TextArea rows={2} />
            </Form.Item>

            <Form.Item name="categoryId" label="分类">
              <Select
                options={categories.map((c) => ({
                  key: c.id,
                  label: c.categoryName,
                  value: c.id
                }))}
              />
            </Form.Item>

            <Form.Item name="tagIds" label="标签">
              <Select mode="multiple" />
            </Form.Item>

            <Form.Item name="content" label="内容">
              <Input.TextArea rows={6} />
            </Form.Item>

            <Form.Item name="coverUrl" label="封面URL">
              <Input />
            </Form.Item>

            <Form.Item name="isTop" label="是否置顶">
              <Select
                options={[
                  { label: "否", value: 0 },
                  { label: "是", value: 1 }
                ]}
              />
            </Form.Item>

            <Form.Item name="isCommentEnabled" label="允许评论">
              <Select
                options={[
                  { label: "关闭", value: 0 },
                  { label: "开启", value: 1 }
                ]}
              />
            </Form.Item>

            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { label: "草稿", value: 0 },
                  { label: "已发布", value: 1 },
                  { label: "已下线", value: 2 }
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default BlogPostPage;
