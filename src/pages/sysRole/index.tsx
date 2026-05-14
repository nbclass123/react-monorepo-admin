import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, message } from "antd";
import useApp from "antd/es/app/useApp";
import { useState } from "react";

import {
  type SysRoleReq,
  type SysRoleVo,
  createRole,
  deleteRole,
  getRoleList,
  updateRole
} from "@/api/module/sys-auth";
import { useList } from "@/hooks/useList";

import "./index.css";

const SysRolePage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [modalData, setModalData] = useState<SysRoleVo | null>(null);
  const [form] = Form.useForm();
  const { modal } = useApp();

  const { list, loading, page, size, total, refresh, search, reset, handlePageChange } =
    useList<SysRoleVo>({ fetchFn: getRoleList });

  const handleSearch = () => search(form.getFieldsValue());
  const handleReset = () => {
    form.resetFields();
    reset();
  };

  const openModal = (mode: "create" | "edit" | "view", record?: SysRoleVo) => {
    setModalMode(mode);
    setModalData(record || null);
    setModalVisible(true);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
  };

  const handleDelete = (record: SysRoleVo) => {
    modal.confirm({
      title: "确认删除",
      content: `确定要删除角色"${record.roleName}"吗？`,
      okType: "danger",
      onOk: async () => {
        await deleteRole(record.id);
        message.success("删除成功");
        refresh();
      }
    });
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (modalMode === "create") await createRole(values as SysRoleReq);
    else await updateRole({ ...values, id: modalData!.id });
    message.success(modalMode === "create" ? "创建成功" : "更新成功");
    setModalVisible(false);
    refresh();
  };

  return (
    <div className="page-enter">
      <div className="search-bar">
        <Form form={form} layout="inline" className="search-form">
          <Form.Item name="roleName">
            <Input placeholder="角色名称" allowClear />
          </Form.Item>
          <Form.Item name="roleCode">
            <Input placeholder="角色编码" allowClear />
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
          scroll={{ x: 1000 }}
          columns={[
            { title: "ID", dataIndex: "id", width: 60 },
            { title: "角色编码", dataIndex: "roleCode", width: 130 },
            { title: "角色名称", dataIndex: "roleName", width: 130 },
            { title: "排序", dataIndex: "roleSort", width: 70 },
            {
              title: "系统内置",
              dataIndex: "isSystem",
              width: 80,
              render: (v: number) => <Tag color={v ? "blue" : "default"}>{v ? "是" : "否"}</Tag>
            },
            {
              title: "状态",
              dataIndex: "status",
              width: 70,
              render: (s: number) => (
                <Tag color={s === 1 ? "green" : "red"}>{s === 1 ? "启用" : "禁用"}</Tag>
              )
            },
            { title: "备注", dataIndex: "remark", width: 150, ellipsis: true },
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
              width: 250,
              render: (_: unknown, r: SysRoleVo) => (
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
        title={modalMode === "create" ? "新增角色" : modalMode === "edit" ? "编辑角色" : "查看角色"}
        open={modalVisible}
        onOk={modalMode !== "view" ? handleModalOk : undefined}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" disabled={modalMode === "view"}>
          <Form.Item name="roleCode" label="角色编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleName" label="角色名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "启用", value: 1 },
                { label: "禁用", value: 0 }
              ]}
            />
          </Form.Item>
          <Form.Item name="roleSort" label="排序值">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="isSystem" label="是否系统内置">
            <Select
              options={[
                { label: "否", value: 0 },
                { label: "是", value: 1 }
              ]}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SysRolePage;
