import { useState } from "react";
import { Table, Button, Input, Space, Tag, Modal, message, Form, InputNumber, Select } from "antd";
import { PlusOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useList } from "@/hooks/useList";
import { getCategoryList, createCategory, updateCategory, deleteCategory, type BlogCategoryVo, type BlogCategoryReq } from "@/api/module/blog";
import "./index.css";

const BlogCategoryPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [modalData, setModalData] = useState<BlogCategoryVo | null>(null);
  const [form] = Form.useForm();

  const { list, loading, page, size, total, refresh, search, reset, handlePageChange } = useList<BlogCategoryVo>({ fetchFn: getCategoryList });

  const handleSearch = () => search(form.getFieldsValue());
  const handleReset = () => { form.resetFields(); reset(); };

  const openModal = (mode: "create" | "edit" | "view", record?: BlogCategoryVo) => {
    setModalMode(mode);
    setModalData(record || null);
    setModalVisible(true);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
  };

  const handleDelete = (record: BlogCategoryVo) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除分类"${record.categoryName}"吗？`,
      okType: "danger",
      onOk: async () => { await deleteCategory(record.id); message.success("删除成功"); refresh(); },
    });
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (modalMode === "create") await createCategory(values as BlogCategoryReq);
    else await updateCategory({ ...values, id: modalData!.id });
    message.success(modalMode === "create" ? "创建成功" : "更新成功");
    setModalVisible(false);
    refresh();
  };

  return (
    <div className="page-enter">
      <div className="search-bar">
        <Form form={form} layout="inline" className="search-form">
          <Form.Item name="categoryName"><Input placeholder="分类名称" allowClear /></Form.Item>
          <Form.Item><Space className="search-buttons">
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal("create")}>新增</Button>
          </Space></Form.Item>
        </Form>
      </div>
      <div className="table-card">
        <Table dataSource={list} rowKey="id" loading={loading} scroll={{ x: 800 }}
          columns={[
            { title: "ID", dataIndex: "id", width: 80 },
            { title: "分类名称", dataIndex: "categoryName", width: 140 },
            { title: "别名", dataIndex: "categorySlug", width: 120 },
            { title: "排序", dataIndex: "sortOrder", width: 80 },
            { title: "状态", dataIndex: "status", width: 80, render: (s: number) => <Tag color={s === 1 ? "green" : "red"}>{s === 1 ? "启用" : "禁用"}</Tag> },
            { title: "创建时间", dataIndex: "createdAt", width: 170, render: (v: string) => v ? new Date(v).toLocaleString("zh-CN") : "-" },
            { title: "操作", key: "action", fixed: "right", width: 180, render: (_: unknown, r: BlogCategoryVo) => (
              <Space>
                <Button type="link" icon={<EyeOutlined />} onClick={() => openModal("view", r)}>查看</Button>
                <Button type="link" icon={<EditOutlined />} onClick={() => openModal("edit", r)}>编辑</Button>
                <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)}>删除</Button>
              </Space>
            )},
          ]}
          pagination={{ current: page, pageSize: size, total, showSizeChanger: true, showTotal: (t: number) => `共 ${t} 条`, onChange: handlePageChange }} />
      </div>
      <Modal title={modalMode === "create" ? "新增分类" : modalMode === "edit" ? "编辑分类" : "查看分类"} open={modalVisible} onOk={modalMode !== "view" ? handleModalOk : undefined} onCancel={() => setModalVisible(false)} destroyOnClose>
        <Form form={form} layout="vertical" disabled={modalMode === "view"}>
          <Form.Item name="categoryName" label="分类名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="categorySlug" label="分类别名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="sortOrder" label="排序值"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="status" label="状态"><Select options={[{ label: "启用", value: 1 }, { label: "禁用", value: 0 }]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogCategoryPage;
