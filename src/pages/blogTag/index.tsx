import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import useApp from "antd/es/app/useApp";
import { useState } from "react";

import {
  type BlogTagReq,
  type BlogTagVo,
  createTag,
  deleteTag,
  getTagList,
  updateTag
} from "@/api/module/blog";
import { useList } from "@/hooks/useList";

import "./index.css";

const BlogTagPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [modalData, setModalData] = useState<BlogTagVo | null>(null);
  const [form] = Form.useForm();
  const { modal } = useApp();

  const { list, loading, page, size, total, refresh, search, reset, handlePageChange } =
    useList<BlogTagVo>({ fetchFn: getTagList });

  const handleSearch = () => search(form.getFieldsValue());
  const handleReset = () => {
    form.resetFields();
    reset();
  };

  const openModal = (mode: "create" | "edit" | "view", record?: BlogTagVo) => {
    setModalMode(mode);
    setModalData(record || null);
    setModalVisible(true);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
  };

  const handleDelete = (record: BlogTagVo) => {
    modal.confirm({
      title: "确认删除",
      content: `确定要删除标签"${record.tagName}"吗？`,
      okType: "danger",
      onOk: async () => {
        await deleteTag(record.id);
        message.success("删除成功");
        refresh();
      }
    });
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (modalMode === "create") await createTag(values as BlogTagReq);
    else await updateTag({ ...values, id: modalData!.id });
    message.success(modalMode === "create" ? "创建成功" : "更新成功");
    setModalVisible(false);
    refresh();
  };

  return (
    <div className="page-enter">
      <div className="search-bar">
        <Form form={form} layout="inline" className="search-form">
          <Form.Item name="tagName">
            <Input placeholder="标签名称" allowClear />
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
          scroll={{ x: 700 }}
          columns={[
            { title: "ID", dataIndex: "id", width: 80 },
            { title: "标签名称", dataIndex: "tagName", width: 140 },
            { title: "别名", dataIndex: "tagSlug", width: 120 },
            {
              title: "状态",
              dataIndex: "status",
              width: 80,
              render: (s: number) => (
                <Tag color={s === 1 ? "green" : "red"}>{s === 1 ? "启用" : "禁用"}</Tag>
              )
            },
            {
              title: "创建时间",
              dataIndex: "createdAt",
              width: 170,
              render: (v: string) => (v ? new Date(v).toLocaleString("zh-CN") : "-")
            },
            {
              title: "操作",
              key: "action",
              fixed: "right",
              width: 180,
              render: (_: unknown, r: BlogTagVo) => (
                <Space>
                  <Button type="link" icon={<EyeOutlined />} onClick={() => openModal("view", r)}>
                    查看
                  </Button>
                  <Button type="link" icon={<EditOutlined />} onClick={() => openModal("edit", r)}>
                    编辑
                  </Button>
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
      <Modal
        title={modalMode === "create" ? "新增标签" : modalMode === "edit" ? "编辑标签" : "查看标签"}
        open={modalVisible}
        onOk={modalMode !== "view" ? handleModalOk : undefined}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" disabled={modalMode === "view"}>
          <Form.Item name="tagName" label="标签名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tagSlug" label="标签别名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              options={[
                { label: "启用", value: 1 },
                { label: "禁用", value: 0 }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogTagPage;
