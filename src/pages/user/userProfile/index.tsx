import {
  CalendarOutlined,
  CloseOutlined,
  CommentOutlined,
  EditOutlined,
  FileTextOutlined,
  HeartOutlined,
  LockOutlined,
  MailOutlined,
  SaveOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import { App, Button, Form, Input } from "antd";
import { useCallback, useEffect, useState } from "react";

import { type UserVo, getSysUserById, updatePassword, updateUser } from "@/api/module/user";
import { useAuth } from "@/store/useAuth";

import "./index.scss";

const UserProfilePage: React.FC = () => {
  const { userInfo } = useAuth();
  const [userData, setUserData] = useState<UserVo | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { message } = App.useApp();

  const fetchUserInfo = useCallback(async () => {
    if (!userInfo?.id) return;
    try {
      const result = await getSysUserById(userInfo.id);
      if (result?.data) {
        setUserData(result.data);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err.message || "获取用户信息失败");
    }
  }, [userInfo]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const handleEdit = () => {
    if (userData) {
      form.setFieldsValue({
        nickname: userData.nickname,
        email: userData.email,
        avatarUrl: userData.avatarUrl
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
        avatarUrl: values.avatarUrl
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
        newPassword: values.newPassword
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

  const statsData = [
    { icon: <FileTextOutlined />, value: "128", label: "文章数", color: "#6366F1" },
    { icon: <CommentOutlined />, value: "2,456", label: "评论数", color: "#EC4899" },
    { icon: <HeartOutlined />, value: "8,920", label: "获赞数", color: "#EF4444" },
    { icon: <TeamOutlined />, value: "1,234", label: "关注者", color: "#10B981" }
  ];

  const activitiesData = [
    {
      icon: <FileTextOutlined style={{ color: "#6366F1" }} />,
      title: "发布了新文章",
      desc: "深入理解 React Hooks 原理",
      time: "2小时前",
      bg: "#EEF2FF"
    },
    {
      icon: <HeartOutlined style={{ color: "#EF4444" }} />,
      title: "收到了赞",
      desc: "你的文章被点赞 +10",
      time: "5小时前",
      bg: "#FEF2F2"
    },
    {
      icon: <CommentOutlined style={{ color: "#10B981" }} />,
      title: "新评论",
      desc: "用户对你的文章发表了评论",
      time: "昨天",
      bg: "#ECFDF5"
    },
    {
      icon: <SettingOutlined style={{ color: "#F59E0B" }} />,
      title: "更新了资料",
      desc: "修改了昵称和邮箱",
      time: "3天前",
      bg: "#FFFBEB"
    }
  ];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-wrapper">
            {userData?.avatarUrl ? (
              <img src={userData.avatarUrl} alt="avatar" className="profile-avatar" />
            ) : (
              <div className="profile-avatar-fallback">{getUserInitial()}</div>
            )}
            <span className="profile-status-badge">在线</span>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{userData?.nickname || userData?.username}</h1>
            <p className="profile-username">@{userData?.username}</p>
            <div className="profile-tags">
              <span className="profile-tag">管理员</span>
              <span className="profile-tag">VIP</span>
              <span className="profile-tag">活跃用户</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        {statsData.map((stat, index) => (
          <div className="profile-stat-card" key={index}>
            <div
              className="profile-stat-icon"
              style={{ background: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="profile-stat-value">{stat.value}</div>
            <div className="profile-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-title">
              <UserOutlined />
              基本资料
            </div>
            {!editing && (
              <Button type="primary" icon={<EditOutlined />} onClick={handleEdit} size="small">
                编辑
              </Button>
            )}
          </div>
          <div className="profile-card-body">
            {editing ? (
              <Form form={form} layout="vertical" className="edit-form">
                <Form.Item label="用户名">
                  <Input value={userData?.username} disabled />
                </Form.Item>
                <Form.Item
                  name="nickname"
                  label="昵称"
                  rules={[{ required: true, message: "请输入昵称" }]}
                >
                  <Input placeholder="请输入昵称" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: "请输入邮箱" },
                    { type: "email", message: "请输入有效的邮箱地址" }
                  ]}
                >
                  <Input placeholder="请输入邮箱" />
                </Form.Item>
                <Form.Item name="avatarUrl" label="头像 URL">
                  <Input placeholder="请输入头像 URL" />
                </Form.Item>
                <div className="action-buttons">
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSave}
                  >
                    保存
                  </Button>
                  <Button icon={<CloseOutlined />} onClick={handleCancel}>
                    取消
                  </Button>
                </div>
              </Form>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">用户名</span>
                  <span className="info-value">{userData?.username || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">昵称</span>
                  <span className="info-value">{userData?.nickname || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">邮箱</span>
                  <span className="info-value">
                    <MailOutlined />
                    {userData?.email || "-"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">头像 URL</span>
                  <span className={`info-value ${!userData?.avatarUrl ? "empty" : ""}`}>
                    {userData?.avatarUrl || "未设置"}
                  </span>
                </div>
                <div className="info-item full-width">
                  <span className="info-label">注册时间</span>
                  <span className="info-value">
                    <CalendarOutlined />
                    {userData?.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString("zh-CN")
                      : "-"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="profile-card" style={{ marginBottom: "var(--md-space-6)" }}>
            <div className="profile-card-header">
              <div className="profile-card-title">
                <LockOutlined />
                修改密码
              </div>
            </div>
            <div className="profile-card-body">
              <Form form={passwordForm} layout="vertical" className="password-form">
                <Form.Item
                  name="oldPassword"
                  label="旧密码"
                  rules={[{ required: true, message: "请输入旧密码" }]}
                >
                  <Input.Password placeholder="请输入旧密码" />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="新密码"
                  rules={[
                    { required: true, message: "请输入新密码" },
                    { min: 6, message: "密码长度不能少于6位" }
                  ]}
                >
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
                      }
                    })
                  ]}
                >
                  <Input.Password placeholder="请确认新密码" />
                </Form.Item>
                <Button
                  type="primary"
                  block
                  loading={passwordChanging}
                  onClick={handleChangePassword}
                >
                  修改密码
                </Button>
              </Form>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title">
                <CalendarOutlined />
                近期活动
              </div>
            </div>
            <div className="profile-card-body">
              <div className="activity-list">
                {activitiesData.map((activity, index) => (
                  <div className="activity-item" key={index}>
                    <div className="activity-icon" style={{ background: activity.bg }}>
                      {activity.icon}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-desc">{activity.desc}</div>
                    </div>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
