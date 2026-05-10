import { useState, useEffect, useCallback } from "react";
import { Table, Button, Input, Space, Tag, Modal, message, Form } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getUserList,
  deleteUser,
  type UserListReq,
  type UserVo,
} from "@/api/module/user";
import UserModal from "@/components/UserModal/index";
import "./index.css";

const UserListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<UserVo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchParams, setSearchParams] = useState<{
    username?: string;
    nickname?: string;
    email?: string;
  }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [modalData, setModalData] = useState<UserVo | null>(null);

  const [form] = Form.useForm();

  const fetchList = useCallback(async (params: UserListReq) => {
    setLoading(true);
    try {
      const result = await getUserList(params);
      setList(result.data.list);
      setTotal(result.data.total);
      setPage(result.data.page);
      setSize(result.data.size);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList({ page: 1, size: 10 });
  }, [fetchList]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setSearchParams(values);
    fetchList({ page: 1, size, ...values });
  };

  const handleReset = () => {
    form.resetFields();
    setSearchParams({});
    fetchList({ page: 1, size: 10 });
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
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除用户"${record.username}"吗？`,
      okText: "确认",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        await deleteUser(record.id);
        message.success("删除成功");
        fetchList({ page, size, ...searchParams });
      },
    });
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    fetchList({ page, size, ...searchParams });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 120,
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      key: "nickname",
      width: 120,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 180,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? "green" : "red"}>
          {status === 1 ? "正常" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (createdAt: string) =>
        createdAt ? new Date(createdAt).toLocaleString("zh-CN") : "-",
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_: unknown, record: UserVo) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}>
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

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
                onClick={handleAdd}>
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
          pagination={{
            current: page,
            pageSize: size,
            total,
            showSizeChanger: true,
            showTotal: (total: number) => `共 ${total} 条`,
            onChange: (newPage: number, newSize: number) => {
              fetchList({ page: newPage, size: newSize, ...searchParams });
            },
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
