import { Form, Input, Modal, message } from "antd";
import { type ReactNode, useEffect } from "react";

import {
  type RegisterReq,
  type UpdateUserReq,
  type UserVo,
  register,
  updateUser
} from "@/api/module/user";

import "./index.scss";

interface UserModalProps {
  visible: boolean;
  mode: "create" | "edit" | "view";
  data: UserVo | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserModal = ({ visible, mode, data, onClose, onSuccess }: UserModalProps): ReactNode => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (data && (mode === "edit" || mode === "view")) {
        form.setFieldsValue({
          ...data,
          status: data.status === 1 ? "正常" : "禁用"
        });
      }
    }
  }, [visible, mode, data, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (mode === "create") {
        await register(values as RegisterReq);
      } else if (mode === "edit") {
        await updateUser({ id: data!.id, ...values } as UpdateUserReq);
      }
      message.success(mode === "create" ? "新增成功" : "编辑成功");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { errorFields?: unknown; msg?: string; message?: string };
      if (err.errorFields) {
        return;
      }
      message.warning(err.msg || err.message);
    }
  };

  const isView = mode === "view";

  const titleMap = {
    create: "新增用户",
    edit: "编辑用户",
    view: "查看用户"
  };

  return (
    <Modal
      title={titleMap[mode]}
      open={visible}
      onOk={isView ? undefined : () => form.submit()}
      onCancel={onClose}
      okText={isView ? undefined : "确定"}
      cancelText="取消"
      footer={isView ? (_, { CancelBtn }) => <CancelBtn /> : undefined}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {mode === "create" && (
          <>
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          </>
        )}

        {mode === "view" && (
          <>
            <Form.Item name="id" label="ID">
              <Input disabled />
            </Form.Item>
            <Form.Item name="username" label="用户名">
              <Input disabled />
            </Form.Item>
          </>
        )}

        <Form.Item name="nickname" label="昵称">
          <Input disabled={isView} placeholder="请输入昵称" />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[{ type: "email", message: "请输入正确的邮箱格式" }]}
        >
          <Input disabled={isView} placeholder="请输入邮箱" />
        </Form.Item>

        {mode === "view" && (
          <>
            <Form.Item name="status" label="状态">
              <Input disabled />
            </Form.Item>
            <Form.Item name="createdAt" label="创建时间">
              <Input disabled />
            </Form.Item>
            <Form.Item name="updatedAt" label="更新时间">
              <Input disabled />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default UserModal;
