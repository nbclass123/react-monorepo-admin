import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Descriptions,
  message,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/store/useAuth";
import {
  getSysUserById,
  updateUser,
  updatePassword,
  type UserVo,
} from "@/api/module/user";
import PageHeader from "@/components/PageHeader/index";

const UserProfilePage: React.FC = () => {
  const { userInfo } = useAuth();
  const [userData, setUserData] = useState<UserVo | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const fetchUserInfo = async () => {
    if (!userInfo?.id) return;
    setLoading(true);
    try {
      const result = await getSysUserById(userInfo.id);
      if (result?.data) {
        setUserData(result.data);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err.message || "获取用户信息失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.id]);

  const handleEdit = () => {
    if (userData) {
      form.setFieldsValue({
        nickname: userData.nickname,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
      });
    }
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!userData) return;
      setSaving(true);
      await updateUser({
        id: userData.id,
        nickname: values.nickname,
        email: values.email,
        avatarUrl: values.avatarUrl,
      });
      message.success("保存成功");
      setEditing(false);
      await fetchUserInfo();
    } catch (err) {
      if (err && typeof err === "object" && "errorFields" in err) return;
      message.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (!userData) return;
      setPasswordChanging(true);
      await updatePassword({
        id: userData.id,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("密码修改成功");
      passwordForm.resetFields();
    } catch (err) {
      if (err && typeof err === "object" && "errorFields" in err) return;
      message.error("密码修改失败");
    } finally {
      setPasswordChanging(false);
    }
  };

  const getUserInitial = (): string => {
    if (userData?.nickname) return userData.nickname.charAt(0).toUpperCase();
    if (userData?.username) return userData.username.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div>
      <PageHeader title="用户信息" />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <Card
          title="基本资料"
          loading={loading}
          style={{ flex: 1, minWidth: 400 }}
          extra={
            editing ? (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                  style={{ marginRight: 8 }}>
                  保存
                </Button>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  取消
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}>
                编辑
              </Button>
            )
          }>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 24,
            }}>
            <Avatar
              size={80}
              src={userData?.avatarUrl || undefined}
              style={{
                backgroundColor: !userData?.avatarUrl ? "#1890ff" : undefined,
              }}>
              {!userData?.avatarUrl ? getUserInitial() : null}
            </Avatar>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {userData?.nickname || userData?.username}
              </div>
              <div style={{ color: "#999" }}>{userData?.username}</div>
            </div>
          </div>

          {editing ? (
            <Form form={form} layout="vertical">
              <Form.Item label="用户名">
                <Input value={userData?.username} disabled />
              </Form.Item>
              <Form.Item
                name="nickname"
                label="昵称"
                rules={[{ required: true, message: "请输入昵称" }]}>
                <Input placeholder="请输入昵称" />
              </Form.Item>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: "请输入邮箱" },
                  { type: "email", message: "请输入有效的邮箱地址" },
                ]}>
                <Input placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item name="avatarUrl" label="头像 URL">
                <Input placeholder="请输入头像 URL" />
              </Form.Item>
            </Form>
          ) : (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="用户名">
                {userData?.username}
              </Descriptions.Item>
              <Descriptions.Item label="昵称">
                {userData?.nickname}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {userData?.email}
              </Descriptions.Item>
              <Descriptions.Item label="头像 URL">
                {userData?.avatarUrl || "-"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>

        <Card title="修改密码" style={{ width: 380 }}>
          <Form form={passwordForm} layout="vertical">
            <Form.Item
              name="oldPassword"
              label="旧密码"
              rules={[{ required: true, message: "请输入旧密码" }]}>
              <Input.Password placeholder="请输入旧密码" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: "请输入新密码" },
                { min: 6, message: "密码长度不能少于6位" },
              ]}>
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "请确认新密码" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次输入的密码不一致"));
                  },
                }),
              ]}>
              <Input.Password placeholder="请确认新密码" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                block
                loading={passwordChanging}
                onClick={handleChangePassword}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;
