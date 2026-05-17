import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, Tag } from "antd";

import {
  type BlogCategoryReq,
  type BlogCategoryVo,
  createCategory,
  deleteCategory,
  getCategoryList,
  updateCategory
} from "@/api/module/blog";
import { useCrudWithForm } from "@/hooks/useCrud";
import { useList } from "@/hooks/useList";

import "./index.css";

const BlogCategoryPage = () => {
  const [form] = Form.useForm();
  const { list, loading, page, size, total, refresh, search, reset, handlePageChange } =
    useList<BlogCategoryVo>({ fetchFn: getCategoryList });

  const crud = useCrudWithForm<BlogCategoryVo, BlogCategoryReq, BlogCategoryReq>(form, {
    createApi: createCategory,
    updateApi: updateCategory,
    deleteApi: deleteCategory,
    onRefresh: refresh,
    deleteConfirm: {
      content: (record) => `确定要删除分类"${record.categoryName}"吗？`
    }
  });

  const handleSearch = () => search(form.getFieldsValue());
  const handleReset = () => {
    form.resetFields();
    reset();
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (crud.isCreate) {
      await crud.handleCreate(values);
    } else {
      await crud.handleUpdate({ ...values, id: crud.data!.id });
    }
  };

  return (
    <div className="page-enter">
      <div className="search-bar">
        <Form form={form} layout="inline" className="search-form">
          <Form.Item name="categoryName">
            <Input placeholder="分类名称" allowClear />
          </Form.Item>
          <Form.Item>
            <Space className="search-buttons">
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => crud.open("create")}>
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
            { title: "ID", dataIndex: "id", width: 80 },
            { title: "分类名称", dataIndex: "categoryName", width: 140 },
            { title: "别名", dataIndex: "categorySlug", width: 120 },
            { title: "排序", dataIndex: "sortOrder", width: 80 },
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
              width: 200,
              render: (_: unknown, r: BlogCategoryVo) => (
                <Space>
                  <Button type="link" icon={<EyeOutlined />} onClick={() => crud.open("view", r)}>
                    查看
                  </Button>
                  <Button type="link" icon={<EditOutlined />} onClick={() => crud.open("edit", r)}>
                    编辑
                  </Button>
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => crud.deleteWithConfirm(r)}
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
        title={crud.isCreate ? "新增分类" : crud.isEdit ? "编辑分类" : "查看分类"}
        open={crud.visible}
        onOk={crud.isView ? undefined : handleModalOk}
        onCancel={crud.close}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" disabled={crud.isView}>
          <Form.Item name="categoryName" label="分类名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categorySlug" label="分类别名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序值">
            <InputNumber min={0} style={{ width: "100%" }} />
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

export default BlogCategoryPage;
