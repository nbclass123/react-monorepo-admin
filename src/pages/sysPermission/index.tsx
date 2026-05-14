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
  type SysPermissionReq,
  type SysPermissionVo,
  createPermission,
  deletePermission,
  getPermissionList,
  updatePermission
} from "@/api/module/sys-auth";
import { useList } from "@/hooks/useList";

import "./index.css";

const httpMethodColors: Record<string, string> = {
  GET: "green",
  POST: "blue",
  PUT: "orange",
  DELETE: "red"
};

const SysPermissionPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [modalData, setModalData] = useState<SysPermissionVo | null>(null);
  const [form] = Form.useForm();
  const { modal } = useApp();

  const { list, loading, page, size, total, refresh, search, reset, handlePageChange } =
    useList<SysPermissionVo>({ fetchFn: getPermissionList });

  const handleSearch = () => search(form.getFieldsValue());
  const handleReset = () => {
    form.resetFields();
    reset();
  };

  const openModal = (mode: "create" | "edit" | "view", record?: SysPermissionVo) => {
    setModalMode(mode);
    setModalData(record || null);
    setModalVisible(true);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
  };

  const handleDelete = (record: SysPermissionVo) => {
    modal.confirm({
      title: "确认删除",
      content: `确定要删除权限"${record.permissionName}"吗？`,
      okType: "danger",
      onOk: async () => {
        await deletePermission(record.id);
        message.success("删除成功");
        refresh();
      }
    });
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (modalMode === "create") await createPermission(values as SysPermissionReq);
    else await updatePermission({ ...values, id: modalData!.id });
    message.success(modalMode === "create" ? "创建成功" : "更新成功");
    setModalVisible(false);
    refresh();
  };

  return (
    <div className="page-enter">
      <div className="search-bar">
        <Form form={form} layout="inline" className="search-form">
          <Form.Item name="permissionName">
            <Input placeholder="权限名称" allowClear />
          </Form.Item>
          <Form.Item name="permissionCode">
            <Input placeholder="权限编码" allowClear />
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
          scroll={{ x: 1100 }}
          columns={[
            { title: "ID", dataIndex: "id", width: 60 },
            { title: "权限编码", dataIndex: "permissionCode", width: 150 },
            { title: "权限名称", dataIndex: "permissionName", width: 120 },
            { title: "分组", dataIndex: "permissionGroup", width: 100 },
            {
              title: "类型",
              dataIndex: "permissionType",
              width: 70,
              render: (v: number) => <Tag>{v === 1 ? "后台" : "前台"}</Tag>
            },
            {
              title: "接口路径",
              dataIndex: "apiPath",
              width: 180,
              ellipsis: true
            },
            {
              title: "请求方法",
              dataIndex: "httpMethod",
              width: 90,
              render: (v: string) => <Tag color={httpMethodColors[v] || "default"}>{v}</Tag>
            },
            {
              title: "状态",
              dataIndex: "status",
              width: 70,
              render: (s: number) => (
                <Tag color={s === 1 ? "green" : "red"}>{s === 1 ? "启用" : "禁用"}</Tag>
              )
            },
            {
              title: "操作",
              key: "action",
              fixed: "right",
              width: 300,
              render: (_: unknown, r: SysPermissionVo) => (
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
        title={modalMode === "create" ? "新增权限" : modalMode === "edit" ? "编辑权限" : "查看权限"}
        open={modalVisible}
        onOk={modalMode !== "view" ? handleModalOk : undefined}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" disabled={modalMode === "view"}>
          <Form.Item name="permissionCode" label="权限编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="permissionName" label="权限名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="permissionGroup" label="权限分组">
            <Input />
          </Form.Item>
          <Form.Item name="permissionType" label="权限类型" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "后台接口权限", value: 1 },
                { label: "前台操作权限", value: 2 }
              ]}
            />
          </Form.Item>
          <Form.Item name="apiPath" label="接口路径">
            <Input />
          </Form.Item>
          <Form.Item name="httpMethod" label="请求方法">
            <Select
              options={[
                { label: "GET", value: "GET" },
                { label: "POST", value: "POST" },
                { label: "PUT", value: "PUT" },
                { label: "DELETE", value: "DELETE" }
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
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

export default SysPermissionPage;
