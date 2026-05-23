import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { App, Button, Form, Input, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import { type UserVo, activateUser, deleteUser, freezeUser, getUserList } from "@/api/module/user";
import UserModal from "@/components/UserModal/index";
import { useList } from "@/hooks/useList";

import "./index.scss";

const UserListPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [modalData, setModalData] = useState<UserVo | null>(null);
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();

  const columns: ColumnsType<UserVo> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 120
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      key: "nickname",
      width: 120
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 180
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? "green" : "red"}>{status === 1 ? "正常" : "禁用"}</Tag>
      )
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (createdAt: string) => (createdAt ? new Date(createdAt).toLocaleString("zh-CN") : "-")
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 200,
      render: (_: unknown, record: UserVo) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" icon={<DeleteOutlined />} onClick={() => handleStatus(record)}>
            {record.status === 1 ? "禁用" : "启用"}
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const { list, loading, page, size, total, refresh, search, reset, handlePageChange } =
    useList<UserVo>({
      fetchFn: getUserList
    });

  const handleSearch = () => {
    const values = form.getFieldsValue();
    search(values);
  };

  const handleReset = () => {
    form.resetFields();
    reset();
  };

  const handleAdd = () => {
    setModalMode("create");
    setModalData(null);
    setModalVisible(true);
  };

  const handleView = (record: UserVo) => {
    setModalMode("view");
    setModalData(record);
    setModalVisible(true);
  };

  const handleEdit = (record: UserVo) => {
    setModalMode("edit");
    setModalData(record);
    setModalVisible(true);
  };

  const handleDelete = (record: UserVo) => {
    modal.confirm({
      title: "确认删除",
      content: `确定要删除用户"${record.username}"吗？`,
      okText: "确认",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        await deleteUser(record.id);
        message.success("删除成功");
        refresh();
      }
    });
  };

  const handleStatus = (record: UserVo) => {
    modal.confirm({
      title: "确认操作",
      content: `确定要${record.status === 1 ? "禁用" : "启用"}用户"${record.username}"吗？`,
      okText: "确认",
      cancelText: "取消",
      onOk: async () => {
        if (record.status === 1) {
          await freezeUser(record.id);
        } else {
          await activateUser(record.id);
        }
        message.success(record.status === 1 ? "禁用成功" : "启用成功");
        refresh();
      }
    });
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    refresh();
  };

  return (
    <div className="content-area">
      <div className="search-bar">
        <Form form={form} layout="inline" className="search-form">
          <Form.Item name="username">
            <Input placeholder="用户名" allowClear />
          </Form.Item>
          <Form.Item name="nickname">
            <Input placeholder="昵称" allowClear />
          </Form.Item>
          <Form.Item name="email">
            <Input placeholder="邮箱" allowClear />
          </Form.Item>
          <Form.Item>
            <Space className="search-buttons">
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <div className="table-card">
        <Table
          dataSource={list}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize: size,
            total,
            showSizeChanger: true,
            showTotal: (total: number) => `共 ${total} 条`,
            pageSizeOptions: [10, 20, 50, 100],
            onChange: handlePageChange
          }}
        />
      </div>
      <UserModal
        visible={modalVisible}
        mode={modalMode}
        data={modalData}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default UserListPage;
