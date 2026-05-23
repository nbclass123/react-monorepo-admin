import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { type LoginVo, login } from "@/api/module/user";
import SvgIcon from "@/components/SvgIcon";
import { useAuth } from "@/store/useAuth";

import "./index.scss";

type FieldType = {
  username: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAction } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: FieldType) => {
    setLoading(true);
    try {
      const result: { code: number; message: string; data: LoginVo } = await login(values);
      await loginAction(result.data.token, result.data.id);
      message.success("登录成功");
      navigate("/userList", { replace: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.warning("登录失败：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* 浮动圆形背景 */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* 几何形状装饰 */}
      <div className="geometric-shapes">
        <div className="geom-shape geom-1"></div>
        <div className="geom-shape geom-2"></div>
        <div className="geom-shape geom-3"></div>
      </div>

      <div className="login-card">
        <div className="login-brand">
          <SvgIcon name="fanqie" className="login-brand-icon" />
        </div>
        <h1 className="login-title">欢迎回来</h1>
        <p className="login-subtitle">登录您的账户以继续</p>
        <Form onFinish={onFinish} autoComplete="off" disabled={loading}>
          <Form.Item<FieldType>
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>

          <Form.Item<FieldType> name="password" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <div className="login-options">
            <Checkbox>记住我</Checkbox>
            <a className="login-forgot" href="#">
              忘记密码？
            </a>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="login-submit-btn"
            >
              {loading ? "登录中..." : "登 录"}
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="login-footer">© 2026 App. All rights reserved.</div>
    </div>
  );
};

export default LoginPage;
